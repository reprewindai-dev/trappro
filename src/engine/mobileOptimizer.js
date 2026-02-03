/**
 * Mobile Optimization System
 * Optimizes processing for mobile devices
 */

export class MobileOptimizer {
  constructor() {
    this.isMobile = this.detectMobile();
    this.performanceMode = this.detectPerformanceMode();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  detectPerformanceMode() {
    // Detect device capabilities
    const cores = navigator.hardwareConcurrency || 2;
    const memory = (navigator.deviceMemory || 4) * 1024; // Convert to MB
    
    if (cores >= 8 && memory >= 8000) {
      return 'high'; // High-end device
    } else if (cores >= 4 && memory >= 4000) {
      return 'medium'; // Mid-range device
    } else {
      return 'low'; // Low-end device
    }
  }

  /**
   * Get optimized buffer size for ScriptProcessorNode
   */
  getOptimalBufferSize() {
    if (!this.isMobile) {
      return 4096; // Desktop: larger buffer
    }

    switch (this.performanceMode) {
      case 'high':
        return 2048; // High-end mobile
      case 'medium':
        return 1024; // Mid-range mobile
      case 'low':
        return 512; // Low-end mobile
      default:
        return 1024;
    }
  }

  /**
   * Get optimized processing settings
   */
  getProcessingSettings() {
    const settings = {
      useOversampling: this.performanceMode === 'high',
      multibandBands: this.performanceMode === 'high' ? 4 : 3,
      enableAdvancedEQ: this.performanceMode !== 'low',
      enableTruePeak: this.performanceMode === 'high'
    };

    return settings;
  }

  /**
   * Optimize preset processing for mobile
   */
  optimizePresetProcessing(presetConfig) {
    if (!this.isMobile) {
      return presetConfig; // No optimization needed
    }

    // Reduce complexity for mobile
    const optimized = { ...presetConfig };

    if (this.performanceMode === 'low') {
      // Simplify processing for low-end devices
      optimized.complexity = 'simple';
      optimized.useMultiband = false;
      optimized.useAdvancedEQ = false;
    } else if (this.performanceMode === 'medium') {
      // Moderate complexity
      optimized.complexity = 'moderate';
      optimized.useMultiband = true;
      optimized.useAdvancedEQ = true;
    } else {
      // Full quality for high-end mobile
      optimized.complexity = 'full';
      optimized.useMultiband = true;
      optimized.useAdvancedEQ = true;
    }

    return optimized;
  }

  /**
   * Check if device can handle real-time processing
   */
  canHandleRealtime() {
    if (!this.isMobile) {
      return true; // Desktop always can
    }

    return this.performanceMode !== 'low';
  }

  /**
   * Get recommended quality setting
   */
  getRecommendedQuality() {
    if (!this.isMobile) {
      return 'high';
    }

    switch (this.performanceMode) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  }
}
