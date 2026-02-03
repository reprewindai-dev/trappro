/**
 * Global Audio Analysis Engine
 * Analyzes input audio without making changes
 * Feeds analysis data to all presets
 */

export class AudioAnalysis {
  constructor(audioContext, sampleRate) {
    this.audioContext = audioContext;
    this.sampleRate = sampleRate;
    this.analysisData = null;
  }

  /**
   * Perform complete analysis pass on audio buffer
   */
  async analyze(audioBuffer) {
    const samples = audioBuffer.getChannelData(0);
    const length = samples.length;
    
    // Calculate integrated LUFS (simplified EBU R128)
    const integratedLUFS = this.calculateLUFS(samples);
    
    // Calculate short-term LUFS (400ms windows)
    const shortTermLUFS = this.calculateShortTermLUFS(samples);
    
    // Dynamic range / crest factor
    const { dynamicRange, crestFactor } = this.calculateDynamicRange(samples);
    
    // Spectral balance
    const spectralBalance = this.calculateSpectralBalance(audioBuffer);
    
    // Vocal dominance (1-4 kHz presence)
    const vocalDominance = this.calculateVocalDominance(audioBuffer);
    
    // Harshness zones (2.5-6 kHz)
    const harshness = this.calculateHarshness(audioBuffer);
    
    // Mud zones (150-350 Hz)
    const mud = this.calculateMud(audioBuffer);
    
    // Bass stability (30-120 Hz)
    const bassStability = this.calculateBassStability(audioBuffer);
    
    // Stereo correlation / mono safety
    const stereoCorrelation = audioBuffer.numberOfChannels > 1 
      ? this.calculateStereoCorrelation(audioBuffer)
      : { correlation: 1.0, monoSafe: true };
    
    this.analysisData = {
      integratedLUFS,
      shortTermLUFS,
      dynamicRange,
      crestFactor,
      spectralBalance,
      vocalDominance,
      harshness,
      mud,
      bassStability,
      stereoCorrelation,
      sampleRate: this.sampleRate,
      duration: audioBuffer.duration,
      channels: audioBuffer.numberOfChannels
    };
    
    return this.analysisData;
  }

  /**
   * Calculate integrated LUFS using EBU R128 pre-filtering
   */
  calculateLUFS(samples) {
    // Simplified LUFS calculation
    // Full implementation would use proper K-weighting filter
    let sumSquared = 0;
    const length = samples.length;
    
    for (let i = 0; i < length; i++) {
      const sample = samples[i];
      sumSquared += sample * sample;
    }
    
    const rms = Math.sqrt(sumSquared / length);
    const lufs = rms > 0 ? -0.691 + 10 * Math.log10(rms) : -70;
    
    return Math.max(-70, Math.min(0, lufs));
  }

  /**
   * Calculate short-term LUFS (400ms windows)
   */
  calculateShortTermLUFS(samples) {
    const windowSize = Math.floor(this.sampleRate * 0.4); // 400ms
    const windows = [];
    
    for (let i = 0; i < samples.length; i += windowSize) {
      const window = samples.slice(i, Math.min(i + windowSize, samples.length));
      windows.push(this.calculateLUFS(window));
    }
    
    return {
      average: windows.reduce((a, b) => a + b, 0) / windows.length,
      min: Math.min(...windows),
      max: Math.max(...windows),
      windows
    };
  }

  /**
   * Calculate dynamic range and crest factor
   */
  calculateDynamicRange(samples) {
    let sumSquared = 0;
    let peak = 0;
    
    for (let i = 0; i < samples.length; i++) {
      const abs = Math.abs(samples[i]);
      sumSquared += samples[i] * samples[i];
      peak = Math.max(peak, abs);
    }
    
    const rms = Math.sqrt(sumSquared / samples.length);
    const crestFactor = peak > 0 ? peak / rms : 0;
    const dynamicRange = peak > 0 ? 20 * Math.log10(peak / rms) : 0;
    
    return { dynamicRange, crestFactor };
  }

  /**
   * Calculate spectral balance (low/mid/high)
   */
  calculateSpectralBalance(audioBuffer) {
    const fftSize = 2048;
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    const nyquist = this.sampleRate / 2;
    const binWidth = nyquist / analyser.frequencyBinCount;
    
    let low = 0, mid = 0, high = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const freq = i * binWidth;
      const magnitude = dataArray[i] / 255;
      
      if (freq < 250) {
        low += magnitude;
      } else if (freq < 4000) {
        mid += magnitude;
      } else {
        high += magnitude;
      }
    }
    
    const total = low + mid + high;
    
    return {
      low: total > 0 ? low / total : 0.33,
      mid: total > 0 ? mid / total : 0.33,
      high: total > 0 ? high / total : 0.33
    };
  }

  /**
   * Calculate vocal dominance (1-4 kHz presence)
   */
  calculateVocalDominance(audioBuffer) {
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    const nyquist = this.sampleRate / 2;
    const binWidth = nyquist / analyser.frequencyBinCount;
    
    let vocalRange = 0;
    let total = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const freq = i * binWidth;
      const magnitude = dataArray[i] / 255;
      
      total += magnitude;
      if (freq >= 1000 && freq <= 4000) {
        vocalRange += magnitude;
      }
    }
    
    return total > 0 ? vocalRange / total : 0;
  }

  /**
   * Calculate harshness in 2.5-6 kHz zone
   */
  calculateHarshness(audioBuffer) {
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    const nyquist = this.sampleRate / 2;
    const binWidth = nyquist / analyser.frequencyBinCount;
    
    let harshRange = 0;
    let total = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const freq = i * binWidth;
      const magnitude = dataArray[i] / 255;
      
      total += magnitude;
      if (freq >= 2500 && freq <= 6000) {
        harshRange += magnitude;
      }
    }
    
    return total > 0 ? harshRange / total : 0;
  }

  /**
   * Calculate mud in 150-350 Hz zone
   */
  calculateMud(audioBuffer) {
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    const nyquist = this.sampleRate / 2;
    const binWidth = nyquist / analyser.frequencyBinCount;
    
    let mudRange = 0;
    let total = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const freq = i * binWidth;
      const magnitude = dataArray[i] / 255;
      
      total += magnitude;
      if (freq >= 150 && freq <= 350) {
        mudRange += magnitude;
      }
    }
    
    return total > 0 ? mudRange / total : 0;
  }

  /**
   * Calculate bass stability (30-120 Hz)
   */
  calculateBassStability(audioBuffer) {
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    const nyquist = this.sampleRate / 2;
    const binWidth = nyquist / analyser.frequencyBinCount;
    
    let bassRange = 0;
    let total = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const freq = i * binWidth;
      const magnitude = dataArray[i] / 255;
      
      total += magnitude;
      if (freq >= 30 && freq <= 120) {
        bassRange += magnitude;
      }
    }
    
    return total > 0 ? bassRange / total : 0;
  }

  /**
   * Calculate stereo correlation
   */
  calculateStereoCorrelation(audioBuffer) {
    if (audioBuffer.numberOfChannels < 2) {
      return { correlation: 1.0, monoSafe: true };
    }
    
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    const length = Math.min(left.length, right.length);
    
    let sumL = 0, sumR = 0, sumLR = 0, sumL2 = 0, sumR2 = 0;
    
    for (let i = 0; i < length; i++) {
      sumL += left[i];
      sumR += right[i];
      sumLR += left[i] * right[i];
      sumL2 += left[i] * left[i];
      sumR2 += right[i] * right[i];
    }
    
    const correlation = (length * sumLR - sumL * sumR) / 
      Math.sqrt((length * sumL2 - sumL * sumL) * (length * sumR2 - sumR * sumR));
    
    const monoSafe = correlation > 0.3; // Safe threshold for mono compatibility
    
    return { correlation: isNaN(correlation) ? 1.0 : correlation, monoSafe };
  }

  getAnalysis() {
    return this.analysisData;
  }
}
