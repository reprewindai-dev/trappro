/**
 * DSP Processing Modules
 * Core audio processing building blocks
 */

/**
 * Dynamic EQ - Frequency-dependent gain that adapts to input level
 */
export class DynamicEQ {
  constructor(frequency, q, threshold, ratio, attack, release, gain) {
    this.frequency = frequency; // Center frequency
    this.q = q; // Q factor (bandwidth)
    this.threshold = threshold; // Threshold in dB
    this.ratio = ratio; // Compression ratio
    this.attack = attack; // Attack time in seconds
    this.release = release; // Release time in seconds
    this.gain = gain; // Maximum gain reduction in dB
    
    // State
    this.envelope = 0;
    this.sampleRate = 44100;
  }

  setSampleRate(sampleRate) {
    this.sampleRate = sampleRate;
  }

  /**
   * Process a single sample
   */
  process(sample, inputLevel) {
    // Calculate envelope follower
    const target = Math.abs(inputLevel);
    const coeff = target > this.envelope 
      ? Math.exp(-1 / (this.attack * this.sampleRate))
      : Math.exp(-1 / (this.release * this.sampleRate));
    
    this.envelope = target + (this.envelope - target) * coeff;
    
    // Calculate gain reduction
    const dbLevel = 20 * Math.log10(this.envelope + 1e-10);
    let gainReduction = 0;
    
    if (dbLevel > this.threshold) {
      const excess = dbLevel - this.threshold;
      gainReduction = excess / this.ratio;
      gainReduction = Math.min(gainReduction, this.gain);
    }
    
    // Apply gain reduction
    const gainLinear = Math.pow(10, -gainReduction / 20);
    return sample * gainLinear;
  }
}

/**
 * Adaptive Compressor - Compression with adaptive threshold based on analysis
 */
export class AdaptiveCompressor {
  constructor(threshold, ratio, attack, release, knee, makeupGain) {
    this.threshold = threshold;
    this.ratio = ratio;
    this.attack = attack;
    this.release = release;
    this.knee = knee;
    this.makeupGain = makeupGain;
    
    this.envelope = 0;
    this.sampleRate = 44100;
  }

  setSampleRate(sampleRate) {
    this.sampleRate = sampleRate;
  }

  adaptThreshold(analysisData) {
    // Adapt threshold based on dynamic range
    const dynamicRange = analysisData.dynamicRange || 12;
    const targetRange = 8; // Target dynamic range
    
    if (dynamicRange > targetRange) {
      // Reduce threshold to compress more
      this.threshold = -12 - (dynamicRange - targetRange) * 0.5;
    }
  }

  process(sample) {
    const inputLevel = Math.abs(sample);
    
    // Envelope follower
    const target = inputLevel;
    const coeff = target > this.envelope
      ? Math.exp(-1 / (this.attack * this.sampleRate))
      : Math.exp(-1 / (this.release * this.sampleRate));
    
    this.envelope = target + (this.envelope - target) * coeff;
    
    // Convert to dB
    const dbLevel = 20 * Math.log10(this.envelope + 1e-10);
    
    // Calculate gain reduction with knee
    let gainReduction = 0;
    if (dbLevel > this.threshold - this.knee / 2) {
      if (dbLevel < this.threshold + this.knee / 2) {
        // Soft knee
        const excess = dbLevel - (this.threshold - this.knee / 2);
        gainReduction = (excess / this.knee) * (excess / this.ratio);
      } else {
        // Hard compression
        const excess = dbLevel - this.threshold;
        gainReduction = excess - (excess / this.ratio);
      }
    }
    
    // Apply gain reduction and makeup gain
    const gainLinear = Math.pow(10, (-gainReduction + this.makeupGain) / 20);
    return sample * gainLinear;
  }
}

/**
 * Soft Clipper - Smooth saturation before limiting
 */
export class SoftClipper {
  constructor(drive, threshold) {
    this.drive = drive; // Drive amount (1.0 = no drive)
    this.threshold = threshold; // Threshold before clipping
  }

  process(sample) {
    let driven = sample * this.drive;
    
    // Soft clipping using tanh
    if (Math.abs(driven) > this.threshold) {
      const sign = driven > 0 ? 1 : -1;
      const excess = Math.abs(driven) - this.threshold;
      driven = sign * (this.threshold + (1 - this.threshold) * Math.tanh(excess / (1 - this.threshold)));
    }
    
    return driven;
  }
}

/**
 * Limiter - Final stage peak limiter
 */
export class Limiter {
  constructor(ceiling, release) {
    this.ceiling = ceiling; // Ceiling in linear (0-1)
    this.release = release; // Release time in seconds
    this.gainReduction = 1.0;
    this.sampleRate = 44100;
  }

  setSampleRate(sampleRate) {
    this.sampleRate = sampleRate;
  }

  process(sample) {
    const absSample = Math.abs(sample);
    
    // Calculate required gain reduction
    if (absSample > this.ceiling) {
      const targetGain = this.ceiling / (absSample + 1e-10);
      this.gainReduction = Math.min(this.gainReduction, targetGain);
    } else {
      // Release
      const releaseCoeff = Math.exp(-1 / (this.release * this.sampleRate));
      this.gainReduction = 1.0 + (this.gainReduction - 1.0) * releaseCoeff;
      this.gainReduction = Math.min(1.0, this.gainReduction);
    }
    
    return sample * this.gainReduction;
  }
}

/**
 * Mid/Side Processor - Stereo width control
 */
export class MidSideProcessor {
  constructor(width) {
    this.width = width; // Width control (0 = mono, 1 = stereo, >1 = wider)
  }

  process(left, right) {
    const mid = (left + right) * 0.5;
    const side = (left - right) * 0.5;
    
    const processedSide = side * this.width;
    
    return {
      left: mid + processedSide,
      right: mid - processedSide
    };
  }
}

/**
 * Mono Bass Processor - Ensures bass below cutoff is mono
 */
export class MonoBassProcessor {
  constructor(cutoff, sampleRate) {
    this.cutoff = cutoff; // Frequency cutoff (typically 120 Hz)
    this.sampleRate = sampleRate;
    
    // Simple low-pass filter coefficients
    const rc = 1.0 / (cutoff * 2 * Math.PI);
    const dt = 1.0 / sampleRate;
    this.alpha = dt / (rc + dt);
    
    this.leftLP = 0;
    this.rightLP = 0;
  }

  process(left, right) {
    // Low-pass filter
    this.leftLP += this.alpha * (left - this.leftLP);
    this.rightLP += this.alpha * (right - this.rightLP);
    
    // Make mono
    const mono = (this.leftLP + this.rightLP) * 0.5;
    
    // Subtract low-passed from original, add mono
    return {
      left: left - this.leftLP + mono,
      right: right - this.rightLP + mono
    };
  }
}

/**
 * Pitch Correction Processor (for BigCappo preset)
 * Legacy class - use AdvancedPitchCorrector for better results
 */
export class PitchCorrector {
  constructor(threshold, retuneSpeed, sampleRate) {
    this.threshold = threshold; // Cents deviation threshold
    this.retuneSpeed = retuneSpeed; // Retune speed (0-1, lower = slower)
    this.sampleRate = sampleRate;
    
    // Simple pitch detection state
    this.pitchBuffer = [];
    this.currentPitch = 0;
    this.targetPitch = 0;
  }

  /**
   * Detect pitch deviation in cents
   */
  detectPitchDeviation(audioBuffer) {
    // Simplified pitch detection
    // Full implementation would use autocorrelation or FFT-based pitch detection
    const samples = audioBuffer.getChannelData(0);
    
    // Zero-crossing rate approximation
    let crossings = 0;
    for (let i = 1; i < samples.length; i++) {
      if ((samples[i] >= 0) !== (samples[i - 1] >= 0)) {
        crossings++;
      }
    }
    
    const frequency = (crossings / 2) * (this.sampleRate / samples.length);
    
    // Find nearest semitone
    const semitones = 12 * Math.log2(frequency / 440) + 9; // A4 = 440Hz
    const nearestSemitone = Math.round(semitones);
    const deviation = (semitones - nearestSemitone) * 100; // Convert to cents
    
    return { frequency, deviation, nearestSemitone };
  }

  /**
   * Process with pitch correction
   */
  process(sample, pitchDeviation) {
    if (Math.abs(pitchDeviation) > this.threshold) {
      // Apply pitch correction
      const correctionFactor = Math.pow(2, -pitchDeviation / 1200);
      // Simple time-domain pitch shifting would go here
      // For now, return sample as-is (full implementation needed)
      return sample;
    }
    return sample;
  }
}
