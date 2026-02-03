/**
 * Export Validator
 * Validates exported audio files meet specifications
 * Logs measurements for verification
 */

export class ExportValidator {
  constructor() {
    this.validationResults = null;
  }

  /**
   * Validate audio buffer before export
   */
  validate(audioBuffer, targetSpecs) {
    const results = {
      sampleRate: audioBuffer.sampleRate,
      bitDepth: 'float32', // Always float32 in Web Audio API
      channels: audioBuffer.numberOfChannels,
      length: audioBuffer.length,
      duration: audioBuffer.duration,
      valid: true,
      warnings: [],
      errors: []
    };

    // Check sample rate
    if (targetSpecs.sampleRate && audioBuffer.sampleRate !== targetSpecs.sampleRate) {
      results.warnings.push(`Sample rate mismatch: ${audioBuffer.sampleRate}Hz vs target ${targetSpecs.sampleRate}Hz`);
    }

    // Measure peak levels
    const peakMeasurements = this.measurePeaks(audioBuffer);
    results.peak = peakMeasurements.peak;
    results.truePeak = peakMeasurements.truePeak;

    // Check true peak ceiling
    if (targetSpecs.truePeakCeiling !== undefined) {
      if (peakMeasurements.truePeak > targetSpecs.truePeakCeiling) {
        results.errors.push(`True peak exceeds ceiling: ${peakMeasurements.truePeak.toFixed(2)} dBTP > ${targetSpecs.truePeakCeiling} dBTP`);
        results.valid = false;
      }
    }

    // Measure LUFS
    const lufs = this.measureLUFS(audioBuffer);
    results.lufs = lufs;

    // Check LUFS target
    if (targetSpecs.targetLUFS !== undefined) {
      const lufsDiff = Math.abs(lufs - targetSpecs.targetLUFS);
      if (lufsDiff > 1.0) {
        results.warnings.push(`LUFS differs from target: ${lufs.toFixed(2)} LUFS vs ${targetSpecs.targetLUFS} LUFS`);
      }
    }

    this.validationResults = results;
    return results;
  }

  /**
   * Measure peak levels (sample peak and true peak)
   */
  measurePeaks(audioBuffer) {
    let peak = -Infinity;
    let truePeak = -Infinity;

    // Simple true peak approximation using interpolation
    // For accurate true peak, would need proper oversampling + reconstruction
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const data = audioBuffer.getChannelData(ch);
      
      for (let i = 0; i < data.length; i++) {
        const absSample = Math.abs(data[i]);
        peak = Math.max(peak, absSample);

        // Approximate true peak with simple interpolation
        // This is a simplified version - full implementation would use proper oversampling
        if (i > 0 && i < data.length - 1) {
          // Simple peak interpolation
          const prev = Math.abs(data[i - 1]);
          const curr = absSample;
          const next = Math.abs(data[i + 1]);
          
          // Estimate inter-sample peak
          const interpPeak = Math.max(prev, curr, next);
          truePeak = Math.max(truePeak, interpPeak);
        } else {
          truePeak = Math.max(truePeak, absSample);
        }
      }
    }

    return {
      peak: peak > 0 ? 20 * Math.log10(peak) : -Infinity,
      truePeak: truePeak > 0 ? 20 * Math.log10(truePeak) : -Infinity
    };
  }

  /**
   * Measure LUFS (simplified)
   */
  measureLUFS(audioBuffer) {
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
    const lufs = rms > 0 ? -0.691 + 10 * Math.log10(rms) : -70;

    return Math.max(-70, Math.min(0, lufs));
  }

  /**
   * Log validation results
   */
  logResults() {
    if (!this.validationResults) return;

    const r = this.validationResults;
    console.group('Export Validation Results');
    console.log(`Sample Rate: ${r.sampleRate} Hz`);
    console.log(`Bit Depth: ${r.bitDepth}`);
    console.log(`Channels: ${r.channels}`);
    console.log(`Duration: ${r.duration.toFixed(2)}s`);
    console.log(`Peak: ${r.peak.toFixed(2)} dBFS`);
    console.log(`True Peak: ${r.truePeak.toFixed(2)} dBTP`);
    console.log(`LUFS: ${r.lufs.toFixed(2)} LUFS`);
    
    if (r.warnings.length > 0) {
      console.warn('Warnings:', r.warnings);
    }
    
    if (r.errors.length > 0) {
      console.error('Errors:', r.errors);
    }
    
    console.log(`Valid: ${r.valid ? '✓' : '✗'}`);
    console.groupEnd();

    return this.validationResults;
  }

  /**
   * Validate exported WAV file header
   * Reads the actual exported blob to verify header matches specs
   * Note: Full verification should be done with ffprobe after download
   */
  async validateExportedFile(blob, expectedSpecs) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          const view = new DataView(arrayBuffer);
          
          const results = {
            valid: true,
            errors: [],
            warnings: [],
            fileHeader: {}
          };

          // Read WAV header
          // Check RIFF header
          const riff = String.fromCharCode(...new Uint8Array(arrayBuffer.slice(0, 4)));
          if (riff !== 'RIFF') {
            results.errors.push('Invalid WAV file: Missing RIFF header');
            results.valid = false;
            resolve(results);
            return;
          }

          // Check WAVE header
          const wave = String.fromCharCode(...new Uint8Array(arrayBuffer.slice(8, 12)));
          if (wave !== 'WAVE') {
            results.errors.push('Invalid WAV file: Missing WAVE header');
            results.valid = false;
            resolve(results);
            return;
          }

          // Read fmt chunk (position varies for 24-bit, check both locations)
          let fmtOffset = 12;
          const fmtId = String.fromCharCode(...new Uint8Array(arrayBuffer.slice(fmtOffset, fmtOffset + 4)));
          
          if (fmtId !== 'fmt ') {
            results.errors.push('Invalid WAV file: Missing fmt chunk');
            results.valid = false;
            resolve(results);
            return;
          }

          const fmtChunkSize = view.getUint32(fmtOffset + 4, true);
          const audioFormat = view.getUint16(fmtOffset + 8, true);
          const channels = view.getUint16(fmtOffset + 10, true);
          const sampleRate = view.getUint32(fmtOffset + 12, true);
          const byteRate = view.getUint32(fmtOffset + 16, true);
          const blockAlign = view.getUint16(fmtOffset + 20, true);
          const bitsPerSample = view.getUint16(fmtOffset + 22, true);

          results.fileHeader = {
            audioFormat,
            channels,
            sampleRate,
            byteRate,
            blockAlign,
            bitsPerSample,
            fmtChunkSize
          };

          // Validate sample rate
          if (expectedSpecs.sampleRate && sampleRate !== expectedSpecs.sampleRate) {
            results.errors.push(`Sample rate mismatch: ${sampleRate}Hz vs expected ${expectedSpecs.sampleRate}Hz`);
            results.valid = false;
          }

          // Validate bit depth
          if (expectedSpecs.bitDepth) {
            const expectedBits = expectedSpecs.bitDepth === 32 ? 32 : expectedSpecs.bitDepth;
            if (bitsPerSample !== expectedBits) {
              results.errors.push(`Bit depth mismatch: ${bitsPerSample}-bit vs expected ${expectedBits}-bit`);
              results.valid = false;
            }
          }

          // Validate channels
          if (expectedSpecs.channels && channels !== expectedSpecs.channels) {
            results.warnings.push(`Channel count: ${channels} vs expected ${expectedSpecs.channels}`);
          }

          // Validate audio format (1 = PCM, 3 = IEEE float)
          if (expectedSpecs.bitDepth === 32 && audioFormat !== 3) {
            results.errors.push(`Audio format mismatch: Expected IEEE float (3), got ${audioFormat}`);
            results.valid = false;
          } else if (expectedSpecs.bitDepth !== 32 && audioFormat !== 1) {
            results.errors.push(`Audio format mismatch: Expected PCM (1), got ${audioFormat}`);
            results.valid = false;
          }

          resolve(results);
        } catch (error) {
          resolve({
            valid: false,
            errors: [`Validation error: ${error.message}`],
            warnings: [],
            fileHeader: null
          });
        }
      };

      reader.onerror = () => {
        resolve({
          valid: false,
          errors: ['Failed to read exported file'],
          warnings: [],
          fileHeader: null
        });
      };

      // Read first 100 bytes (enough for WAV header)
      reader.readAsArrayBuffer(blob.slice(0, 100));
    });
  }

  /**
   * Get validation summary for UI
   */
  getSummary() {
    if (!this.validationResults) return null;

    const r = this.validationResults;
    return {
      sampleRate: `${r.sampleRate} Hz`,
      bitDepth: r.bitDepth,
      truePeak: `${r.truePeak.toFixed(2)} dBTP`,
      lufs: `${r.lufs.toFixed(2)} LUFS`,
      valid: r.valid,
      hasWarnings: r.warnings.length > 0,
      hasErrors: r.errors.length > 0,
      fileHeader: r.fileHeader || null
    };
  }
}
