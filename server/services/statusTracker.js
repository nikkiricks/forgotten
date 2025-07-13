import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class StatusTracker {
  constructor() {
    this.statusFile = path.join(process.cwd(), 'data', 'status-tracking.json');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.statusFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.statusFile)) {
      fs.writeFileSync(this.statusFile, JSON.stringify([], null, 2));
    }
  }

  /**
   * Generate a secure, user-friendly tracking number
   * Format: FRG-XXXX-XXXX-XXXX (12 characters + dashes)
   */
  generateTrackingNumber() {
    const randomBytes = crypto.randomBytes(6);
    const base36 = randomBytes.toString('hex').toUpperCase();
    
    // Format as FRG-XXXX-XXXX-XXXX for better UX
    return `FRG-${base36.substring(0, 4)}-${base36.substring(4, 8)}-${base36.substring(8, 12)}`;
  }

  /**
   * Create a new tracking entry with zero PII storage
   * Only stores: tracking number, status, platforms, timestamps
   */
  async createTracking(platforms, estimatedDays = 14) {
    const trackingNumber = this.generateTrackingNumber();
    const now = new Date().toISOString();
    
    const trackingEntry = {
      trackingNumber,
      status: 'submitted',
      platforms: platforms.map(platform => ({
        name: platform,
        status: 'submitted',
        lastUpdated: now
      })),
      submittedAt: now,
      lastUpdated: now,
      estimatedCompletionDate: this.calculateEstimatedCompletion(estimatedDays),
      statusHistory: [
        {
          status: 'submitted',
          timestamp: now,
          message: 'Request submitted successfully'
        }
      ],
      // Auto-expire after 90 days to ensure no long-term data retention
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    };

    const trackingData = this.loadTrackingData();
    
    // Clean up expired entries before adding new one
    this.cleanupExpiredEntries(trackingData);
    
    trackingData.push(trackingEntry);
    this.saveTrackingData(trackingData);
    
    return trackingNumber;
  }

  /**
   * Look up status by tracking number (no PII required)
   */
  async getStatus(trackingNumber) {
    const trackingData = this.loadTrackingData();
    const entry = trackingData.find(t => t.trackingNumber === trackingNumber);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (new Date() > new Date(entry.expiresAt)) {
      return null;
    }

    return {
      trackingNumber: entry.trackingNumber,
      status: entry.status,
      platforms: entry.platforms,
      submittedAt: entry.submittedAt,
      lastUpdated: entry.lastUpdated,
      estimatedCompletionDate: entry.estimatedCompletionDate,
      statusHistory: entry.statusHistory,
      daysRemaining: this.calculateDaysRemaining(entry.estimatedCompletionDate)
    };
  }

  /**
   * Update overall status (admin function)
   */
  async updateStatus(trackingNumber, status, message = '') {
    const trackingData = this.loadTrackingData();
    const entryIndex = trackingData.findIndex(t => t.trackingNumber === trackingNumber);
    
    if (entryIndex === -1) {
      return false;
    }

    const now = new Date().toISOString();
    const entry = trackingData[entryIndex];
    
    entry.status = status;
    entry.lastUpdated = now;
    
    // Add to status history
    entry.statusHistory.push({
      status,
      timestamp: now,
      message: message || this.getDefaultStatusMessage(status)
    });

    // Update estimated completion if moving to final statuses
    if (status === 'completed') {
      entry.estimatedCompletionDate = now;
    }

    this.saveTrackingData(trackingData);
    return true;
  }

  /**
   * Update platform-specific status (admin function)
   */
  async updatePlatformStatus(trackingNumber, platformName, status, message = '') {
    const trackingData = this.loadTrackingData();
    const entryIndex = trackingData.findIndex(t => t.trackingNumber === trackingNumber);
    
    if (entryIndex === -1) {
      return false;
    }

    const now = new Date().toISOString();
    const entry = trackingData[entryIndex];
    
    // Find and update the platform
    const platformIndex = entry.platforms.findIndex(p => p.name === platformName);
    if (platformIndex !== -1) {
      entry.platforms[platformIndex].status = status;
      entry.platforms[platformIndex].lastUpdated = now;
    }

    // Update overall status based on platform statuses
    entry.lastUpdated = now;
    entry.status = this.calculateOverallStatus(entry.platforms);
    
    // Add to status history
    entry.statusHistory.push({
      status: `${platformName}: ${status}`,
      timestamp: now,
      message: message || `${platformName} status updated to ${status}`
    });

    this.saveTrackingData(trackingData);
    return true;
  }

  /**
   * Get admin dashboard stats (no PII exposed)
   */
  async getAdminStats() {
    const trackingData = this.loadTrackingData();
    this.cleanupExpiredEntries(trackingData);
    
    const statusCounts = trackingData.reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {});

    const platformCounts = {};
    trackingData.forEach(entry => {
      entry.platforms.forEach(platform => {
        if (!platformCounts[platform.name]) {
          platformCounts[platform.name] = { total: 0, completed: 0 };
        }
        platformCounts[platform.name].total++;
        if (platform.status === 'completed') {
          platformCounts[platform.name].completed++;
        }
      });
    });

    return {
      totalRequests: trackingData.length,
      statusBreakdown: statusCounts,
      platformBreakdown: platformCounts,
      recentActivity: trackingData
        .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
        .slice(0, 10)
        .map(entry => ({
          trackingNumber: entry.trackingNumber,
          status: entry.status,
          platforms: entry.platforms.map(p => p.name),
          lastUpdated: entry.lastUpdated
        }))
    };
  }

  /**
   * List all tracking numbers for admin (no PII)
   */
  async getAllTracking() {
    const trackingData = this.loadTrackingData();
    this.cleanupExpiredEntries(trackingData);
    
    return trackingData.map(entry => ({
      trackingNumber: entry.trackingNumber,
      status: entry.status,
      platforms: entry.platforms.map(p => ({ name: p.name, status: p.status })),
      submittedAt: entry.submittedAt,
      lastUpdated: entry.lastUpdated,
      estimatedCompletionDate: entry.estimatedCompletionDate
    }));
  }

  // Private helper methods

  loadTrackingData() {
    try {
      const data = fs.readFileSync(this.statusFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  saveTrackingData(data) {
    fs.writeFileSync(this.statusFile, JSON.stringify(data, null, 2));
  }

  cleanupExpiredEntries(trackingData) {
    const now = new Date();
    const validEntries = trackingData.filter(entry => new Date(entry.expiresAt) > now);
    
    if (validEntries.length !== trackingData.length) {
      this.saveTrackingData(validEntries);
      console.log(`Cleaned up ${trackingData.length - validEntries.length} expired tracking entries`);
    }
  }

  calculateEstimatedCompletion(days) {
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + days);
    return completionDate.toISOString();
  }

  calculateDaysRemaining(estimatedCompletionDate) {
    const now = new Date();
    const completion = new Date(estimatedCompletionDate);
    const diffTime = completion - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  calculateOverallStatus(platforms) {
    const statuses = platforms.map(p => p.status);
    
    if (statuses.every(s => s === 'completed')) {
      return 'completed';
    } else if (statuses.some(s => s === 'failed')) {
      return 'action_required';
    } else if (statuses.some(s => s === 'processing')) {
      return 'processing';
    } else {
      return 'submitted';
    }
  }

  getDefaultStatusMessage(status) {
    const messages = {
      'submitted': 'Request has been submitted and is being reviewed',
      'processing': 'Request is being processed by platform teams',
      'action_required': 'Additional information or documentation needed',
      'completed': 'All platform requests have been completed successfully',
      'failed': 'Request could not be completed - please contact support'
    };
    
    return messages[status] || 'Status updated';
  }

  /**
   * Migration helper: Create tracking entry from old request system
   * This helps migrate existing confirmationIds to new tracking system
   */
  async migrateFromOldRequest(oldRequestData) {
    const trackingNumber = this.generateTrackingNumber();
    const now = new Date().toISOString();
    
    // Determine platforms from old request data
    const platforms = [];
    if (oldRequestData.linkedinUrl) platforms.push('linkedin');
    if (oldRequestData.instagramUrl) platforms.push('instagram');
    if (oldRequestData.facebookUrl) platforms.push('facebook');
    if (oldRequestData.youtubeUrl) platforms.push('youtube');
    
    // If no specific platforms detected, assume LinkedIn (legacy default)
    if (platforms.length === 0) platforms.push('linkedin');
    
    const trackingEntry = {
      trackingNumber,
      status: oldRequestData.status || 'submitted',
      platforms: platforms.map(platform => ({
        name: platform,
        status: oldRequestData.status || 'submitted',
        lastUpdated: oldRequestData.lastUpdated || now
      })),
      submittedAt: oldRequestData.timestamp || now,
      lastUpdated: oldRequestData.lastUpdated || now,
      estimatedCompletionDate: this.calculateEstimatedCompletion(14),
      statusHistory: [
        {
          status: 'submitted',
          timestamp: oldRequestData.timestamp || now,
          message: 'Request migrated from legacy system'
        }
      ],
      // Store the old confirmationId for reference during migration period
      legacyConfirmationId: oldRequestData.confirmationId,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    };

    const trackingData = this.loadTrackingData();
    this.cleanupExpiredEntries(trackingData);
    trackingData.push(trackingEntry);
    this.saveTrackingData(trackingData);
    
    return trackingNumber;
  }

  /**
   * Look up by legacy confirmationId and optionally migrate
   */
  async findByLegacyConfirmationId(confirmationId) {
    const trackingData = this.loadTrackingData();
    const entry = trackingData.find(t => t.legacyConfirmationId === confirmationId);
    
    if (entry && new Date() <= new Date(entry.expiresAt)) {
      return {
        trackingNumber: entry.trackingNumber,
        status: entry.status,
        platforms: entry.platforms,
        submittedAt: entry.submittedAt,
        lastUpdated: entry.lastUpdated,
        estimatedCompletionDate: entry.estimatedCompletionDate,
        statusHistory: entry.statusHistory,
        daysRemaining: this.calculateDaysRemaining(entry.estimatedCompletionDate),
        migratedFromLegacy: true
      };
    }
    
    return null;
  }
}

export default StatusTracker;