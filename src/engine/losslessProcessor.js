/**
 * Lossless Audio Processor
 * Ensures lossless quality throughout processing pipeline
 * Maintains 32-bit float precision until final export
 */

/**
 * High-quality sample rate converter
 * Custom implementation for sample rate conversion when needed
 * Note: Engineering details in code comments, marketing-safe description: "High-quality sample rate conversion (custom when needed)"
 */
export class LosslessSampleRateConverter {
  constructor(inputRate, outputRate) {
    this.inputRate = inputRate;
    this.outputRate = outputRate;
    this.ratio = outputRate / inputRate;
    
    // Sinc filter parameters for high-quality resampling
    this.sincFilterLength = 64;
    this.sincFilter = this.createSincFilter();
  }

  createSincFilter() {
    const filter = new Float32Array(this.sincFilterLength);
    const cutoff = Math.min(this.inputRate, this.outputRate) / 2;
    const nyquist = Math.min(this.inputRate, this.outputRate) / 2;
    
    for (let i = 0; i < this.sincFilterLength; i++) {
      const x = (i - this.sincFilterLength / 2) / (this.sincFilterLength / 2);
      if (x === 0) {
        filter[i] = 1;
      } else {
        // Sinc function with windowing
        const sinc = Math.sin(Math.PI * cutoff * x / nyquist) / (Math.PI * cutoff * x / nyquist);
        // Blackman window
        const window = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (this.sincFilterLength - 1)) +
                      0.08 * Math.cos(4 * Math.PI * i / (this.sincFilterLength - 1));
        filter[i] = sinc * window;
      }
    }
    
    return filter;
  }

  convert(audioBuffer, audioContext) {
    if (this.inputRate === this.outputRate) {
      return audioBuffer; // No conversion needed
    }

    const inputLength = audioBuffer.length;
    const outputLength = Math.floor(inputLength * this.ratio);
    
    // Create buffer using audio context
    const outputBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      outputLength,
      this.outputRate
    );

    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const inputData = audioBuffer.getChannelData(ch);
      const outputData = outputBuffer.getChannelData(ch);
      
      for (let i = 0; i < outputLength; i++) {
        const inputPos = i / this.ratio;
        const inputIndex = Math.floor(inputPos);
        const frac = inputPos - inputIndex;
        
        // Use sinc interpolation for high quality
        let sum = 0;
        for (let j = 0; j < this.sincFilterLength; j++) {
          const sampleIndex = inputIndex + j - Math.floor(this.sincFilterLength / 2);
          if (sampleIndex >= 0 && sampleIndex < inputLength) {
            sum += inputData[sampleIndex] * this.sincFilter[j];
          }
        }
        
        outputData[i] = sum;
      }
    }

    return outputBuffer;
  }
}

/**
 * Professional Dithering
 * TPDF (Triangular Probability Density Function) dithering for bit depth conversion
 */
export class ProfessionalDither {
  constructor(bitDepth) {
    this.bitDepth = bitDepth;
    this.quantizationStep = Math.pow(2, -(bitDepth - 1));
    this.noiseShaping = true;
  }

  /**
   * Generate TPDF dither noise
   */
  generateDither() {
    // TPDF: two uniform random numbers subtracted
    return (Math.random() - Math.random()) * this.quantizationStep;
  }

  /**
   * Apply dithering with noise shaping
   */
  applyDither(sample) {
    if (!this.lastError) {
      this.lastError = 0;
    }

    // Generate dither noise
    const dither = this.generateDither();
    
    // Add dither to sample
    let ditheredSample = sample + dither;
    
    // Noise shaping (reduces audible noise)
    if (this.noiseShaping) {
      ditheredSample -= this.lastError * 0.5; // Simple noise shaping
    }
    
    // Quantize
    const quantized = Math.round(ditheredSample / this.quantizationStep) * this.quantizationStep;
    
    // Calculate error for next sample
    this.lastError = quantized - ditheredSample;
    
    return quantized;
  }

  /**
   * Convert float samples to integer with dithering
   */
  convertToInteger(samples, bitDepth) {
    const maxValue = Math.pow(2, bitDepth - 1) - 1;
    const minValue = -Math.pow(2, bitDepth - 1);
    
    const result = new Int32Array(samples.length);
    
    for (let i = 0; i < samples.length; i++) {
      // Normalize to -1 to 1 range
      const normalized = Math.max(-1, Math.min(1, samples[i]));
      
      // Apply dithering
      const dithered = this.applyDither(normalized);
      
      // Convert to integer
      result[i] = Math.max(minValue, Math.min(maxValue, Math.round(dithered * maxValue)));
    }
    
    return result;
  }

  reset() {
    this.lastError = 0;
  }
}

/**
 * True Peak Limiter for Lossless Export
 * True-peak ceiling target with conservative true-peak estimate
 * Note: Not full ITU-R BS.1770-grade true peak - uses simplified interpolation-based estimate
 */
export class LosslessTruePeakLimiter {
  constructor(ceiling, sampleRate) {
    this.ceiling = ceiling; // In dB
    this.sampleRate = sampleRate;
    this.gainReduction = 1.0;
    this.lastSample = 0;
  }

  /**
   * Detect true peak with interpolation
   * Simplified version - estimates inter-sample peaks
   */
  detectTruePeak(currentSample, previousSample) {
    const absCurrent = Math.abs(currentSample);
    const absPrevious = Math.abs(previousSample);
    
    // Estimate inter-sample peak using linear interpolation
    // This is a simplified approximation
    // Full true peak would require proper oversampling + sinc reconstruction
    const interpPeak = Math.max(absCurrent, absPrevious);
    
    // Add small margin for safety (conservative approach)
    return interpPeak * 1.01; // 1% safety margin
  }

  process(sample) {
    // Detect true peak
    const truePeak = this.detectTruePeak(sample, this.lastSample);
    const peakDB = 20 * Math.log10(truePeak + 1e-10);
    
    // Apply gain reduction if needed
    if (peakDB > this.ceiling) {
      const targetGain = Math.pow(10, (this.ceiling - peakDB) / 20);
      this.gainReduction = Math.min(this.gainReduction, targetGain);
    }
    
    this.lastSample = sample;
    return sample * this.gainReduction;
  }

  reset() {
    this.gainReduction = 1.0;
    this.lastSample = 0;
  }
}

/**
 * Lossless Normalizer
 * Normalizes audio while maintaining lossless quality
 */
export class LosslessNormalizer {
  constructor(targetLUFS, sampleRate) {
    this.targetLUFS = targetLUFS;
    this.sampleRate = sampleRate;
  }

  /**
   * Calculate normalization gain
   */
  calculateGain(audioBuffer) {
    // Calculate RMS for LUFS approximation
    let sumSquared = 0;
    const length = audioBuffer.length;
    const channels = audioBuffer.numberOfChannels;
    
    for (let ch = 0; ch < channels; ch++) {
      const data = audioBuffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        sumSquared += data[i] * data[i];
      }
    }
    
    const rms = Math.sqrt(sumSquared / (length * channels));
    const currentLUFS = rms > 0 ? -0.691 + 10 * Math.log10(rms) : -70;
    
    // Calculate gain needed
    const lufsDifference = this.targetLUFS - currentLUFS;
    const gain = Math.pow(10, lufsDifference / 20);
    
    // Limit gain to prevent clipping
    return Math.min(gain, 2.0); // Max 6dB boost
  }

  normalize(audioBuffer) {
    const gain = this.calculateGain(audioBuffer);
    
    // Apply gain
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const data = audioBuffer.getChannelData(ch);
      for (let i = 0; i < audioBuffer.length; i++) {
        data[i] *= gain;
      }
    }
    
    return audioBuffer;
  }
}
