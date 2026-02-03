/**
 * Stem-Aware Detector
 * Detects if audio is full mix vs stems and provides intelligent hints
 */

export class StemAwareDetector {
  constructor() {
    this.detectionThresholds = {
      vocalIsolation: 0.4, // If vocal energy > 40% of total, likely stems
      stereoWidth: 0.3, // If stereo width < 30%, likely mono stem
      frequencyBalance: 0.5 // If frequency balance is extreme, likely stem
    };
  }

  /**
   * Analyze audio to detect if it's stems or full mix
   */
  analyze(audioBuffer, analysisData) {
    const results = {
      isFullMix: true,
      confidence: 0.5,
      hints: [],
      recommendations: []
    };

    // Check vocal dominance
    if (analysisData.vocalDominance > this.detectionThresholds.vocalIsolation) {
      results.isFullMix = false;
      results.confidence += 0.2;
      results.hints.push('High vocal presence detected - may be vocal stem');
      results.recommendations.push('Use full mix (vocals + beat) for best results');
    }

    // Check stereo width
    const stereoCorr = analysisData.stereoCorrelation?.correlation || 1.0;
    if (stereoCorr > 0.9) {
      results.isFullMix = false;
      results.confidence += 0.15;
      results.hints.push('Mono or very narrow stereo detected');
      results.recommendations.push('Full mixes work best with TrapMasterPro');
    }

    // Check frequency balance
    const spectral = analysisData.spectralBalance || { low: 0.33, mid: 0.33, high: 0.33 };
    const imbalance = Math.max(
      Math.abs(spectral.low - 0.33),
      Math.abs(spectral.mid - 0.33),
      Math.abs(spectral.high - 0.33)
    );

    if (imbalance > 0.3) {
      results.isFullMix = false;
      results.confidence += 0.15;
      results.hints.push('Unusual frequency balance detected');
      results.recommendations.push('Ensure you\'re using a full mix (not individual stems)');
    }

    // Check dynamic range
    if (analysisData.dynamicRange > 15) {
      results.hints.push('High dynamic range - may benefit from light compression');
    }

    // Final determination
    if (results.confidence > 0.5) {
      results.isFullMix = false;
    }

    return results;
  }

  /**
   * Get preset recommendations based on detection
   */
  getPresetRecommendations(detectionResults, analysisData) {
    const recommendations = [];

    if (!detectionResults.isFullMix) {
      recommendations.push({
        preset: 'Dynamic & Clear',
        reason: 'Light processing works best with stems',
        priority: 'high'
      });
    } else {
      // Full mix recommendations
      if (analysisData.harshness > 0.25) {
        recommendations.push({
          preset: 'De-Harsh',
          reason: 'High harshness detected in full mix',
          priority: 'high'
        });
      }

      if (analysisData.mud > 0.2) {
        recommendations.push({
          preset: 'Mud Remover',
          reason: 'Mud detected in low-mids',
          priority: 'high'
        });
      }

      if (analysisData.bassStability > 0.3) {
        recommendations.push({
          preset: 'Bass Tamer',
          reason: 'Bass needs control',
          priority: 'medium'
        });
      }
    }

    return recommendations;
  }
}
