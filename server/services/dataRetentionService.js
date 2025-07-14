import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class DataRetentionService {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'server', 'data', 'discovery-results');
    this.logDir = path.join(process.cwd(), 'server', 'data', 'privacy-logs');
    this.RETENTION_DAYS = 7;
    this.LOG_RETENTION_DAYS = 30;
    
    // Ensure directories exist
    this.ensureDirectories();
    
    // Start cleanup scheduler
    this.startCleanupScheduler();
  }

  ensureDirectories() {
    [this.dataDir, this.logDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate a unique search ID for tracking
   * @returns {string} Unique search identifier
   */
  generateSearchId() {
    return crypto.randomUUID();
  }

  /**
   * Store discovery results with automatic expiration
   * @param {Object} searchData - Original search parameters
   * @param {Object} results - Discovery results
   * @param {string} legalBasis - Legal basis for processing
   * @returns {string} Search ID for future reference
   */
  async storeDiscoveryResults(searchData, results, legalBasis) {
    const searchId = this.generateSearchId();
    const timestamp = new Date().toISOString();
    const expirationDate = new Date(Date.now() + (this.RETENTION_DAYS * 24 * 60 * 60 * 1000));

    const dataRecord = {
      searchId,
      timestamp,
      expirationDate: expirationDate.toISOString(),
      legalBasis,
      searchCriteria: {
        // Store minimal search criteria (no personal details)
        fullName: this.hashPersonalData(searchData.fullName),
        hasEmail: !!searchData.email,
        hasUsername: !!searchData.username,
        hasLocation: !!searchData.location
      },
      results: this.sanitizeResults(results),
      retentionPolicy: {
        autoDeleteAfterDays: this.RETENTION_DAYS,
        reason: 'GDPR/CCPA compliance - minimal retention period'
      }
    };

    // Store the data
    const filePath = path.join(this.dataDir, `${searchId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(dataRecord, null, 2));

    // Log the data processing activity
    await this.logDataProcessing({
      searchId,
      action: 'DATA_STORED',
      legalBasis,
      timestamp,
      expirationDate: expirationDate.toISOString(),
      dataTypes: ['name', 'public_profiles'],
      purpose: 'digital_legacy_management'
    });

    console.log(`Discovery results stored with ID: ${searchId}, expires: ${expirationDate.toISOString()}`);
    return searchId;
  }

  /**
   * Retrieve stored discovery results
   * @param {string} searchId - Search identifier
   * @returns {Object|null} Discovery results or null if not found/expired
   */
  async getDiscoveryResults(searchId) {
    const filePath = path.join(this.dataDir, `${searchId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const dataRecord = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Check if data has expired
      const now = new Date();
      const expirationDate = new Date(dataRecord.expirationDate);
      
      if (now > expirationDate) {
        console.log(`Data expired for search ID: ${searchId}, deleting...`);
        await this.deleteDiscoveryResults(searchId, 'AUTO_EXPIRATION');
        return null;
      }

      // Log data access
      await this.logDataProcessing({
        searchId,
        action: 'DATA_ACCESSED',
        timestamp: new Date().toISOString(),
        purpose: 'user_retrieval'
      });

      return dataRecord.results;
    } catch (error) {
      console.error(`Error retrieving discovery results for ${searchId}:`, error);
      return null;
    }
  }

  /**
   * Delete discovery results (user-requested or automatic)
   * @param {string} searchId - Search identifier
   * @param {string} reason - Deletion reason
   * @returns {boolean} Success status
   */
  async deleteDiscoveryResults(searchId, reason = 'USER_REQUEST') {
    const filePath = path.join(this.dataDir, `${searchId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return false;
    }

    try {
      // Log deletion before removing file
      await this.logDataProcessing({
        searchId,
        action: 'DATA_DELETED',
        reason,
        timestamp: new Date().toISOString(),
        purpose: 'privacy_compliance'
      });

      // Delete the file
      fs.unlinkSync(filePath);
      console.log(`Discovery results deleted for search ID: ${searchId}, reason: ${reason}`);
      return true;
    } catch (error) {
      console.error(`Error deleting discovery results for ${searchId}:`, error);
      return false;
    }
  }

  /**
   * Clean up expired data automatically
   */
  async cleanupExpiredData() {
    const now = new Date();
    let deletedCount = 0;

    try {
      const files = fs.readdirSync(this.dataDir);
      
      for (const filename of files) {
        if (!filename.endsWith('.json')) continue;
        
        const filePath = path.join(this.dataDir, filename);
        const dataRecord = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const expirationDate = new Date(dataRecord.expirationDate);
        
        if (now > expirationDate) {
          await this.deleteDiscoveryResults(dataRecord.searchId, 'AUTO_EXPIRATION');
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`Cleanup completed: ${deletedCount} expired discovery results deleted`);
      }
    } catch (error) {
      console.error('Error during data cleanup:', error);
    }

    // Also cleanup old logs
    await this.cleanupOldLogs();
  }

  /**
   * Clean up old privacy logs
   */
  async cleanupOldLogs() {
    const cutoffDate = new Date(Date.now() - (this.LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000));
    let deletedCount = 0;

    try {
      const files = fs.readdirSync(this.logDir);
      
      for (const filename of files) {
        if (!filename.endsWith('.json')) continue;
        
        const filePath = path.join(this.logDir, filename);
        const stat = fs.statSync(filePath);
        
        if (stat.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        console.log(`Log cleanup completed: ${deletedCount} old privacy logs deleted`);
      }
    } catch (error) {
      console.error('Error during log cleanup:', error);
    }
  }

  /**
   * Start automatic cleanup scheduler
   */
  startCleanupScheduler() {
    // Run cleanup every 6 hours
    setInterval(() => {
      this.cleanupExpiredData();
    }, 6 * 60 * 60 * 1000);

    // Run initial cleanup on startup
    setTimeout(() => {
      this.cleanupExpiredData();
    }, 5000);
  }

  /**
   * Log data processing activities for audit trail
   * @param {Object} logEntry - Log entry details
   */
  async logDataProcessing(logEntry) {
    const logRecord = {
      ...logEntry,
      timestamp: logEntry.timestamp || new Date().toISOString(),
      service: 'AccountDiscoveryService',
      version: '1.0',
      compliance: {
        gdpr: true,
        ccpa: true,
        purpose_limitation: true,
        data_minimization: true
      }
    };

    const logFile = path.join(this.logDir, `privacy-log-${new Date().toISOString().split('T')[0]}.json`);
    
    // Append to daily log file
    let existingLogs = [];
    if (fs.existsSync(logFile)) {
      try {
        existingLogs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      } catch (error) {
        existingLogs = [];
      }
    }

    existingLogs.push(logRecord);
    fs.writeFileSync(logFile, JSON.stringify(existingLogs, null, 2));
  }

  /**
   * Hash personal data for privacy-compliant storage
   * @param {string} data - Personal data to hash
   * @returns {string} Hashed data
   */
  hashPersonalData(data) {
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex').substring(0, 16);
  }

  /**
   * Sanitize results to remove unnecessary personal data
   * @param {Object} results - Raw discovery results
   * @returns {Object} Sanitized results
   */
  sanitizeResults(results) {
    const sanitized = { ...results };
    
    // Remove search criteria personal data
    if (sanitized.searchCriteria) {
      delete sanitized.searchCriteria.email;
      delete sanitized.searchCriteria.fullName;
    }

    // Sanitize platform results
    Object.keys(sanitized.platforms || {}).forEach(platform => {
      const platformData = sanitized.platforms[platform];
      if (platformData.profiles) {
        platformData.profiles = platformData.profiles.map(profile => ({
          platform: profile.platform,
          url: profile.url,
          confidence: profile.confidence,
          // Remove detailed personal information
          hasName: !!profile.name || !!profile.displayName,
          hasProfileData: !!(profile.bio || profile.title || profile.followers)
        }));
      }
    });

    return sanitized;
  }

  /**
   * Get data retention statistics for admin dashboard
   * @returns {Object} Retention statistics
   */
  async getRetentionStats() {
    const stats = {
      totalStoredResults: 0,
      expiringToday: 0,
      expiringSoon: 0, // Within 24 hours
      averageRetentionDays: 0,
      oldestRecord: null,
      newestRecord: null
    };

    try {
      const files = fs.readdirSync(this.dataDir);
      const now = new Date();
      const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      let totalDays = 0;

      for (const filename of files) {
        if (!filename.endsWith('.json')) continue;
        
        const filePath = path.join(this.dataDir, filename);
        const dataRecord = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const expirationDate = new Date(dataRecord.expirationDate);
        const creationDate = new Date(dataRecord.timestamp);
        
        stats.totalStoredResults++;
        
        // Calculate days until expiration
        const daysUntilExpiration = Math.ceil((expirationDate - now) / (24 * 60 * 60 * 1000));
        totalDays += daysUntilExpiration;
        
        if (daysUntilExpiration <= 0) {
          stats.expiringToday++;
        } else if (expirationDate <= tomorrow) {
          stats.expiringSoon++;
        }

        // Track oldest and newest
        if (!stats.oldestRecord || creationDate < new Date(stats.oldestRecord)) {
          stats.oldestRecord = dataRecord.timestamp;
        }
        if (!stats.newestRecord || creationDate > new Date(stats.newestRecord)) {
          stats.newestRecord = dataRecord.timestamp;
        }
      }

      if (stats.totalStoredResults > 0) {
        stats.averageRetentionDays = Math.round(totalDays / stats.totalStoredResults);
      }
    } catch (error) {
      console.error('Error calculating retention stats:', error);
    }

    return stats;
  }
}

export default DataRetentionService;