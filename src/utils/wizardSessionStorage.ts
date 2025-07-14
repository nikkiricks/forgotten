/**
 * Privacy-First Session Storage for Document Preparation Wizard
 * 
 * PRIVACY PRINCIPLES:
 * - All data stored in browser session storage (expires when browser closes)
 * - No server-side storage of sensitive legal information
 * - Clear user consent and privacy notices
 * - Manual session clearing options
 * - Warnings for shared/public computers
 */

import React from 'react';

export interface WizardSessionData {
  // Wizard State
  currentStep: number;
  completedSteps: number[];
  lastUpdated: string;
  
  // User Information (minimal required data)
  selectedState?: string;
  deceasedInfo?: {
    fullName?: string;
    dateOfDeath?: string;
    county?: string;
    hasWill?: boolean;
  };
  
  // Petitioner Information
  petitionerInfo?: {
    fullName?: string;
    relationship?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  
  // Document Preparation State
  documentPreferences?: {
    includeDigitalAssets?: boolean;
    expeditedProcessing?: boolean;
    bondWaiver?: boolean;
  };
  
  // Generated Documents (references only, not full content)
  generatedDocuments?: {
    documentId: string;
    documentType: string;
    generatedAt: string;
    status: 'draft' | 'completed';
  }[];
  
  // Privacy Consent
  privacyConsent?: {
    sessionStorageConsent: boolean;
    sharedComputerWarningAcknowledged: boolean;
    consentTimestamp: string;
  };
}

class WizardSessionStorage {
  private readonly SESSION_KEY = 'forgotten_wizard_session';
  private readonly PRIVACY_KEY = 'forgotten_wizard_privacy';
  
  /**
   * Initialize session with privacy checks
   */
  initializeSession(): void {
    // Check if privacy consent exists
    const privacyConsent = this.getPrivacyConsent();
    if (!privacyConsent?.sessionStorageConsent) {
      // Clear any existing session data if no consent
      this.clearSession();
    }
    
    // Warn about session expiration
    this.setupSessionWarnings();
  }

  /**
   * Get current session data
   */
  getSessionData(): WizardSessionData | null {
    try {
      const data = sessionStorage.getItem(this.SESSION_KEY);
      if (!data) return null;
      
      const sessionData: WizardSessionData = JSON.parse(data);
      
      // Validate session data hasn't expired (session storage should handle this, but extra safety)
      if (sessionData.lastUpdated) {
        const lastUpdate = new Date(sessionData.lastUpdated);
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
        
        // Clear session if older than 24 hours (safety measure)
        if (hoursSinceUpdate > 24) {
          this.clearSession();
          return null;
        }
      }
      
      return sessionData;
    } catch (error) {
      console.error('Error reading wizard session:', error);
      return null;
    }
  }

  /**
   * Update session data
   */
  updateSessionData(updates: Partial<WizardSessionData>): void {
    const currentData = this.getSessionData() || {};
    const updatedData: WizardSessionData = {
      ...currentData,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    try {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving wizard session:', error);
      // Handle storage quota exceeded
      if (error instanceof DOMException && error.code === 22) {
        alert('Session storage is full. Please clear some browser data or use a different browser.');
      }
    }
  }

  /**
   * Set privacy consent
   */
  setPrivacyConsent(consent: {
    sessionStorageConsent: boolean;
    sharedComputerWarningAcknowledged: boolean;
  }): void {
    const privacyData = {
      ...consent,
      consentTimestamp: new Date().toISOString()
    };
    
    try {
      sessionStorage.setItem(this.PRIVACY_KEY, JSON.stringify(privacyData));
      
      // Update session data with consent
      this.updateSessionData({
        privacyConsent: privacyData
      });
    } catch (error) {
      console.error('Error saving privacy consent:', error);
    }
  }

  /**
   * Get privacy consent status
   */
  getPrivacyConsent(): WizardSessionData['privacyConsent'] | null {
    try {
      const data = sessionStorage.getItem(this.PRIVACY_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading privacy consent:', error);
      return null;
    }
  }

  /**
   * Clear all session data
   */
  clearSession(): void {
    try {
      sessionStorage.removeItem(this.SESSION_KEY);
      sessionStorage.removeItem(this.PRIVACY_KEY);
      console.log('Wizard session cleared for privacy');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Check if session has valid privacy consent
   */
  hasValidConsent(): boolean {
    const consent = this.getPrivacyConsent();
    return !!(consent?.sessionStorageConsent);
  }

  /**
   * Get session data summary for user
   */
  getSessionSummary(): {
    hasActiveSession: boolean;
    stepsCompleted: number;
    lastUpdated?: string;
    dataSize: string;
  } {
    const sessionData = this.getSessionData();
    const sessionString = sessionStorage.getItem(this.SESSION_KEY) || '';
    
    return {
      hasActiveSession: !!sessionData,
      stepsCompleted: sessionData?.completedSteps?.length || 0,
      lastUpdated: sessionData?.lastUpdated,
      dataSize: `${Math.round(sessionString.length / 1024 * 100) / 100} KB`
    };
  }

  /**
   * Export session data for user download (privacy feature)
   */
  exportSessionData(): string {
    const sessionData = this.getSessionData();
    if (!sessionData) return '';
    
    // Remove sensitive internal data
    const exportData = {
      ...sessionData,
      // Remove internal tracking
      privacyConsent: undefined
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Setup session warnings and cleanup
   */
  private setupSessionWarnings(): void {
    // Warn user before page unload
    window.addEventListener('beforeunload', (event) => {
      const sessionData = this.getSessionData();
      if (sessionData && Object.keys(sessionData).length > 2) { // More than just timestamp and step
        event.preventDefault();
        event.returnValue = 'You have unsaved wizard progress. Your session data will be lost when you close this browser.';
      }
    });

    // Detect if user might be on shared computer
    this.detectSharedComputer();
  }

  /**
   * Detect potential shared computer usage
   */
  private detectSharedComputer(): void {
    // Simple heuristics for shared computer detection
    const indicators = {
      publicWifi: navigator.connection?.effectiveType === 'slow-2g', // Simplified check
      incognitoMode: false, // Can't reliably detect
      multipleUsers: localStorage.length > 50 // Many stored items might indicate shared use
    };

    // Check for signs of shared computer
    if (indicators.multipleUsers) {
      console.warn('Potential shared computer detected - recommend private browsing');
    }
  }

  /**
   * Security cleanup on page visibility change
   */
  setupVisibilityBasedCleanup(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // User switched away - could clear session for extra security
        const consent = this.getPrivacyConsent();
        if (consent?.sharedComputerWarningAcknowledged) {
          // If user acknowledged shared computer warning, be more aggressive about cleanup
          setTimeout(() => {
            if (document.hidden) {
              this.clearSession();
            }
          }, 30000); // Clear after 30 seconds of being hidden
        }
      }
    });
  }
}

// Singleton instance
export const wizardSession = new WizardSessionStorage();

// Privacy-aware session hooks for React components
export const useWizardSession = () => {
  const [sessionData, setSessionData] = React.useState<WizardSessionData | null>(null);
  const [hasConsent, setHasConsent] = React.useState(false);

  React.useEffect(() => {
    wizardSession.initializeSession();
    setSessionData(wizardSession.getSessionData());
    setHasConsent(wizardSession.hasValidConsent());
  }, []);

  const updateSession = React.useCallback((updates: Partial<WizardSessionData>) => {
    if (!hasConsent) {
      console.warn('Cannot update session without privacy consent');
      return;
    }
    
    wizardSession.updateSessionData(updates);
    setSessionData(wizardSession.getSessionData());
  }, [hasConsent]);

  const clearSession = React.useCallback(() => {
    wizardSession.clearSession();
    setSessionData(null);
    setHasConsent(false);
  }, []);

  const setPrivacyConsent = React.useCallback((consent: {
    sessionStorageConsent: boolean;
    sharedComputerWarningAcknowledged: boolean;
  }) => {
    wizardSession.setPrivacyConsent(consent);
    setHasConsent(consent.sessionStorageConsent);
  }, []);

  return {
    sessionData,
    hasConsent,
    updateSession,
    clearSession,
    setPrivacyConsent,
    sessionSummary: wizardSession.getSessionSummary(),
    exportData: () => wizardSession.exportSessionData()
  };
};

// Privacy notice text constants
export const PRIVACY_NOTICES = {
  SESSION_STORAGE: `
    Your legal document preparation data is stored locally in your browser's session storage.
    This means your sensitive information never leaves your device and is automatically
    deleted when you close your browser window.
  `,
  
  SHARED_COMPUTER: `
    If you're using a shared or public computer, your session data could be accessible to other users.
  `,
  
  DATA_RETENTION: `
    Session data automatically expires when:
    • You close your browser window
    • You clear your browser data
    • You manually clear the session
    • No activity for 24+ hours (safety measure)
  `,
  
  NO_SERVER_STORAGE: `
    We do NOT store your legal document data on our servers. Everything stays
    on your device for maximum privacy and security.
  `
};

