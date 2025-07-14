import React, { useState } from 'react';
import { Shield, Eye, Clock, Trash2, Globe, AlertTriangle, CheckCircle } from 'lucide-react';

interface PrivacyNoticeProps {
  onConsentChange: (consent: boolean, legalBasis: string) => void;
  consentRequired?: boolean;
}

const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ onConsentChange, consentRequired = true }) => {
  const [expanded, setExpanded] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [legalBasis, setLegalBasis] = useState<string>('');

  const handleConsentChange = (consent: boolean) => {
    setHasConsented(consent);
    onConsentChange(consent, legalBasis);
  };

  const handleLegalBasisChange = (basis: string) => {
    setLegalBasis(basis);
    onConsentChange(hasConsented, basis);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 mb-2">Privacy & Data Protection Notice</h4>
          
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>We respect your privacy.</strong> This account discovery tool processes personal data 
              under strict privacy protections and only for legitimate digital legacy management purposes.
            </p>
            
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-blue-700 hover:text-blue-800 font-medium underline"
            >
              {expanded ? 'Hide' : 'Show'} detailed privacy information
            </button>
          </div>

          {expanded && (
            <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
              <div className="space-y-4 text-sm">
                
                {/* What We Collect */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-blue-600" />
                    What Information We Process
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
                    <li>Full name of the deceased person (required)</li>
                    <li>Optional: Email address, username, location, date of birth</li>
                    <li>Your relationship to the deceased person</li>
                    <li>Publicly available social media profile information</li>
                  </ul>
                </div>

                {/* How We Use It */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-blue-600" />
                    How We Use This Information
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
                    <li>Search publicly available social media profiles</li>
                    <li>Match potential accounts to the deceased person</li>
                    <li>Provide confidence scores for found matches</li>
                    <li>Generate reports for digital legacy management</li>
                  </ul>
                </div>

                {/* Data Sources */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-blue-600" />
                    Data Sources & Methods
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
                    <li>Public social media directories (LinkedIn, Facebook public search)</li>
                    <li>Publicly accessible profile pages</li>
                    <li>Username variation testing on public platforms</li>
                    <li>No private account access or login-protected information</li>
                  </ul>
                </div>

                {/* Retention */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    Data Retention & Deletion
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
                    <li><strong>Automatic deletion after 7 days</strong> - All search results are automatically purged</li>
                    <li>No permanent storage of personal information</li>
                    <li>You can request immediate deletion at any time</li>
                    <li>Search logs deleted after 30 days for security purposes only</li>
                  </ul>
                </div>

                {/* Your Rights */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Trash2 className="w-4 h-4 mr-2 text-blue-600" />
                    Your Privacy Rights
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
                    <li><strong>Right to deletion:</strong> Request immediate removal of your search results</li>
                    <li><strong>Right to know:</strong> Request information about data we've processed</li>
                    <li><strong>Right to access:</strong> Obtain copies of search results</li>
                    <li><strong>Right to rectification:</strong> Correct inaccurate information</li>
                    <li><strong>Right to object:</strong> Stop processing for legitimate interests</li>
                  </ul>
                </div>

                {/* Legal Basis */}
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-blue-600" />
                    Legal Basis for Processing
                  </h5>
                  <p className="text-gray-700 mb-2">
                    We process personal data based on the following legal grounds:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
                    <li><strong>Legitimate Interest (GDPR Art. 6(1)(f)):</strong> Digital legacy management for families</li>
                    <li><strong>Legal Obligation (GDPR Art. 6(1)(c)):</strong> Estate administration requirements</li>
                    <li><strong>Public Information Exception:</strong> Processing publicly available data</li>
                  </ul>
                </div>

                {/* Contact */}
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-gray-700">
                    <strong>Questions or requests?</strong> Contact us about your privacy rights at{' '}
                    <a href="mailto:privacy@forgotten-legacy.com" className="text-blue-600 hover:text-blue-700">
                      privacy@forgotten-legacy.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Consent Section */}
          {consentRequired && (
            <div className="mt-4 p-4 bg-white border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-3">Required Consent & Legal Basis</h5>
              
              {/* Legal Basis Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select the legal basis for this account discovery:
                </label>
                <div className="space-y-2">
                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="legalBasis"
                      value="legitimate_interest_family"
                      checked={legalBasis === 'legitimate_interest_family'}
                      onChange={(e) => handleLegalBasisChange(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Immediate Family Member</div>
                      <div className="text-xs text-gray-600">
                        I am an immediate family member (spouse, parent, child, sibling) with legitimate interest 
                        in managing the deceased's digital legacy
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="legalBasis"
                      value="legal_obligation_executor"
                      checked={legalBasis === 'legal_obligation_executor'}
                      onChange={(e) => handleLegalBasisChange(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Legal Representative/Executor</div>
                      <div className="text-xs text-gray-600">
                        I am legally authorized to act on behalf of the deceased's estate or have 
                        a legal obligation to manage their digital assets
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Privacy Consent Checkbox */}
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => handleConsentChange(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="text-sm">
                  <div className="text-gray-900">
                    <strong>I acknowledge and consent to the processing described above:</strong>
                  </div>
                  <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                    <li>• I understand this tool searches publicly available information only</li>
                    <li>• I have a legitimate basis for requesting this account discovery</li>
                    <li>• I consent to the processing of personal data as described</li>
                    <li>• I understand data will be automatically deleted after 7 days</li>
                    <li>• I can request immediate deletion of results at any time</li>
                  </ul>
                </div>
              </label>

              {hasConsented && legalBasis && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    Privacy consent provided. You may proceed with account discovery.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;