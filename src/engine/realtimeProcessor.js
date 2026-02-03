/**
 * Real-Time Audio Processor
 * Processes audio in real-time using Web Audio API nodes
 * Allows instant preset switching during playback
 */

import { AdaptiveCompressor, DynamicEQ, SoftClipper, Limiter, MidSideProcessor, MonoBassProcessor, PitchCorrector } from './dspModules.js';
import { AdvancedPitchCorrector } from './advancedPitchCorrector.js';

export class RealtimeProcessor {
  constructor(audioContext, analysisData) {
    this.audioContext = audioContext;
    this.analysisData = analysisData;
    this.currentPreset = null;
    this.processorNode = null;
    
    // Create script processor for real-time processing
    this.createProcessor();
  }

  createProcessor() {
    // Use ScriptProcessorNode for real-time processing
    // Buffer size: 4096 samples (good balance between latency and stability)
    this.processorNode = this.audioContext.createScriptProcessor(4096, 0, 2);
    
    this.processorNode.onaudioprocess = (e) => {
      this.processAudio(e);
    };
  }

  setPreset(presetName) {
    this.currentPreset = presetName;
    this.presetProcessor = this.createPresetProcessor(presetName);
  }

  createPresetProcessor(presetName) {
    const sampleRate = this.audioContext.sampleRate;
    
    // Create processors based on preset
    const processors = {
      'De-Harsh': () => {
        const dynamicEQ = new DynamicEQ(3500, 2.0, -12, 3.0, 0.003, 0.1, -8);
        dynamicEQ.setSampleRate(sampleRate);
        const compressor = new AdaptiveCompressor(-10, 3.0, 0.003, 0.1, 2.0, 1.5);
        compressor.setSampleRate(sampleRate);
        const softClipper = new SoftClipper(1.3, 0.8);
        const limiter = new Limiter(0.95, 0.05);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          let l = dynamicEQ.process(left, left);
          let r = dynamicEQ.process(right, right);
          l = compressor.process(l);
          r = compressor.process(r);
          l = softClipper.process(l);
          r = softClipper.process(r);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Mud Remover': () => {
        const dynamicEQ = new DynamicEQ(250, 1.5, -15, 4.0, 0.005, 0.15, -10);
        dynamicEQ.setSampleRate(sampleRate);
        const compressor = new AdaptiveCompressor(-12, 2.5, 0.003, 0.08, 1.5, 1.0);
        compressor.setSampleRate(sampleRate);
        const monoBass = new MonoBassProcessor(120, sampleRate);
        const limiter = new Limiter(0.95, 0.05);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          const bass = monoBass.process(left, right);
          let l = dynamicEQ.process(bass.left, bass.left);
          let r = dynamicEQ.process(bass.right, bass.right);
          l = compressor.process(l);
          r = compressor.process(r);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Bass Tamer': () => {
        const dynamicEQ = new DynamicEQ(60, 1.0, -10, 5.0, 0.01, 0.2, -12);
        dynamicEQ.setSampleRate(sampleRate);
        const compressor = new AdaptiveCompressor(-8, 4.0, 0.01, 0.15, 2.0, 2.0);
        compressor.setSampleRate(sampleRate);
        const monoBass = new MonoBassProcessor(120, sampleRate);
        const limiter = new Limiter(0.95, 0.05);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          const bass = monoBass.process(left, right);
          let l = dynamicEQ.process(bass.left, bass.left);
          let r = dynamicEQ.process(bass.right, bass.right);
          l = compressor.process(l);
          r = compressor.process(r);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Vintage Warmth': () => {
        const compressor = new AdaptiveCompressor(-14, 2.0, 0.01, 0.2, 3.0, 2.5);
        compressor.setSampleRate(sampleRate);
        const softClipper = new SoftClipper(1.8, 0.7);
        const limiter = new Limiter(0.95, 0.08);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          let l = compressor.process(left);
          let r = compressor.process(right);
          l = softClipper.process(l);
          r = softClipper.process(r);
          l = limiter.process(l);
          r = limiter.process(r);
          // Add slight low-end boost for warmth
          l *= 1.05;
          r *= 1.05;
          return { left: l, right: r };
        };
      },
      
      'Modern Bright': () => {
        const compressor = new AdaptiveCompressor(-12, 3.0, 0.002, 0.05, 1.5, 1.5);
        compressor.setSampleRate(sampleRate);
        const limiter = new Limiter(0.95, 0.05);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          let l = compressor.process(left);
          let r = compressor.process(right);
          // High-frequency boost
          l *= 1.2;
          r *= 1.2;
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Lo-Fi Character': () => {
        const compressor = new AdaptiveCompressor(-16, 1.8, 0.02, 0.3, 4.0, 2.0);
        compressor.setSampleRate(sampleRate);
        const softClipper = new SoftClipper(2.5, 0.6);
        const limiter = new Limiter(0.92, 0.1);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          // Reduce highs
          let l = left * 0.85;
          let r = right * 0.85;
          l = compressor.process(l);
          r = compressor.process(r);
          l = softClipper.process(l);
          r = softClipper.process(r);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Neo Soul': () => {
        const compressor = new AdaptiveCompressor(-13, 2.2, 0.005, 0.12, 2.5, 1.8);
        compressor.setSampleRate(sampleRate);
        const softClipper = new SoftClipper(1.5, 0.75);
        const limiter = new Limiter(0.95, 0.06);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          let l = compressor.process(left);
          let r = compressor.process(right);
          l = softClipper.process(l);
          r = softClipper.process(r);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Festival Banger': () => {
        const compressor = new AdaptiveCompressor(-6, 4.0, 0.001, 0.03, 1.0, 4.0);
        compressor.setSampleRate(sampleRate);
        const softClipper = new SoftClipper(2.2, 0.85);
        const limiter = new Limiter(0.98, 0.01);
        limiter.setSampleRate(sampleRate);
        const monoBass = new MonoBassProcessor(120, sampleRate);
        
        return (left, right) => {
          const bass = monoBass.process(left, right);
          let l = compressor.process(bass.left);
          let r = compressor.process(bass.right);
          l = softClipper.process(l);
          r = softClipper.process(r);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Focus Center': () => {
        const compressor = new AdaptiveCompressor(-11, 2.8, 0.003, 0.08, 2.0, 1.2);
        compressor.setSampleRate(sampleRate);
        const midSide = new MidSideProcessor(0.6); // Narrow
        const limiter = new Limiter(0.95, 0.05);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          const ms = midSide.process(left, right);
          let l = compressor.process(ms.left);
          let r = compressor.process(ms.right);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Immersive': () => {
        const compressor = new AdaptiveCompressor(-12, 2.5, 0.004, 0.1, 2.0, 1.5);
        compressor.setSampleRate(sampleRate);
        const midSide = new MidSideProcessor(1.4); // Wide
        const limiter = new Limiter(0.95, 0.05);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          const ms = midSide.process(left, right);
          let l = compressor.process(ms.left);
          let r = compressor.process(ms.right);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Wide & Spacious': () => {
        const compressor = new AdaptiveCompressor(-11, 2.6, 0.003, 0.09, 2.0, 1.2);
        compressor.setSampleRate(sampleRate);
        const midSide = new MidSideProcessor(1.7); // Very wide
        const monoBass = new MonoBassProcessor(120, sampleRate);
        const limiter = new Limiter(0.95, 0.05);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          const bass = monoBass.process(left, right);
          const ms = midSide.process(bass.left, bass.right);
          let l = compressor.process(ms.left);
          let r = compressor.process(ms.right);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Vocal Forward': () => {
        const dynamicEQ = new DynamicEQ(2500, 1.8, -14, 2.5, 0.002, 0.06, 6);
        dynamicEQ.setSampleRate(sampleRate);
        const compressor = new AdaptiveCompressor(-10, 3.0, 0.002, 0.05, 1.5, 2.0);
        compressor.setSampleRate(sampleRate);
        const limiter = new Limiter(0.95, 0.05);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          let l = dynamicEQ.process(left, left);
          let r = dynamicEQ.process(right, right);
          l = compressor.process(l);
          r = compressor.process(r);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Smooth Mids': () => {
        const dynamicEQ = new DynamicEQ(2000, 2.0, -12, 3.5, 0.004, 0.12, -7);
        dynamicEQ.setSampleRate(sampleRate);
        const compressor = new AdaptiveCompressor(-13, 2.3, 0.005, 0.1, 2.5, 1.2);
        compressor.setSampleRate(sampleRate);
        const limiter = new Limiter(0.95, 0.06);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          let l = dynamicEQ.process(left, left);
          let r = dynamicEQ.process(right, right);
          l = compressor.process(l);
          r = compressor.process(r);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Dynamic & Clear': () => {
        const compressor = new AdaptiveCompressor(-16, 1.5, 0.01, 0.15, 4.0, 0.8);
        compressor.setSampleRate(sampleRate);
        const limiter = new Limiter(0.95, 0.08);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          let l = compressor.process(left);
          let r = compressor.process(right);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'Maximum Impact': () => {
        const compressor = new AdaptiveCompressor(-5, 4.5, 0.001, 0.02, 0.8, 5.0);
        compressor.setSampleRate(sampleRate);
        const softClipper = new SoftClipper(2.5, 0.88);
        const limiter = new Limiter(0.99, 0.005);
        limiter.setSampleRate(sampleRate);
        const monoBass = new MonoBassProcessor(120, sampleRate);
        
        return (left, right) => {
          const bass = monoBass.process(left, right);
          let l = compressor.process(bass.left);
          let r = compressor.process(bass.right);
          l = softClipper.process(l);
          r = softClipper.process(r);
          l = limiter.process(l);
          r = limiter.process(r);
          return { left: l, right: r };
        };
      },
      
      'BigCappo': () => {
        // Advanced pitch corrector - helps when you go off-key
        const pitchCorrector = new AdvancedPitchCorrector(25, 0.2, sampleRate);
        const dynamicEQ = new DynamicEQ(3000, 2.2, -13, 2.8, 0.004, 0.1, 3);
        dynamicEQ.setSampleRate(sampleRate);
        const compressor = new AdaptiveCompressor(-12, 2.4, 0.005, 0.12, 2.5, 2.2);
        compressor.setSampleRate(sampleRate);
        const softClipper = new SoftClipper(1.6, 0.75);
        const limiter = new Limiter(0.95, 0.06);
        limiter.setSampleRate(sampleRate);
        
        return (left, right) => {
          // Apply pitch correction first - helps off-key vocals
          const corrected = pitchCorrector.processStereo(left, right);
          let l = corrected.left;
          let r = corrected.right;
          
          // Emphasize emotional mids
          l = dynamicEQ.process(l, l);
          r = dynamicEQ.process(r, r);
          // Slight mid boost for emotional character
          l *= 1.08;
          r *= 1.08;
          
          l = compressor.process(l);
          r = compressor.process(r);
          l = softClipper.process(l);
          r = softClipper.process(r);
          l = limiter.process(l);
          r = limiter.process(r);
          
          return { left: l, right: r };
        };
      }
    };
    
    const processor = processors[presetName];
    return processor ? processor() : null;
  }

  processAudio(e) {
    const inputBuffer = e.inputBuffer;
    const outputBuffer = e.outputBuffer;
    
    const inputLeft = inputBuffer.getChannelData(0);
    const inputRight = inputBuffer.numberOfChannels > 1 
      ? inputBuffer.getChannelData(1) 
      : inputLeft;
    
    const outputLeft = outputBuffer.getChannelData(0);
    const outputRight = outputBuffer.numberOfChannels > 1 
      ? outputBuffer.getChannelData(1) 
      : outputLeft;
    
    if (this.presetProcessor && this.currentPreset) {
      // Process with preset
      for (let i = 0; i < inputBuffer.length; i++) {
        const processed = this.presetProcessor(inputLeft[i], inputRight[i]);
        outputLeft[i] = processed.left;
        outputRight[i] = processed.right;
      }
    } else {
      // Pass through (original)
      for (let i = 0; i < inputBuffer.length; i++) {
        outputLeft[i] = inputLeft[i];
        outputRight[i] = inputRight[i];
      }
    }
  }

  // Note: Connection is handled in audioEngine.js
  // This method is kept for compatibility but connection happens externally

  disconnect() {
    if (this.processorNode) {
      this.processorNode.disconnect();
    }
  }
}
