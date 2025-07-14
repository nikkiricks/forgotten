import React, { useState, useEffect } from 'react';
import { FileText, MapPin, CheckCircle, AlertTriangle, Clock, Phone, Globe, ChevronDown, ChevronUp, Monitor, Smartphone } from 'lucide-react';
import { STATE_REQUIREMENTS, US_STATES } from '../data/stateRequirements';
import { useWizardSession, PRIVACY_NOTICES } from '../utils/wizardSessionStorage';

interface DocumentPreparationWizardProps {
  // Future: Callback for when documents are generated
  // onDocumentsGenerated?: (documents: any[]) => void;
}

const DocumentPreparationWizard: React.FC<DocumentPreparationWizardProps> = () => {
  const { sessionData, hasConsent, updateSession, clearSession, setPrivacyConsent, sessionSummary } = useWizardSession();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedState, setSelectedState] = useState('');
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);
  const [privacyConsent, setPrivacyConsentState] = useState(false);
  const [sharedComputerAcknowledged, setSharedComputerAcknowledged] = useState(false);
  const [showClearingInstructions, setShowClearingInstructions] = useState(false);
  const [clearingPlatform, setClearingPlatform] = useState<'desktop' | 'mobile'>('desktop');

  // Initialize from session data and detect platform
  useEffect(() => {
    if (sessionData) {
      setCurrentStep(sessionData.currentStep || 0);
      setSelectedState(sessionData.selectedState || '');
      setShowPrivacyNotice(!hasConsent);
    }
    
    // Auto-detect mobile vs desktop
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                    (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
    setClearingPlatform(isMobile ? 'mobile' : 'desktop');
  }, [sessionData, hasConsent]);

  const handlePrivacyConsent = () => {
    if (privacyConsent && sharedComputerAcknowledged) {
      setPrivacyConsent({
        sessionStorageConsent: true,
        sharedComputerWarningAcknowledged: true
      });
      setShowPrivacyNotice(false);
      updateSession({ currentStep: 0 });
    }
  };

  const renderManualClearingInstructions = () => (
    <div className="border border-blue-200 rounded-lg">
      <button
        type="button"
        onClick={() => setShowClearingInstructions(!showClearingInstructions)}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-blue-50 transition-colors"
      >
        <span className="font-medium text-blue-900">
          📱 How to manually clear your session data by browser
        </span>
        {showClearingInstructions ? (
          <ChevronUp className="w-4 h-4 text-blue-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-blue-600" />
        )}
      </button>
      
      {showClearingInstructions && (
        <div className="px-4 pb-4 space-y-4">
          {/* Platform Toggle */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setClearingPlatform('desktop')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  clearingPlatform === 'desktop'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setClearingPlatform('mobile')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  clearingPlatform === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Mobile</span>
              </button>
            </div>
          </div>

          {/* Desktop Instructions */}
          {clearingPlatform === 'desktop' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Monitor className="w-4 h-4 mr-2 text-blue-600" />
                Desktop Browser Instructions
              </h4>
              
              <div className="space-y-3 text-sm">
              {/* Chrome */}
              <div className="bg-gray-50 rounded p-3">
                <h5 className="font-medium text-gray-800 mb-1">Chrome</h5>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Press <kbd className="bg-gray-200 px-1 rounded">Ctrl+Shift+Delete</kbd> (Windows) or <kbd className="bg-gray-200 px-1 rounded">Cmd+Shift+Delete</kbd> (Mac)</li>
                  <li>Select "Session Storage" or "Cookies and other site data"</li>
                  <li>Choose time range: "All time" for complete clearing</li>
                  <li>Click "Clear data"</li>
                </ol>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Alternative:</strong> Three dots menu → Settings → Privacy and security → Clear browsing data
                </p>
              </div>

              {/* Firefox */}
              <div className="bg-gray-50 rounded p-3">
                <h5 className="font-medium text-gray-800 mb-1">Firefox</h5>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Press <kbd className="bg-gray-200 px-1 rounded">Ctrl+Shift+Delete</kbd> (Windows) or <kbd className="bg-gray-200 px-1 rounded">Cmd+Shift+Delete</kbd> (Mac)</li>
                  <li>Check "Cookies" and "Site Data"</li>
                  <li>Select time range: "Everything"</li>
                  <li>Click "Clear Now"</li>
                </ol>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Alternative:</strong> Menu → Settings → Privacy & Security → Clear Data
                </p>
              </div>

              {/* Safari */}
              <div className="bg-gray-50 rounded p-3">
                <h5 className="font-medium text-gray-800 mb-1">Safari</h5>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Menu bar: Safari → Clear History...</li>
                  <li>Select "all history" from dropdown</li>
                  <li>Click "Clear History"</li>
                  <li>Or: Safari → Preferences → Privacy → Manage Website Data → Remove All</li>
                </ol>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Developer option:</strong> Develop menu → Empty Caches (if enabled)
                </p>
              </div>

              {/* Edge */}
              <div className="bg-gray-50 rounded p-3">
                <h5 className="font-medium text-gray-800 mb-1">Microsoft Edge</h5>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Press <kbd className="bg-gray-200 px-1 rounded">Ctrl+Shift+Delete</kbd></li>
                  <li>Select "Cookies and other site data"</li>
                  <li>Choose time range: "All time"</li>
                  <li>Click "Clear now"</li>
                </ol>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Alternative:</strong> Three dots menu → Settings → Privacy, search, and services → Clear browsing data
                </p>
              </div>
              </div>
            </div>
          )}

          {/* Mobile Instructions */}
          {clearingPlatform === 'mobile' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-blue-600" />
                Mobile Browser Instructions
              </h4>
              
              <div className="space-y-3 text-sm">
              {/* Mobile Chrome */}
              <div className="bg-gray-50 rounded p-3">
                <h5 className="font-medium text-gray-800 mb-1">Chrome Mobile (Android/iOS)</h5>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Tap the three dots menu (⋮)</li>
                  <li>Go to Settings → Privacy and security</li>
                  <li>Tap "Clear browsing data"</li>
                  <li>Select "Cookies and site data"</li>
                  <li>Choose "All time" and tap "Clear data"</li>
                </ol>
              </div>

              {/* Mobile Safari */}
              <div className="bg-gray-50 rounded p-3">
                <h5 className="font-medium text-gray-800 mb-1">Safari Mobile (iOS)</h5>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Go to iOS Settings app (not Safari app)</li>
                  <li>Scroll down and tap "Safari"</li>
                  <li>Tap "Clear History and Website Data"</li>
                  <li>Confirm by tapping "Clear History and Data"</li>
                </ol>
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Note:</strong> This clears data for all websites, not just this one
                </p>
              </div>

              {/* Mobile Firefox */}
              <div className="bg-gray-50 rounded p-3">
                <h5 className="font-medium text-gray-800 mb-1">Firefox Mobile</h5>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Tap the three dots menu (⋮)</li>
                  <li>Go to Settings → Data Management</li>
                  <li>Tap "Clear private data"</li>
                  <li>Select "Cookies & active logins" and "Site data"</li>
                  <li>Tap "Clear data"</li>
                </ol>
              </div>
              </div>
            </div>
          )}

          {/* Private/Incognito Mode - Always Shown */}
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <h4 className="font-medium text-amber-800 mb-2">🔒 Recommended: Use Private/Incognito Mode</h4>
            <p className="text-sm text-amber-700 mb-2">
              The safest option is to use private browsing mode, which automatically clears all data when you close the window:
            </p>
            
            {clearingPlatform === 'desktop' ? (
              <ul className="text-sm text-amber-700 space-y-1">
                <li><strong>Chrome:</strong> <kbd className="bg-amber-200 px-1 rounded">Ctrl+Shift+N</kbd> or "New Incognito Window"</li>
                <li><strong>Firefox:</strong> <kbd className="bg-amber-200 px-1 rounded">Ctrl+Shift+P</kbd> or "New Private Window"</li>
                <li><strong>Safari:</strong> <kbd className="bg-amber-200 px-1 rounded">Cmd+Shift+N</kbd> or "New Private Window"</li>
                <li><strong>Edge:</strong> <kbd className="bg-amber-200 px-1 rounded">Ctrl+Shift+N</kbd> or "New InPrivate Window"</li>
              </ul>
            ) : (
              <ul className="text-sm text-amber-700 space-y-1">
                <li><strong>Chrome Mobile:</strong> Tap menu (⋮) → "New Incognito Tab"</li>
                <li><strong>Safari Mobile:</strong> Tap tabs button → "Private" → "+"</li>
                <li><strong>Firefox Mobile:</strong> Tap menu (⋮) → "New Private Tab"</li>
                <li><strong>Edge Mobile:</strong> Tap menu (⋮) → "New InPrivate Tab"</li>
              </ul>
            )}
          </div>

          {/* One-Click Clear Button */}
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <h4 className="font-medium text-red-800 mb-2">🚨 Quick Clear Session</h4>
            <p className="text-sm text-red-700 mb-3">
              Use our one-click button to immediately clear all Document Wizard session data:
            </p>
            <button
              onClick={clearSession}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Clear Session Now
            </button>
            <p className="text-xs text-red-600 mt-2">
              This will delete all your progress and return you to the beginning
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const handleStateSelection = (stateCode: string) => {
    setSelectedState(stateCode);
    updateSession({ 
      selectedState: stateCode,
      currentStep: 1,
      completedSteps: [0]
    });
    setCurrentStep(1);
  };

  const renderPrivacyNotice = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Document Preparation Wizard - Privacy Notice
            </h3>
            
            <div className="space-y-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Session Storage & Privacy Protection</h4>
                <p className="whitespace-pre-line">{PRIVACY_NOTICES.SESSION_STORAGE}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">No Server Storage</h4>
                <p className="whitespace-pre-line">{PRIVACY_NOTICES.NO_SERVER_STORAGE}</p>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <h4 className="font-medium mb-2 text-amber-800">⚠️ Shared Computer Warning</h4>
                <div className="text-amber-700 space-y-2">
                  <p>If you're using a shared or public computer, your session data could be accessible to other users. We recommend:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Using private/incognito browsing mode</li>
                    <li>
                      Manually clearing your session when finished (
                      <button
                        onClick={() => setShowClearingInstructions(!showClearingInstructions)}
                        className="underline text-amber-800 hover:text-amber-900 font-medium"
                      >
                        see browser-specific instructions
                      </button>
                      )
                    </li>
                    <li>Using our one-click "Clear Session" button before leaving</li>
                    <li>Not saving sensitive information if others have access to this device</li>
                  </ul>
                  
                  {showClearingInstructions && (
                    <div className="mt-3 p-3 bg-white border border-amber-300 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-amber-800">Quick Browser Clearing Instructions:</h5>
                        <div className="bg-gray-100 rounded p-0.5 flex">
                          <button
                            onClick={() => setClearingPlatform('desktop')}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              clearingPlatform === 'desktop'
                                ? 'bg-amber-600 text-white'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Desktop
                          </button>
                          <button
                            onClick={() => setClearingPlatform('mobile')}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              clearingPlatform === 'mobile'
                                ? 'bg-amber-600 text-white'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            Mobile
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm space-y-2">
                        {clearingPlatform === 'desktop' ? (
                          <div>
                            <strong className="text-amber-800">Desktop:</strong>
                            <span className="text-gray-700"> Press </span>
                            <kbd className="bg-amber-200 px-1 rounded text-xs">Ctrl+Shift+Delete</kbd>
                            <span className="text-gray-700"> (Windows) or </span>
                            <kbd className="bg-amber-200 px-1 rounded text-xs">Cmd+Shift+Delete</kbd>
                            <span className="text-gray-700"> (Mac), then clear "Cookies and site data"</span>
                          </div>
                        ) : (
                          <div>
                            <strong className="text-amber-800">Mobile:</strong>
                            <span className="text-gray-700"> Go to browser Settings → Privacy → Clear browsing data → Select "Cookies and site data"</span>
                          </div>
                        )}
                        
                        <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                          <strong className="text-blue-800">Easiest option:</strong>
                          <span className="text-blue-700"> Use Private/Incognito browsing mode - it automatically clears everything when you close the window</span>
                        </div>
                        
                        <button
                          onClick={() => setShowClearingInstructions(false)}
                          className="text-xs text-amber-700 hover:text-amber-800 underline"
                        >
                          Hide instructions
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Data Retention</h4>
                <p className="whitespace-pre-line">{PRIVACY_NOTICES.DATA_RETENTION}</p>
              </div>

              {/* Manual Clearing Instructions */}
              <div>
                <h4 className="font-medium mb-3">Manual Session Clearing</h4>
                {renderManualClearingInstructions()}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsentState(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="text-sm">
                  <div className="font-medium text-blue-900">
                    I understand and consent to session storage of my legal document preparation data
                  </div>
                  <div className="text-blue-700 mt-1">
                    • My data stays on my device and never leaves my browser
                    • Information is automatically deleted when I close my browser
                    • I can manually clear my session at any time
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={sharedComputerAcknowledged}
                  onChange={(e) => setSharedComputerAcknowledged(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="text-sm">
                  <div className="font-medium text-blue-900">
                    I acknowledge the shared computer warning
                  </div>
                  <div className="text-blue-700 mt-1">
                    I understand that using this tool on a shared or public computer may expose my legal information to others
                  </div>
                </div>
              </label>

              <button
                onClick={handlePrivacyConsent}
                disabled={!privacyConsent || !sharedComputerAcknowledged}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Accept Privacy Terms & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStateSelector = () => {
    const stateRequirements = selectedState ? STATE_REQUIREMENTS[selectedState] : null;
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your State</h2>
          <p className="text-gray-600">
            Probate requirements vary significantly by state. Select the state where the deceased person resided 
            or where the estate will be administered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* State Selection */}
          <div className="space-y-4">
            <div>
              <label htmlFor="state-select" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                State/Jurisdiction
              </label>
              <select
                id="state-select"
                value={selectedState}
                onChange={(e) => handleStateSelection(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Select a state...</option>
                {US_STATES.map((state) => {
                  const isSupported = !!STATE_REQUIREMENTS[state.code];
                  return (
                    <option key={state.code} value={state.code}>
                      {state.name}{isSupported ? ' ✓' : ' (Coming Soon)'}
                    </option>
                  );
                })}
              </select>
              
              <div className="mt-2 text-sm text-gray-600">
                <p>✓ = Full wizard support available</p>
                <p className="text-purple-600 font-medium">Currently supported: California, Texas, New York, Florida, Oregon</p>
              </div>
            </div>

            {selectedState && !STATE_REQUIREMENTS[selectedState] && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-800">
                      {US_STATES.find(s => s.code === selectedState)?.name} - Coming Soon
                    </h4>
                    <p className="text-sm text-amber-700 mt-1 mb-3">
                      We're still building the requirements database for {US_STATES.find(s => s.code === selectedState)?.name}. 
                      You can continue to see what guidance we'll provide, or try a supported state first.
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStateSelection(selectedState)}
                        className="bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700"
                      >
                        Continue Anyway
                      </button>
                      <button
                        onClick={() => setSelectedState('CA')}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Try California Instead
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* State Requirements Preview */}
          {stateRequirements && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                {stateRequirements.state} Requirements Overview
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Court System:</span>
                  <p className="text-gray-600">{stateRequirements.probateCourtName}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Document Name:</span>
                  <p className="text-gray-600">{stateRequirements.lettersOfAdministrationName}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Filing Fee:</span>
                  <p className="text-gray-600">{stateRequirements.filingFee.amount}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Processing Time:</span>
                  <p className="text-gray-600">{stateRequirements.processingTime.typical}</p>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Required Documents:</span>
                  <p className="text-gray-600">{stateRequirements.requiredDocuments.length} documents required</p>
                </div>
              </div>

              <button
                onClick={() => handleStateSelection(selectedState)}
                className="w-full mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700"
              >
                Continue with {stateRequirements.state}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRequirementsSummary = () => {
    const stateRequirements = STATE_REQUIREMENTS[selectedState];
    
    // Handle unsupported states
    if (!stateRequirements) {
      const stateName = US_STATES.find(s => s.code === selectedState)?.name || selectedState;
      
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {stateName} Requirements - Coming Soon
            </h2>
            <p className="text-gray-600">
              We're still building the requirements database for {stateName}. Here's what you can do in the meantime.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* What We're Building */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                What We're Building for {stateName}
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Court contact information and addresses</li>
                <li>• Required documents and forms</li>
                <li>• Filing fees and processing times</li>
                <li>• State-specific legal requirements</li>
                <li>• Step-by-step document preparation</li>
              </ul>
            </div>

            {/* Immediate Options */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Your Options Right Now
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentStep(0)}
                  className="w-full text-left bg-white border border-green-300 rounded p-3 hover:bg-green-50 transition-colors"
                >
                  <div className="font-medium text-green-900">Try a Supported State</div>
                  <div className="text-sm text-green-700">See how the wizard works with CA, TX, NY, or FL</div>
                </button>
                
                <a
                  href="#upload"
                  onClick={() => window.location.reload()}
                  className="block w-full text-left bg-white border border-green-300 rounded p-3 hover:bg-green-50 transition-colors"
                >
                  <div className="font-medium text-green-900">Use Our Main Service</div>
                  <div className="text-sm text-green-700">Get help with digital account removal requests</div>
                </a>
              </div>
            </div>
          </div>

          {/* General Guidance */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">General Probate Guidance for {stateName}</h3>
            <div className="prose prose-sm text-gray-700">
              <p className="mb-3">
                While we build {stateName}-specific guidance, here are general steps that apply to most states:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li><strong>Contact your local probate court</strong> - Usually the county court where the deceased resided</li>
                <li><strong>Gather required documents</strong> - Death certificate, will (if any), list of assets</li>
                <li><strong>File petition for letters of administration</strong> - Court forms to request authority</li>
                <li><strong>Pay filing fees</strong> - Varies by state and county, typically $200-$500</li>
                <li><strong>Await court approval</strong> - Processing time varies, usually 2-8 weeks</li>
              </ol>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Probate laws vary significantly by state. Always consult with a local probate attorney 
                  or your county clerk's office for {stateName}-specific requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ← Back to State Selection
            </button>
            
            <div className="space-x-3">
              <button
                onClick={clearSession}
                className="px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
              >
                Start Over
              </button>
              <a
                href="#upload"
                onClick={() => window.location.reload()}
                className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Use Main Service Instead
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {stateRequirements.state} Letters of Administration Requirements
          </h2>
          <p className="text-gray-600">
            Complete overview of requirements, documents, and process for obtaining Letters of Administration in {stateRequirements.state}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Process Information */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-purple-600" />
                Process Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Court System</h4>
                  <p className="text-gray-600">{stateRequirements.probateCourtName}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Document Name</h4>
                  <p className="text-gray-600">{stateRequirements.lettersOfAdministrationName}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Filing Fee</h4>
                  <p className="text-gray-600">{stateRequirements.filingFee.amount}</p>
                  {stateRequirements.filingFee.notes && (
                    <p className="text-sm text-gray-500 mt-1">{stateRequirements.filingFee.notes}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Processing Time</h4>
                  <p className="text-gray-600">{stateRequirements.processingTime.typical}</p>
                  {stateRequirements.processingTime.expedited && (
                    <p className="text-sm text-gray-500">Expedited: {stateRequirements.processingTime.expedited}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">{stateRequirements.processingTime.notes}</p>
                </div>
              </div>
            </div>

            {/* Court Contacts */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-purple-600" />
                Court Contacts
              </h3>
              
              <div className="space-y-4">
                {stateRequirements.probateCourts.map((court, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <h4 className="font-medium text-gray-900">{court.name}</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>{court.address}</p>
                      <p>Phone: {court.phone}</p>
                      <p>Hours: {court.hours}</p>
                      {court.website && (
                        <a href={court.website} target="_blank" rel="noopener noreferrer" 
                           className="text-purple-600 hover:text-purple-700 flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          Court Website
                        </a>
                      )}
                      {court.notes && (
                        <p className="text-gray-500 italic">{court.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Required Documents
              </h3>
              
              <div className="space-y-3">
                {stateRequirements.requiredDocuments.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="flex items-start space-x-3">
                      {doc.required ? (
                        <CheckCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {doc.name}
                          {doc.required && <span className="text-red-600 ml-1">*</span>}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        {doc.template && (
                          <p className="text-xs text-purple-600 mt-1">Form: {doc.template}</p>
                        )}
                        {doc.notes && (
                          <p className="text-xs text-gray-500 mt-1">{doc.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Considerations */}
            {stateRequirements.specialConsiderations.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Special Considerations
                </h3>
                <ul className="space-y-2">
                  {stateRequirements.specialConsiderations.map((consideration, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{consideration}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(0)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            ← Back to State Selection
          </button>
          
          <button
            onClick={() => updateSession({ currentStep: 2 }) && setCurrentStep(2)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Continue to Document Preparation →
          </button>
        </div>
      </div>
    );
  };

  // Session Summary and Controls
  const renderSessionSummary = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-2">Session Status</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Active Session: {sessionSummary.hasActiveSession ? 'Yes' : 'No'}</p>
              <p>Steps Completed: {sessionSummary.stepsCompleted}</p>
              <p>Data Size: {sessionSummary.dataSize}</p>
              {sessionSummary.lastUpdated && (
                <p>Last Updated: {new Date(sessionSummary.lastUpdated).toLocaleString()}</p>
              )}
            </div>
          </div>
          <div className="ml-4 space-y-2">
            <button
              onClick={clearSession}
              className="block w-full text-xs bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Clear Session
            </button>
            <button
              onClick={() => setShowClearingInstructions(!showClearingInstructions)}
              className="block w-full text-xs bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Manual Clear Help
            </button>
          </div>
        </div>
        
        {showClearingInstructions && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            {renderManualClearingInstructions()}
          </div>
        )}
      </div>
    </div>
  );

  // Main render logic
  if (showPrivacyNotice || !hasConsent) {
    return renderPrivacyNotice();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 0 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium text-gray-900">Select State</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium text-gray-900">Review Requirements</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium text-gray-900">Prepare Documents</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 0 && renderStateSelector()}
      {currentStep === 1 && renderRequirementsSummary()}
      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Document Preparation</h2>
            <p className="text-gray-600">This step will be implemented next - document template generation and form filling.</p>
          </div>
        </div>
      )}

      {/* Privacy-Conscious Session Controls */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Privacy Controls:</span>
            <button
              onClick={clearSession}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
              title="Clear all session data immediately"
            >
              Clear Session
            </button>
            <button
              onClick={() => setShowClearingInstructions(!showClearingInstructions)}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
              title="Show manual browser clearing instructions"
            >
              How to Clear
            </button>
          </div>
          
          {showClearingInstructions && (
            <div className="absolute bottom-full right-0 mb-2 w-96 max-h-96 overflow-y-auto">
              <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Quick Clear Instructions</h4>
                  <button
                    onClick={() => setShowClearingInstructions(false)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Close instructions"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <strong className="text-blue-800">Fastest:</strong>
                    <span className="text-blue-700"> Use Private/Incognito mode - auto-clears when you close the window</span>
                  </div>
                  
                  <div>
                    <strong className="text-gray-800">Desktop:</strong>
                    <div className="text-gray-600">
                      Press <kbd className="bg-gray-200 px-1 rounded text-xs">Ctrl+Shift+Delete</kbd> (Win) or <kbd className="bg-gray-200 px-1 rounded text-xs">Cmd+Shift+Delete</kbd> (Mac)
                      <br />Then clear "Cookies and site data"
                    </div>
                  </div>
                  
                  <div>
                    <strong className="text-gray-800">Mobile:</strong>
                    <div className="text-gray-600">
                      Settings → Privacy → Clear browsing data → "Cookies and site data"
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowClearingInstructions(!showClearingInstructions)}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    View detailed instructions
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debug Session Summary */}
      {process.env.NODE_ENV === 'development' && renderSessionSummary()}
    </div>
  );
};

export default DocumentPreparationWizard;