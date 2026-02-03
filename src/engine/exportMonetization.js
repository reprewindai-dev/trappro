/**
 * Export Monetization System
 * Handles per-export payment and usage tracking
 */

export class ExportMonetization {
  constructor() {
    this.exportsUsed = this.loadExportsUsed();
    this.exportLimit = 3; // Free tier: 3 exports
    this.premiumUnlocked = false;
  }

  /**
   * Load exports used from localStorage
   */
  loadExportsUsed() {
    try {
      const stored = localStorage.getItem('trapmasterpro_exports');
      if (stored) {
        const data = JSON.parse(stored);
        // Reset if it's a new day
        const today = new Date().toDateString();
        if (data.date !== today) {
          return { count: 0, date: today };
        }
        return data;
      }
    } catch (e) {
      console.error('Failed to load exports:', e);
    }
    return { count: 0, date: new Date().toDateString() };
  }

  /**
   * Save exports used to localStorage
   */
  saveExportsUsed() {
    try {
      localStorage.setItem('trapmasterpro_exports', JSON.stringify(this.exportsUsed));
    } catch (e) {
      console.error('Failed to save exports:', e);
    }
  }

  /**
   * Check if export is allowed
   */
  canExport() {
    if (this.premiumUnlocked) {
      return { allowed: true, reason: 'Premium unlocked' };
    }

    if (this.exportsUsed.count < this.exportLimit) {
      return { 
        allowed: true, 
        reason: `${this.exportLimit - this.exportsUsed.count} exports remaining today` 
      };
    }

    return { 
      allowed: false, 
      reason: 'Daily export limit reached',
      remaining: 0,
      limit: this.exportLimit
    };
  }

  /**
   * Register an export
   */
  registerExport() {
    const check = this.canExport();
    if (!check.allowed) {
      return check;
    }

    if (!this.premiumUnlocked) {
      this.exportsUsed.count++;
      this.saveExportsUsed();
    }

    return {
      allowed: true,
      remaining: this.premiumUnlocked ? 'unlimited' : this.exportLimit - this.exportsUsed.count,
      totalUsed: this.exportsUsed.count
    };
  }

  /**
   * Get export status
   */
  getExportStatus() {
    return {
      used: this.exportsUsed.count,
      limit: this.exportLimit,
      remaining: Math.max(0, this.exportLimit - this.exportsUsed.count),
      premium: this.premiumUnlocked,
      resetDate: new Date().toDateString() === this.exportsUsed.date ? 'tomorrow' : 'today'
    };
  }

  /**
   * Unlock premium (for payment integration)
   */
  unlockPremium() {
    this.premiumUnlocked = true;
    // In production, this would verify payment with backend
    return true;
  }

  /**
   * Purchase single export (pay-per-export)
   */
  async purchaseExport() {
    // In production, this would integrate with payment provider
    // For now, simulate payment
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful payment
        this.exportsUsed.count = Math.max(0, this.exportsUsed.count - 1);
        this.saveExportsUsed();
        resolve({ success: true, message: 'Export purchased' });
      }, 1000);
    });
  }
}
