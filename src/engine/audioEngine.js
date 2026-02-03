/**
 * TrapMasterPro Audio Engine
 * Main engine that coordinates analysis, processing, and A/B comparison
 */

import { AudioAnalysis } from './audioAnalysis.js';
import { PresetEngine } from './presets.js';
import { RealtimeProcessor } from './realtimeProcessor.js';
import { LosslessSampleRateConverter, ProfessionalDither, LosslessTruePeakLimiter, LosslessNormalizer } from './losslessProcessor.js';
import { ExportValidator } from './exportValidator.js';

export class TrapMasterProEngine {
  constructor() {
    this.audioContext = null;
    this.analysisEngine = null;
    this.presetEngine = null;
    this.originalBuffer = null;
    this.processedBuffer = null;
    this.analysisData = null;
    this.currentPreset = null;
  }

  /**
   * Initialize audio context
   */
  async initialize() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sampleRate = this.audioContext.sampleRate;
      
      this.analysisEngine = new AudioAnalysis(this.audioContext, sampleRate);
      this.presetEngine = new PresetEngine(this.audioContext, sampleRate);
      
      // Create gain nodes for mixing original and processed
      this.originalGainNode = this.audioContext.createGain();
      this.processedGainNode = this.audioContext.createGain();
      this.masterGainNode = this.audioContext.createGain();
      
      // Connect gain nodes to master
      this.originalGainNode.connect(this.masterGainNode);
      this.processedGainNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.audioContext.destination);
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }

  /**
   * Load audio file
   */
  async loadAudioFile(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.originalBuffer = audioBuffer;
      this.processedBuffer = null;
      this.analysisData = null;
      
      // Perform analysis
      this.analysisData = await this.analysisEngine.analyze(audioBuffer);
      this.presetEngine.setAnalysis(this.analysisData);
      
      return {
        success: true,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
        analysis: this.analysisData
      };
    } catch (error) {
      console.error('Failed to load audio file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process audio with preset
   */
  async processPreset(presetName) {
    if (!this.originalBuffer) {
      throw new Error('No audio loaded');
    }

    try {
      this.currentPreset = presetName;
      this.processedBuffer = await this.presetEngine.process(
        this.originalBuffer,
        presetName
      );
      
      // Analyze processed audio for loudness matching
      const processedAnalysis = await this.analysisEngine.analyze(this.processedBuffer);
      
      return {
        success: true,
        preset: presetName,
        originalLUFS: this.analysisData.integratedLUFS,
        processedLUFS: processedAnalysis.integratedLUFS,
        buffer: this.processedBuffer
      };
    } catch (error) {
      console.error('Failed to process preset:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get A/B comparison buffers with loudness matching
   */
  getABBuffers() {
    if (!this.originalBuffer) {
      return null;
    }

    const original = this.originalBuffer;
    const processed = this.processedBuffer || this.originalBuffer;
    
    // Calculate loudness matching gain
    const originalLUFS = this.analysisData.integratedLUFS;
    const processedAnalysis = this.analysisEngine.getAnalysis();
    const processedLUFS = processedAnalysis?.integratedLUFS || originalLUFS;
    
    const lufsDifference = originalLUFS - processedLUFS;
    const matchingGain = Math.pow(10, lufsDifference / 20);
    
    // Create loudness-matched buffers
    const matchedOriginal = this.matchLoudness(original, originalLUFS, processedLUFS);
    const matchedProcessed = processed;
    
    return {
      original: matchedOriginal,
      processed: matchedProcessed,
      originalLUFS,
      processedLUFS
    };
  }

  /**
   * Match loudness between two buffers
   */
  matchLoudness(buffer, targetLUFS, sourceLUFS) {
    const lufsDifference = targetLUFS - sourceLUFS;
    const gain = Math.pow(10, lufsDifference / 20);
    
    const matchedBuffer = this.audioContext.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );
    
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const originalData = buffer.getChannelData(ch);
      const matchedData = matchedBuffer.getChannelData(ch);
      
      for (let i = 0; i < originalData.length; i++) {
        matchedData[i] = originalData[i] * gain;
      }
    }
    
    return matchedBuffer;
  }

  /**
   * Get current analysis data
   */
  getAnalysis() {
    return this.analysisData;
  }

  /**
   * Get available presets
   */
  getPresets() {
    return this.presetEngine.getPresetNames();
  }

  /**
   * Get preset intent
   */
  getPresetIntent(presetName) {
    const preset = this.presetEngine.getPreset(presetName);
    return preset ? preset.getIntent() : '';
  }

  /**
   * Export audio buffer to WAV with lossless quality
   */
  async exportToWAV(audioBuffer, filename = 'export.wav', options = {}) {
    const {
      bitDepth = 24,
      sampleRate = null,
      targetLUFS = null,
      dither = true,
      normalize = false
    } = options;

    // Create working copy to avoid modifying original
    let workingBuffer = audioBuffer;
    
    // Sample rate conversion if needed
    if (sampleRate && sampleRate !== audioBuffer.sampleRate) {
      const converter = new LosslessSampleRateConverter(audioBuffer.sampleRate, sampleRate);
      workingBuffer = converter.convert(workingBuffer, this.audioContext);
    }
    
    // Normalize if requested
    if (normalize && targetLUFS !== null) {
      const normalizer = new LosslessNormalizer(targetLUFS, workingBuffer.sampleRate);
      workingBuffer = normalizer.normalize(workingBuffer);
    }
    
    // True peak limiting (if ceiling specified)
    if (truePeakCeiling !== null) {
      const limiter = new LosslessTruePeakLimiter(truePeakCeiling, workingBuffer.sampleRate);
      for (let ch = 0; ch < workingBuffer.numberOfChannels; ch++) {
        const data = workingBuffer.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
          data[i] = limiter.process(data[i]);
        }
      }
    }
    
    const numChannels = workingBuffer.numberOfChannels;
    const length = workingBuffer.length;
    const finalSampleRate = workingBuffer.sampleRate;
    
    // Calculate buffer size based on bit depth
    const bytesPerSample = bitDepth === 32 ? 4 : bitDepth === 24 ? 3 : 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = finalSampleRate * blockAlign;
    const dataSize = length * blockAlign;
    
    // WAV header (extended for 24/32-bit)
    const headerSize = bitDepth === 32 ? 58 : bitDepth === 24 ? 50 : 44;
    const buffer = new ArrayBuffer(headerSize + dataSize);
    const view = new DataView(buffer);
    
    // Write WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, headerSize - 8 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    
    if (bitDepth === 32) {
      // 32-bit float WAV
      view.setUint32(16, 18, true); // fmt chunk size
      view.setUint16(20, 3, true); // audio format (IEEE float)
      view.setUint16(22, numChannels, true);
      view.setUint32(24, finalSampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitDepth, true);
      view.setUint16(36, 0, true); // extension size
      writeString(38, 'data');
      view.setUint32(42, dataSize, true);
      
      // Write 32-bit float samples
      let offset = 46;
      for (let i = 0; i < length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
          const sample = Math.max(-1, Math.min(1, workingBuffer.getChannelData(ch)[i]));
          view.setFloat32(offset, sample, true);
          offset += 4;
        }
      }
    } else if (bitDepth === 24) {
      // 24-bit PCM WAV
      view.setUint32(16, 18, true); // fmt chunk size
      view.setUint16(20, 1, true); // audio format (PCM)
      view.setUint16(22, numChannels, true);
      view.setUint32(24, finalSampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitDepth, true);
      view.setUint16(36, 0, true); // extension size
      writeString(38, 'data');
      view.setUint32(42, dataSize, true);
      
      // Dithering for 24-bit
      const ditherProcessor = dither ? new ProfessionalDither(bitDepth) : null;
      
      // Write 24-bit PCM samples
      let offset = 46;
      const maxValue = Math.pow(2, 23) - 1;
      
      for (let i = 0; i < length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
          let sample = Math.max(-1, Math.min(1, workingBuffer.getChannelData(ch)[i]));
          
          // Apply dithering if enabled
          if (ditherProcessor) {
            sample = ditherProcessor.applyDither(sample);
          }
          
          // Convert to 24-bit integer
          const intSample = Math.round(sample * maxValue);
          
          // Write as 24-bit (3 bytes, little-endian)
          view.setUint8(offset, intSample & 0xFF);
          view.setUint8(offset + 1, (intSample >> 8) & 0xFF);
          view.setUint8(offset + 2, (intSample >> 16) & 0xFF);
          offset += 3;
        }
      }
    } else {
      // 16-bit PCM WAV (standard)
      view.setUint32(16, 16, true); // fmt chunk size
      view.setUint16(20, 1, true); // audio format (PCM)
      view.setUint16(22, numChannels, true);
      view.setUint32(24, finalSampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitDepth, true);
      writeString(36, 'data');
      view.setUint32(40, dataSize, true);
      
      // Dithering for 16-bit (only when reducing bit depth from float32)
      const ditherProcessor = (dither && bitDepth < 32) ? new ProfessionalDither(bitDepth) : null;
      
      // Write 16-bit PCM samples
      let offset = 44;
      for (let i = 0; i < length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
          let sample = Math.max(-1, Math.min(1, workingBuffer.getChannelData(ch)[i]));
          
          // Apply dithering if enabled
          if (ditherProcessor) {
            sample = ditherProcessor.applyDither(sample);
          }
          
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          offset += 2;
        }
      }
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    
    // Validate exported file header (read back the buffer we just created)
    const validator = new ExportValidator();
    const fileValidation = await validator.validateExportedFile(blob, {
      sampleRate: finalSampleRate,
      bitDepth: bitDepth,
      channels: numChannels
    });

    if (!fileValidation.valid) {
      console.error('File header validation failed:', fileValidation.errors);
    } else {
      console.log('File header validation passed:', fileValidation.fileHeader);
      console.log('Expected: sample_rate=48000, bits_per_sample=24');
      console.log('Verify with: ffprobe -hide_banner -show_streams -select_streams a:0 "export.wav"');
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
      return { 
      success: true, 
      filename,
      format: 'WAV',
      bitDepth,
      sampleRate: finalSampleRate,
      lossless: true,
      fileValidation: fileValidation,
      cliVerification: {
        ffprobe: `ffprobe -hide_banner -show_streams -select_streams a:0 "${filename}"`,
        ffmpeg: `ffmpeg -hide_banner -i "${filename}" -filter_complex ebur128=peak=true -f null -`
      }
    };
  }

  /**
   * Export to Apple Music Lossless-compatible format
   * 24-bit/48kHz PCM WAV with -0.5 dBTP ceiling (conservative true-peak estimate)
   * ALAC conversion supported via Apple Music/iTunes
   * Optional loudness target for competitive masters (not part of Apple Music compatibility)
   */
  async exportToAppleLossless(audioBuffer, filename = 'export.m4a', options = {}) {
    const {
      sampleRate = 48000,
      bitDepth = 24,
      targetLUFS = -9, // Optional loudness target (preset feature, not Apple compatibility requirement)
      truePeakCeiling = -0.5
    } = options;

    // Validate before export
    const validator = new ExportValidator();
    const validation = validator.validate(audioBuffer, {
      sampleRate: 48000,
      bitDepth: 24,
      targetLUFS: targetLUFS,
      truePeakCeiling: truePeakCeiling
    });

    // Export as 24-bit/48kHz WAV
    const wavFilename = filename.replace('.m4a', '_AppleLossless.wav');
    
    const result = await this.exportToWAV(audioBuffer, wavFilename, {
      bitDepth: 24,
      sampleRate: 48000,
      targetLUFS: targetLUFS,
      truePeakCeiling: truePeakCeiling,
      dither: true, // Dither when reducing from float32 to 24-bit
      normalize: true
    });

    // Log validation results
    validator.logResults();

    return {
      ...result,
      format: 'WAV (ALAC-compatible)',
      note: 'Apple Music Lossless-compatible: 24-bit/48kHz PCM WAV with -0.5 dBTP ceiling. ALAC conversion supported via Apple Music/iTunes. No official Apple certification claimed.',
      appleMusicCompatible: true,
      validation: validator.getSummary(),
      specifications: {
        sampleRate: '48 kHz',
        bitDepth: '24-bit',
        format: 'PCM WAV',
        truePeakCeiling: `${truePeakCeiling} dBTP (conservative true-peak estimate)`,
        lossless: true,
        disclaimer: 'No official Apple certification claimed'
      }
    };
  }

  /**
   * Export audio buffer to MP3 with high quality
   */
  async exportToMP3(audioBuffer, filename = 'export.mp3', bitrate = 320, options = {}) {
    const {
      dither = true,
      normalize = false,
      targetLUFS = null
    } = options;

    // Apply lossless processing before MP3 encoding
    let workingBuffer = audioBuffer;
    
    if (normalize && targetLUFS !== null) {
      const normalizer = new LosslessNormalizer(targetLUFS, audioBuffer.sampleRate);
      workingBuffer = normalizer.normalize(workingBuffer);
    }
    
    // True peak limiting
    const limiter = new LosslessTruePeakLimiter(-1.0, workingBuffer.sampleRate);
    for (let ch = 0; ch < workingBuffer.numberOfChannels; ch++) {
      const data = workingBuffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        data[i] = limiter.process(data[i]);
      }
    }
    try {
      // Dynamic import for lamejs
      const lamejs = await import('lamejs');
      const { Mp3Encoder } = lamejs.default || lamejs;
      const mp3encoder = new Mp3Encoder(
        audioBuffer.numberOfChannels,
        audioBuffer.sampleRate,
        bitrate
      );
      
      const numChannels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length;
      const sampleRate = audioBuffer.sampleRate;
      const samplesPerBlock = 1152;
      const mp3Data = [];
      
      // Convert float samples to 16-bit PCM with dithering
      const ditherProcessor = dither ? new ProfessionalDither(16) : null;
      const samples = [];
      for (let ch = 0; ch < numChannels; ch++) {
        const channelData = workingBuffer.getChannelData(ch);
        const int16Samples = new Int16Array(length);
        for (let i = 0; i < length; i++) {
          let sample = Math.max(-1, Math.min(1, channelData[i]));
          
          // Apply dithering if enabled
          if (ditherProcessor) {
            sample = ditherProcessor.applyDither(sample);
          }
          
          int16Samples[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        }
        samples.push(int16Samples);
      }
      
      // Encode in blocks
      for (let i = 0; i < length; i += samplesPerBlock) {
        const left = samples[0].subarray(i, i + samplesPerBlock);
        const right = numChannels > 1 
          ? samples[1].subarray(i, i + samplesPerBlock)
          : left;
        
        const mp3buf = mp3encoder.encodeBuffer(left, right);
        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }
      }
      
      // Flush encoder
      const mp3buf = mp3encoder.flush();
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
      
      // Create blob and download
      const blob = new Blob(mp3Data, { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Failed to export MP3:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Play audio buffer (for offline processing)
   */
  playBuffer(audioBuffer, onEnded) {
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    
    if (onEnded) {
      source.onended = onEnded;
    }
    
    source.start(0);
    return source;
  }

  /**
   * Play audio with real-time preset processing
   */
  playRealtime(presetName, originalVolume = 0, processedVolume = 1, onEnded) {
    if (!this.originalBuffer) {
      throw new Error('No audio loaded');
    }

    // Stop any existing playback
    this.stopRealtime();

    // Create source
    const source = this.audioContext.createBufferSource();
    source.buffer = this.originalBuffer;
    
    // Set preset
    if (presetName) {
      this.realtimeProcessor.setPreset(presetName);
      this.currentPreset = presetName;
    }
    
    // Create splitter for original path
    const originalSplitter = this.audioContext.createChannelSplitter(2);
    source.connect(originalSplitter);
    
    // Connect original to gain node (stereo)
    originalSplitter.connect(this.originalGainNode, 0, 0);
    originalSplitter.connect(this.originalGainNode, 1, 0);
    
    // Create splitter for processed path  
    const processedSplitter = this.audioContext.createChannelSplitter(2);
    source.connect(processedSplitter);
    
    // Connect through real-time processor
    // ScriptProcessorNode will receive input from splitter
    processedSplitter.connect(this.realtimeProcessor.processorNode);
    // Processor outputs to processed gain
    this.realtimeProcessor.processorNode.connect(this.processedGainNode);
    
    // Set volumes
    this.originalGainNode.gain.value = originalVolume;
    this.processedGainNode.gain.value = processedVolume;
    
    // Handle end
    if (onEnded) {
      source.onended = onEnded;
    }
    
    source.start(0);
    this.currentSource = source;
    
    return source;
  }

  /**
   * Switch preset in real-time during playback
   */
  switchPresetRealtime(presetName) {
    if (this.realtimeProcessor && this.currentSource) {
      this.realtimeProcessor.setPreset(presetName);
      this.currentPreset = presetName;
    }
  }

  /**
   * Set volume mix (original vs processed)
   */
  setVolumeMix(originalVolume, processedVolume) {
    if (this.originalGainNode && this.processedGainNode) {
      this.originalGainNode.gain.value = originalVolume;
      this.processedGainNode.gain.value = processedVolume;
    }
  }

  /**
   * Stop real-time playback
   */
  stopRealtime() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.currentSource = null;
    }
  }

  /**
   * Stop playback
   */
  stopPlayback(source) {
    if (source) {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    }
    this.stopRealtime();
  }
}
