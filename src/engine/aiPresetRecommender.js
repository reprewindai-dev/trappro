/**
 * AI Preset Recommender
 * Analyzes audio and recommends best presets based on characteristics
 */

import { getAllPresets } from './presetCategories.js';

export class AIPresetRecommender {
  constructor() {
    this.presets = getAllPresets();
  }

  /**
   * Recommend presets based on audio analysis
   */
  recommend(analysisData) {
    const scores = this.presets.map(preset => ({
      preset,
      score: this.calculateScore(preset, analysisData)
    }));

    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);

    // Return top 5 recommendations
    return scores.slice(0, 5).map(s => ({
      preset: s.preset,
      score: s.score,
      reason: this.getRecommendationReason(s.preset, analysisData)
    }));
  }

  calculateScore(preset, analysis) {
    let score = 0;

    // Check harshness
    if (preset.tags.includes('harshness') && analysis.harshness > 0.25) {
      score += 30;
    }
    if (preset.tags.includes('de-harsh') && analysis.harshness > 0.3) {
      score += 25;
    }

    // Check mud
    if (preset.tags.includes('mud') && analysis.mud > 0.2) {
      score += 30;
    }
    if (preset.tags.includes('low-mid') && analysis.mud > 0.25) {
      score += 25;
    }

    // Check bass
    if (preset.tags.includes('bass') && analysis.bassStability > 0.3) {
      score += 25;
    }
    if (preset.tags.includes('low-end') && analysis.bassStability < 0.15) {
      score += 20;
    }

    // Check vocals
    if (preset.tags.includes('vocal') && analysis.vocalDominance > 0.2) {
      score += 25;
    }
    if (preset.tags.includes('vocal-forward') && analysis.vocalDominance < 0.15) {
      score += 20;
    }

    // Check dynamic range
    if (preset.tags.includes('dynamic') && analysis.dynamicRange > 10) {
      score += 20;
    }
    if (preset.tags.includes('loud') && analysis.dynamicRange < 8) {
      score += 15;
    }

    // Check stereo
    if (preset.tags.includes('wide') && analysis.stereoCorrelation.correlation < 0.5) {
      score += 20;
    }
    if (preset.tags.includes('mono') && analysis.stereoCorrelation.correlation > 0.8) {
      score += 15;
    }

    // Genre-specific scoring
    const spectralBalance = analysis.spectralBalance;
    if (preset.tags.includes('trap') && spectralBalance.low > 0.4) {
      score += 15;
    }
    if (preset.tags.includes('r&b') && spectralBalance.mid > 0.4) {
      score += 15;
    }
    if (preset.tags.includes('hip-hop') && spectralBalance.low > 0.35 && spectralBalance.mid > 0.35) {
      score += 15;
    }

    // Boost signature preset
    if (preset.id === 'bigcappo') {
      score += 10;
    }

    return score;
  }

  getRecommendationReason(preset, analysis) {
    const reasons = [];

    if (preset.tags.includes('harshness') && analysis.harshness > 0.25) {
      reasons.push('High harshness detected');
    }
    if (preset.tags.includes('mud') && analysis.mud > 0.2) {
      reasons.push('Mud detected in low-mids');
    }
    if (preset.tags.includes('bass') && analysis.bassStability > 0.3) {
      reasons.push('Bass needs control');
    }
    if (preset.tags.includes('vocal') && analysis.vocalDominance > 0.2) {
      reasons.push('Vocal-forward track');
    }
    if (preset.tags.includes('dynamic') && analysis.dynamicRange > 10) {
      reasons.push('High dynamic range');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Good match for your track';
  }

  /**
   * Get presets by problem area
   */
  getPresetsByProblem(problem) {
    const problemMap = {
      'harsh': ['de-harsh', 'smooth-mids', 'vocal-clarity'],
      'mud': ['mud-remover', 'bass-tamer', 'smooth-mids'],
      'bass': ['bass-tamer', 'bass-boost', 'mono-optimized'],
      'vocals': ['vocal-forward', 'vocal-clarity', 'focus-center'],
      'width': ['wide-spacious', 'immersive', 'wide-vocals'],
      'loudness': ['maximum-impact', 'festival-banger', 'competitive-loud']
    };

    const tags = problemMap[problem] || [];
    return this.presets.filter(p => 
      tags.some(tag => p.tags.includes(tag))
    );
  }
}
