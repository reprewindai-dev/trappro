/**
 * TrapMasterPro Preset Engine
 * Adaptive presets for Trap-Soul, Trap, Urban, Hip-Hop full mixes
 */

import { AdaptiveCompressor, DynamicEQ, SoftClipper, Limiter, MidSideProcessor, MonoBassProcessor, PitchCorrector } from './dspModules.js';
import { AdvancedPitchCorrector } from './advancedPitchCorrector.js';

export class PresetEngine {
  constructor(audioContext, sampleRate) {
    this.audioContext = audioContext;
    this.sampleRate = sampleRate;
    this.analysisData = null;
  }

  setAnalysis(analysisData) {
    this.analysisData = analysisData;
  }

  /**
   * Apply preset processing to audio buffer
   */
  async process(audioBuffer, presetName) {
    const preset = this.getPreset(presetName);
    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    // Create working buffer
    const processedBuffer = this.audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    // Copy original data
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const originalData = audioBuffer.getChannelData(channel);
      const processedData = processedBuffer.getChannelData(channel);
      originalData.forEach((sample, i) => {
        processedData[i] = sample;
      });
    }

    // Apply preset processing
    return preset.process(processedBuffer, this.analysisData);
  }

  /**
   * Get preset configuration
   */
  getPreset(presetName) {
    const presets = {
      'De-Harsh': new DeHarshPreset(this.sampleRate),
      'Mud Remover': new MudRemoverPreset(this.sampleRate),
      'Bass Tamer': new BassTamerPreset(this.sampleRate),
      'Vintage Warmth': new VintageWarmthPreset(this.sampleRate),
      'Modern Bright': new ModernBrightPreset(this.sampleRate),
      'Lo-Fi Character': new LoFiCharacterPreset(this.sampleRate),
      'Neo Soul': new NeoSoulPreset(this.sampleRate),
      'Festival Banger': new FestivalBangerPreset(this.sampleRate),
      'Focus Center': new FocusCenterPreset(this.sampleRate),
      'Immersive': new ImmersivePreset(this.sampleRate),
      'Wide & Spacious': new WideSpaciousPreset(this.sampleRate),
      'Vocal Forward': new VocalForwardPreset(this.sampleRate),
      'Smooth Mids': new SmoothMidsPreset(this.sampleRate),
      'Dynamic & Clear': new DynamicClearPreset(this.sampleRate),
      'Maximum Impact': new MaximumImpactPreset(this.sampleRate),
      'BigCappo': new BigCappoPreset(this.sampleRate)
    };

    return presets[presetName];
  }

  /**
   * Get all preset names
   */
  getPresetNames() {
    return [
      'De-Harsh',
      'Mud Remover',
      'Bass Tamer',
      'Vintage Warmth',
      'Modern Bright',
      'Lo-Fi Character',
      'Neo Soul',
      'Festival Banger',
      'Focus Center',
      'Immersive',
      'Wide & Spacious',
      'Vocal Forward',
      'Smooth Mids',
      'Dynamic & Clear',
      'Maximum Impact',
      'BigCappo'
    ];
  }
}

/**
 * Base Preset Class
 */
class BasePreset {
  constructor(sampleRate, intent, loudnessTarget) {
    this.sampleRate = sampleRate;
    this.intent = intent;
    this.loudnessTarget = loudnessTarget; // Target LUFS
  }

  getIntent() {
    return this.intent;
  }

  getLoudnessTarget() {
    return this.loudnessTarget;
  }

  /**
   * Process audio buffer - to be implemented by each preset
   */
  process(audioBuffer, analysisData) {
    throw new Error('process() must be implemented by preset');
  }
}

/**
 * DE-HARSH PRESET
 * Intent: Remove harshness in 2.5-6 kHz zone without dulling
 */
class DeHarshPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Removes harsh frequencies while preserving clarity', -9);
    this.dynamicEQ = new DynamicEQ(3500, 2.0, -12, 3.0, 0.003, 0.1, -6);
    this.dynamicEQ.setSampleRate(sampleRate);
    this.compressor = new AdaptiveCompressor(-10, 3.0, 0.003, 0.1, 2.0, 1.0);
    this.compressor.setSampleRate(sampleRate);
    this.softClipper = new SoftClipper(1.2, 0.8);
    this.limiter = new Limiter(0.95, 0.05);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    const harshness = analysisData.harshness || 0;
    const adaptiveGain = Math.min(-3, -harshness * 8); // More reduction if harsh
    
    this.dynamicEQ.gain = adaptiveGain;
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < channels; ch++) {
        const data = audioBuffer.getChannelData(ch);
        let sample = data[i];
        
        // Dynamic EQ for harshness
        sample = this.dynamicEQ.process(sample, sample);
        
        // Compression
        sample = this.compressor.process(sample);
        
        // Soft clipping
        sample = this.softClipper.process(sample);
        
        // Limiting
        sample = this.limiter.process(sample);
        
        data[i] = sample;
      }
    }
    
    return audioBuffer;
  }
}

/**
 * MUD REMOVER PRESET
 * Intent: Clean up mud in 150-350 Hz zone
 */
class MudRemoverPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Cleans mud and boxiness from low-mids', -9);
    this.dynamicEQ = new DynamicEQ(250, 1.5, -15, 4.0, 0.005, 0.15, -8);
    this.dynamicEQ.setSampleRate(sampleRate);
    this.compressor = new AdaptiveCompressor(-12, 2.5, 0.003, 0.08, 1.5, 0.5);
    this.compressor.setSampleRate(sampleRate);
    this.monoBass = new MonoBassProcessor(120, sampleRate);
    this.limiter = new Limiter(0.95, 0.05);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    const mud = analysisData.mud || 0;
    const adaptiveGain = Math.min(-4, -mud * 10);
    
    this.dynamicEQ.gain = adaptiveGain;
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    if (channels >= 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      
      for (let i = 0; i < length; i++) {
        // Mono bass
        const bassProcessed = this.monoBass.process(left[i], right[i]);
        left[i] = bassProcessed.left;
        right[i] = bassProcessed.right;
        
        // Dynamic EQ on mud
        left[i] = this.dynamicEQ.process(left[i], left[i]);
        right[i] = this.dynamicEQ.process(right[i], right[i]);
        
        // Compression
        left[i] = this.compressor.process(left[i]);
        right[i] = this.compressor.process(right[i]);
        
        // Limiting
        left[i] = this.limiter.process(left[i]);
        right[i] = this.limiter.process(right[i]);
      }
    } else {
      const data = audioBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = this.dynamicEQ.process(data[i], data[i]);
        data[i] = this.compressor.process(data[i]);
        data[i] = this.limiter.process(data[i]);
      }
    }
    
    return audioBuffer;
  }
}

/**
 * BASS TAMER PRESET
 * Intent: Control and stabilize bass (30-120 Hz)
 */
class BassTamerPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Controls and stabilizes bass frequencies', -9);
    this.dynamicEQ = new DynamicEQ(60, 1.0, -10, 5.0, 0.01, 0.2, -10);
    this.dynamicEQ.setSampleRate(sampleRate);
    this.compressor = new AdaptiveCompressor(-8, 4.0, 0.01, 0.15, 2.0, 1.5);
    this.compressor.setSampleRate(sampleRate);
    this.monoBass = new MonoBassProcessor(120, sampleRate);
    this.limiter = new Limiter(0.95, 0.05);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    const bassStability = analysisData.bassStability || 0;
    const adaptiveGain = bassStability > 0.3 ? -6 : -3;
    
    this.dynamicEQ.gain = adaptiveGain;
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    if (channels >= 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      
      for (let i = 0; i < length; i++) {
        // Aggressive mono bass
        const bassProcessed = this.monoBass.process(left[i], right[i]);
        left[i] = bassProcessed.left;
        right[i] = bassProcessed.right;
        
        // Dynamic EQ on bass
        left[i] = this.dynamicEQ.process(left[i], left[i]);
        right[i] = this.dynamicEQ.process(right[i], right[i]);
        
        // Compression
        left[i] = this.compressor.process(left[i]);
        right[i] = this.compressor.process(right[i]);
        
        // Limiting
        left[i] = this.limiter.process(left[i]);
        right[i] = this.limiter.process(right[i]);
      }
    } else {
      const data = audioBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = this.dynamicEQ.process(data[i], data[i]);
        data[i] = this.compressor.process(data[i]);
        data[i] = this.limiter.process(data[i]);
      }
    }
    
    return audioBuffer;
  }
}

/**
 * VINTAGE WARMTH PRESET
 * Intent: Add analog warmth and character
 */
class VintageWarmthPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Adds analog warmth and vintage character', -9);
    this.compressor = new AdaptiveCompressor(-14, 2.0, 0.01, 0.2, 3.0, 2.0);
    this.compressor.setSampleRate(sampleRate);
    this.softClipper = new SoftClipper(1.5, 0.7);
    this.limiter = new Limiter(0.95, 0.08);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < channels; ch++) {
        const data = audioBuffer.getChannelData(ch);
        let sample = data[i];
        
        // Gentle compression for warmth
        sample = this.compressor.process(sample);
        
        // Soft clipping for saturation
        sample = this.softClipper.process(sample);
        
        // Gentle limiting
        sample = this.limiter.process(sample);
        
        data[i] = sample;
      }
    }
    
    return audioBuffer;
  }
}

/**
 * MODERN BRIGHT PRESET
 * Intent: Enhance high frequencies for modern clarity
 */
class ModernBrightPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Enhances high frequencies for modern clarity', -9);
    this.compressor = new AdaptiveCompressor(-12, 3.0, 0.002, 0.05, 1.5, 1.0);
    this.compressor.setSampleRate(sampleRate);
    this.limiter = new Limiter(0.95, 0.05);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    // Boost highs (simplified - full implementation would use EQ)
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < channels; ch++) {
        const data = audioBuffer.getChannelData(ch);
        let sample = data[i];
        
        // High-frequency emphasis (simplified)
        const spectralBalance = analysisData.spectralBalance || { high: 0.33 };
        if (spectralBalance.high < 0.3) {
          sample *= 1.15; // Boost if highs are low
        }
        
        sample = this.compressor.process(sample);
        sample = this.limiter.process(sample);
        
        data[i] = sample;
      }
    }
    
    return audioBuffer;
  }
}

/**
 * LO-FI CHARACTER PRESET
 * Intent: Add lo-fi character and vibe
 */
class LoFiCharacterPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Adds lo-fi character and vintage vibe', -9);
    this.compressor = new AdaptiveCompressor(-16, 1.8, 0.02, 0.3, 4.0, 1.5);
    this.compressor.setSampleRate(sampleRate);
    this.softClipper = new SoftClipper(2.0, 0.6);
    this.limiter = new Limiter(0.92, 0.1);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < channels; ch++) {
        const data = audioBuffer.getChannelData(ch);
        let sample = data[i];
        
        // Reduce highs slightly (lo-fi character)
        const spectralBalance = analysisData.spectralBalance || { high: 0.33 };
        if (spectralBalance.high > 0.35) {
          sample *= 0.92;
        }
        
        // Heavy compression
        sample = this.compressor.process(sample);
        
        // Aggressive soft clipping
        sample = this.softClipper.process(sample);
        
        // Limiting
        sample = this.limiter.process(sample);
        
        data[i] = sample;
      }
    }
    
    return audioBuffer;
  }
}

/**
 * NEO SOUL PRESET
 * Intent: Smooth, soulful character
 */
class NeoSoulPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Smooth, soulful character for neo-soul tracks', -9);
    this.compressor = new AdaptiveCompressor(-13, 2.2, 0.005, 0.12, 2.5, 1.2);
    this.compressor.setSampleRate(sampleRate);
    this.softClipper = new SoftClipper(1.3, 0.75);
    this.limiter = new Limiter(0.95, 0.06);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < channels; ch++) {
        const data = audioBuffer.getChannelData(ch);
        let sample = data[i];
        
        sample = this.compressor.process(sample);
        sample = this.softClipper.process(sample);
        sample = this.limiter.process(sample);
        
        data[i] = sample;
      }
    }
    
    return audioBuffer;
  }
}

/**
 * FESTIVAL BANGER PRESET
 * Intent: Maximum loudness and impact for festivals
 */
class FestivalBangerPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Maximum loudness and impact for festivals', -8.5);
    this.compressor = new AdaptiveCompressor(-6, 4.0, 0.001, 0.03, 1.0, 3.0);
    this.compressor.setSampleRate(sampleRate);
    this.softClipper = new SoftClipper(1.8, 0.85);
    this.limiter = new Limiter(0.98, 0.01);
    this.limiter.setSampleRate(sampleRate);
    this.monoBass = new MonoBassProcessor(120, sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    if (channels >= 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      
      for (let i = 0; i < length; i++) {
        const bassProcessed = this.monoBass.process(left[i], right[i]);
        left[i] = bassProcessed.left;
        right[i] = bassProcessed.right;
        
        left[i] = this.compressor.process(left[i]);
        right[i] = this.compressor.process(right[i]);
        
        left[i] = this.softClipper.process(left[i]);
        right[i] = this.softClipper.process(right[i]);
        
        left[i] = this.limiter.process(left[i]);
        right[i] = this.limiter.process(right[i]);
      }
    } else {
      const data = audioBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = this.compressor.process(data[i]);
        data[i] = this.softClipper.process(data[i]);
        data[i] = this.limiter.process(data[i]);
      }
    }
    
    return audioBuffer;
  }
}

/**
 * FOCUS CENTER PRESET
 * Intent: Focus energy in center, reduce width
 */
class FocusCenterPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Focuses energy in center, reduces width', -9);
    this.compressor = new AdaptiveCompressor(-11, 2.8, 0.003, 0.08, 2.0, 1.0);
    this.compressor.setSampleRate(sampleRate);
    this.midSide = new MidSideProcessor(0.7); // Reduce width
    this.limiter = new Limiter(0.95, 0.05);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    if (channels >= 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      
      for (let i = 0; i < length; i++) {
        const msProcessed = this.midSide.process(left[i], right[i]);
        left[i] = msProcessed.left;
        right[i] = msProcessed.right;
        
        left[i] = this.compressor.process(left[i]);
        right[i] = this.compressor.process(right[i]);
        
        left[i] = this.limiter.process(left[i]);
        right[i] = this.limiter.process(right[i]);
      }
    } else {
      const data = audioBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = this.compressor.process(data[i]);
        data[i] = this.limiter.process(data[i]);
      }
    }
    
    return audioBuffer;
  }
}

/**
 * IMMERSIVE PRESET
 * Intent: Create immersive, wide soundstage
 */
class ImmersivePreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Creates immersive, wide soundstage', -9);
    this.compressor = new AdaptiveCompressor(-12, 2.5, 0.004, 0.1, 2.0, 1.2);
    this.compressor.setSampleRate(sampleRate);
    this.midSide = new MidSideProcessor(1.3); // Increase width
    this.limiter = new Limiter(0.95, 0.05);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    if (channels >= 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      
      for (let i = 0; i < length; i++) {
        const msProcessed = this.midSide.process(left[i], right[i]);
        left[i] = msProcessed.left;
        right[i] = msProcessed.right;
        
        left[i] = this.compressor.process(left[i]);
        right[i] = this.compressor.process(right[i]);
        
        left[i] = this.limiter.process(left[i]);
        right[i] = this.limiter.process(right[i]);
      }
    } else {
      const data = audioBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = this.compressor.process(data[i]);
        data[i] = this.limiter.process(data[i]);
      }
    }
    
    return audioBuffer;
  }
}

/**
 * WIDE & SPACIOUS PRESET
 * Intent: Maximum stereo width
 */
class WideSpaciousPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Maximum stereo width and spaciousness', -9);
    this.compressor = new AdaptiveCompressor(-11, 2.6, 0.003, 0.09, 2.0, 1.0);
    this.compressor.setSampleRate(sampleRate);
    this.midSide = new MidSideProcessor(1.5); // Very wide
    this.monoBass = new MonoBassProcessor(120, sampleRate);
    this.limiter = new Limiter(0.95, 0.05);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    if (channels >= 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      
      for (let i = 0; i < length; i++) {
        const bassProcessed = this.monoBass.process(left[i], right[i]);
        left[i] = bassProcessed.left;
        right[i] = bassProcessed.right;
        
        const msProcessed = this.midSide.process(left[i], right[i]);
        left[i] = msProcessed.left;
        right[i] = msProcessed.right;
        
        left[i] = this.compressor.process(left[i]);
        right[i] = this.compressor.process(right[i]);
        
        left[i] = this.limiter.process(left[i]);
        right[i] = this.limiter.process(right[i]);
      }
    } else {
      const data = audioBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = this.compressor.process(data[i]);
        data[i] = this.limiter.process(data[i]);
      }
    }
    
    return audioBuffer;
  }
}

/**
 * VOCAL FORWARD PRESET
 * Intent: Bring vocals forward in the mix
 */
class VocalForwardPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Brings vocals forward in the mix', -9);
    this.dynamicEQ = new DynamicEQ(2500, 1.8, -14, 2.5, 0.002, 0.06, 4);
    this.dynamicEQ.setSampleRate(sampleRate);
    this.compressor = new AdaptiveCompressor(-10, 3.0, 0.002, 0.05, 1.5, 1.5);
    this.compressor.setSampleRate(sampleRate);
    this.limiter = new Limiter(0.95, 0.05);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    const vocalDominance = analysisData.vocalDominance || 0;
    const adaptiveGain = vocalDominance < 0.25 ? 4 : 2; // Boost more if vocals are low
    
    this.dynamicEQ.gain = adaptiveGain;
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < channels; ch++) {
        const data = audioBuffer.getChannelData(ch);
        let sample = data[i];
        
        // Boost vocal range
        sample = this.dynamicEQ.process(sample, sample);
        
        sample = this.compressor.process(sample);
        sample = this.limiter.process(sample);
        
        data[i] = sample;
      }
    }
    
    return audioBuffer;
  }
}

/**
 * SMOOTH MIDS PRESET
 * Intent: Smooth out midrange frequencies
 */
class SmoothMidsPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Smooths out midrange frequencies', -9);
    this.dynamicEQ = new DynamicEQ(2000, 2.0, -12, 3.5, 0.004, 0.12, -5);
    this.dynamicEQ.setSampleRate(sampleRate);
    this.compressor = new AdaptiveCompressor(-13, 2.3, 0.005, 0.1, 2.5, 1.0);
    this.compressor.setSampleRate(sampleRate);
    this.limiter = new Limiter(0.95, 0.06);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.dynamicEQ.gain = -5;
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < channels; ch++) {
        const data = audioBuffer.getChannelData(ch);
        let sample = data[i];
        
        sample = this.dynamicEQ.process(sample, sample);
        sample = this.compressor.process(sample);
        sample = this.limiter.process(sample);
        
        data[i] = sample;
      }
    }
    
    return audioBuffer;
  }
}

/**
 * DYNAMIC & CLEAR PRESET
 * Intent: Preserve dynamics while adding clarity
 */
class DynamicClearPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Preserves dynamics while adding clarity', -9);
    this.compressor = new AdaptiveCompressor(-16, 1.5, 0.01, 0.15, 4.0, 0.5);
    this.compressor.setSampleRate(sampleRate);
    this.limiter = new Limiter(0.95, 0.08);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < channels; ch++) {
        const data = audioBuffer.getChannelData(ch);
        let sample = data[i];
        
        // Light compression to preserve dynamics
        sample = this.compressor.process(sample);
        sample = this.limiter.process(sample);
        
        data[i] = sample;
      }
    }
    
    return audioBuffer;
  }
}

/**
 * MAXIMUM IMPACT PRESET
 * Intent: Maximum loudness and punch
 */
class MaximumImpactPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Maximum loudness and punch', -8.5);
    this.compressor = new AdaptiveCompressor(-5, 4.5, 0.001, 0.02, 0.8, 4.0);
    this.compressor.setSampleRate(sampleRate);
    this.softClipper = new SoftClipper(2.0, 0.88);
    this.limiter = new Limiter(0.99, 0.005);
    this.limiter.setSampleRate(sampleRate);
    this.monoBass = new MonoBassProcessor(120, sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.compressor.adaptThreshold(analysisData);
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    if (channels >= 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      
      for (let i = 0; i < length; i++) {
        const bassProcessed = this.monoBass.process(left[i], right[i]);
        left[i] = bassProcessed.left;
        right[i] = bassProcessed.right;
        
        left[i] = this.compressor.process(left[i]);
        right[i] = this.compressor.process(right[i]);
        
        left[i] = this.softClipper.process(left[i]);
        right[i] = this.softClipper.process(right[i]);
        
        left[i] = this.limiter.process(left[i]);
        right[i] = this.limiter.process(right[i]);
      }
    } else {
      const data = audioBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = this.compressor.process(data[i]);
        data[i] = this.softClipper.process(data[i]);
        data[i] = this.limiter.process(data[i]);
      }
    }
    
    return audioBuffer;
  }
}

/**
 * BIGCAPPO SIGNATURE PRESET
 * Intent: Emotional trap-soul vocals, human and imperfect
 */
class BigCappoPreset extends BasePreset {
  constructor(sampleRate) {
    super(sampleRate, 'Emotional trap-soul vocals, human and imperfect', -9);
    // Use advanced pitch corrector - lower threshold (25 cents) means it helps more when off-key
    // Slower retune speed (0.2) keeps it natural and emotional
    this.pitchCorrector = new AdvancedPitchCorrector(25, 0.2, sampleRate);
    this.dynamicEQ = new DynamicEQ(3000, 2.2, -13, 2.8, 0.004, 0.1, 2);
    this.dynamicEQ.setSampleRate(sampleRate);
    this.compressor = new AdaptiveCompressor(-12, 2.4, 0.005, 0.12, 2.5, 1.8);
    this.compressor.setSampleRate(sampleRate);
    this.softClipper = new SoftClipper(1.4, 0.75);
    this.limiter = new Limiter(0.95, 0.06);
    this.limiter.setSampleRate(sampleRate);
  }

  process(audioBuffer, analysisData) {
    this.compressor.adaptThreshold(analysisData);
    
    // Reset pitch corrector for new buffer
    this.pitchCorrector.reset();
    
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    
    if (channels >= 2) {
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      
      for (let i = 0; i < length; i++) {
        // Apply pitch correction to stereo pair
        const corrected = this.pitchCorrector.processStereo(left[i], right[i]);
        let l = corrected.left;
        let r = corrected.right;
        
        // Emphasize emotional mids
        l = this.dynamicEQ.process(l, l);
        r = this.dynamicEQ.process(r, r);
        
        // Slight mid boost for emotional character
        l *= 1.08;
        r *= 1.08;
        
        // Control harsh highs without dulling
        const harshness = analysisData.harshness || 0;
        if (harshness > 0.25) {
          l *= 0.97;
          r *= 0.97;
        }
        
        l = this.compressor.process(l);
        r = this.compressor.process(r);
        l = this.softClipper.process(l);
        r = this.softClipper.process(r);
        l = this.limiter.process(l);
        r = this.limiter.process(r);
        
        left[i] = l;
        right[i] = r;
      }
    } else {
      const data = audioBuffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        let sample = data[i];
        
        // Apply pitch correction
        sample = this.pitchCorrector.processSample(sample);
        
        // Emphasize emotional mids
        sample = this.dynamicEQ.process(sample, sample);
        sample *= 1.08; // Mid boost
        
        // Control harsh highs
        const harshness = analysisData.harshness || 0;
        if (harshness > 0.25) {
          sample *= 0.97;
        }
        
        sample = this.compressor.process(sample);
        sample = this.softClipper.process(sample);
        sample = this.limiter.process(sample);
        
        data[i] = sample;
      }
    }
    
    return audioBuffer;
  }
}
