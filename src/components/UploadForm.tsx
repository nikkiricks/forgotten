import React, { useState } from 'react';
import { Upload, Check, AlertCircle, FileText, Shield } from 'lucide-react';

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [legalAuthFile, setLegalAuthFile] = useState<File | null>(null);
  const [hasLegalAuth, setHasLegalAuth] = useState<string>('');
  const [contactEmail, setContactEmail] = useState('');
  const [deceasedName, setDeceasedName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin']);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [instagramRequestType, setInstagramRequestType] = useState('removal'); // For Instagram: removal or memorialization
  const [facebookUrl, setFacebookUrl] = useState('');
  const [facebookRequestType, setFacebookRequestType] = useState('removal'); // For Facebook: removal or memorialization
  const [relationship, setRelationship] = useState('');
  const [deathCertAttached, setDeathCertAttached] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');
  
  // Optional fields
  const [deceasedEmail, setDeceasedEmail] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setDeathCertAttached(false); // Reset checkbox when new file is selected
    }
  };

  const handleLegalAuthFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setLegalAuthFile(selectedFile);
    }
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    } else {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setDeathCertAttached(false); // Reset checkbox when new file is dropped
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      submitDocument();
    }
  };

  const isFormValid = () => {
    const baseValid = (
      file &&
      contactEmail.trim() &&
      deceasedName.trim() &&
      firstName.trim() &&
      lastName.trim() &&
      relationship &&
      deathCertAttached &&
      digitalSignature.trim() &&
      isValidFileType(file) &&
      hasLegalAuth.trim() &&
      selectedPlatforms.length > 0
    );

    // Check platform-specific requirements
    let platformSpecificValid = true;
    
    if (selectedPlatforms.includes('linkedin') && !linkedinUrl.trim()) {
      platformSpecificValid = false;
    }
    
    if (selectedPlatforms.includes('instagram') && !instagramUrl.trim()) {
      platformSpecificValid = false;
    }
    
    if (selectedPlatforms.includes('facebook') && !facebookUrl.trim()) {
      platformSpecificValid = false;
    }

    // Check if legal authorization file is required
    const needsLegalAuth = (
      (selectedPlatforms.includes('linkedin') && hasLegalAuth === 'yes') ||
      (selectedPlatforms.includes('instagram') && instagramRequestType === 'removal' && hasLegalAuth === 'yes') ||
      (selectedPlatforms.includes('facebook') && facebookRequestType === 'removal' && hasLegalAuth === 'yes')
    );

    if (needsLegalAuth) {
      return baseValid && platformSpecificValid && legalAuthFile && isValidFileType(legalAuthFile);
    }

    return baseValid && platformSpecificValid;
  };

  const submitDocument = async () => {
    if (!file) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('certificate', file);
      if (legalAuthFile) {
        formData.append('legalAuth', legalAuthFile);
      }
      formData.append('selectedPlatforms', JSON.stringify(selectedPlatforms));
      formData.append('instagramRequestType', instagramRequestType);
      formData.append('facebookRequestType', facebookRequestType);
      formData.append('hasLegalAuth', hasLegalAuth);
      formData.append('contactEmail', contactEmail);
      formData.append('deceasedName', deceasedName);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('linkedinUrl', linkedinUrl);
      formData.append('instagramUrl', instagramUrl);
      formData.append('facebookUrl', facebookUrl);
      formData.append('relationship', relationship);
      formData.append('digitalSignature', digitalSignature);
      formData.append('deceasedEmail', deceasedEmail);
      formData.append('dateOfDeath', dateOfDeath);

      const response = await fetch('http://localhost:8000/api/upload-certificate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to submit document';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse success response:', jsonError);
        throw new Error('Server returned invalid response format');
      }
      setSubmissionResult(result);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidFileType = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    return allowedTypes.includes(file.type);
  };

  const resetForm = () => {
    setSubmitted(false);
    setSubmissionResult(null);
    setFile(null);
    setLegalAuthFile(null);
    setHasLegalAuth('');
    setSelectedPlatforms(['linkedin']);
    setInstagramRequestType('removal');
    setFacebookRequestType('removal');
    setContactEmail('');
    setDeceasedName('');
    setFirstName('');
    setLastName('');
    setLinkedinUrl('');
    setInstagramUrl('');
    setFacebookUrl('');
    setRelationship('');
    setDeathCertAttached(false);
    setDigitalSignature('');
    setDeceasedEmail('');
    setDateOfDeath('');
    setError(null);
  };

  if (submitted) {
    return (
      <section id="upload" className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {submissionResult?.totalPlatforms > 1 ? 'Multi-Platform Requests Submitted Successfully' : 'Request Submitted Successfully'}
          </h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Confirmation Details</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Request ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{submissionResult?.requestId}</code></p>
              <p><strong>Processing Time:</strong> {submissionResult?.estimatedProcessingTime}</p>
              <p><strong>Platforms:</strong> {submissionResult?.totalPlatforms} platform{submissionResult?.totalPlatforms > 1 ? 's' : ''}</p>
              <p><strong>Contact Email:</strong> {contactEmail}</p>
            </div>
          </div>

          {/* Platform-specific confirmations */}
          {submissionResult?.platforms && (
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-gray-900">Platform-Specific Confirmations:</h3>
              {Object.entries(submissionResult.platforms).map(([platform, result]: [string, any]) => (
                <div key={platform} className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${result.success ? 'bg-green-600' : 'bg-yellow-600'}`}></span>
                    <h4 className="font-medium capitalize">{platform}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {result.success ? 'Submitted' : 'Manual Processing'}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Confirmation ID:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{result.confirmationId}</code></p>
                    <p><strong>Status:</strong> {result.message}</p>
                    <p><strong>Method:</strong> {result.method}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">What Happens Next:</h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Your request{submissionResult?.totalPlatforms > 1 ? 's have' : ' has'} been submitted to {submissionResult?.totalPlatforms > 1 ? 'all selected platforms' : 'the platform'}</li>
              <li>Each platform will review the death certificate and information</li>
              <li>You'll receive email updates on the progress for each platform</li>
              <li>Profiles will be removed or memorialized once approved by each platform</li>
              {submissionResult?.totalPlatforms > 1 && (
                <li>Different platforms may process at different speeds - this is normal</li>
              )}
            </ol>
          </div>
          
          <p className="text-gray-600 leading-relaxed mb-4">
            We've sent a confirmation email to <strong>{contactEmail}</strong> with your 
            confirmation ID and next steps. Please save this confirmation ID for your records.
            </p>
            <div className="mt-6">
              <button
                onClick={resetForm}
                className="text-purple-400 hover:text-purple-500 font-medium"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="upload" className="py-16 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Digital Legacy Management
          </h2>
          <p className="text-gray-600">
            We'll help you remove or memorialize accounts across multiple platforms with a single request
          </p>
          
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Required Information
            </h3>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Which platforms would you like us to help with? *
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Select all platforms where the deceased person had accounts. We'll handle all of them in one request.
              </p>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="platform-linkedin"
                    checked={selectedPlatforms.includes('linkedin')}
                    onChange={(e) => handlePlatformChange('linkedin', e.target.checked)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="platform-linkedin" className="text-sm text-gray-700">
                    <strong>LinkedIn</strong> - Professional network account removal
                  </label>
                </div>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="platform-instagram"
                    checked={selectedPlatforms.includes('instagram')}
                    onChange={(e) => handlePlatformChange('instagram', e.target.checked)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="platform-instagram" className="text-sm text-gray-700">
                    <strong>Instagram</strong> - Social media account removal or memorialization
                  </label>
                </div>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="platform-facebook"
                    checked={selectedPlatforms.includes('facebook')}
                    onChange={(e) => handlePlatformChange('facebook', e.target.checked)}
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="platform-facebook" className="text-sm text-gray-700">
                    <strong>Facebook</strong> - Social media account removal or memorialization
                  </label>
                </div>
              </div>
              {selectedPlatforms.length === 0 && (
                <p className="text-sm text-red-600 mt-2">Please select at least one platform.</p>
              )}
            </div>

            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-2">
                Your First Name *
              </label>
              <input
                type="text"
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="First Name"
              />
            </div>

            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Last Name *
              </label>
              <input
                type="text"
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Last Name"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
                Your Email Address *
              </label>
              <input
                type="email"
                id="contact-email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="deceased-name" className="block text-sm font-medium text-gray-700 mb-2">
                Name of Deceased Person *
              </label>
              <input
                type="text"
                id="deceased-name"
                value={deceasedName}
                onChange={(e) => setDeceasedName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Full name as it appears on their profiles"
              />
            </div>

            {/* Platform-Specific Sections */}
            {selectedPlatforms.length > 0 && (
              <div className="space-y-6">
                <h4 className="text-md font-semibold text-gray-900 border-b border-gray-100 pb-2">
                  Profile Information for Selected Platforms
                </h4>
                
                {/* LinkedIn Section */}
                {selectedPlatforms.includes('linkedin') && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      LinkedIn Account Information
                    </h5>
                    <div>
                      <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Profile URL *
                      </label>
                      <input
                        type="url"
                        id="linkedin-url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        required={selectedPlatforms.includes('linkedin')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="https://www.linkedin.com/in/profile-name"
                      />
                    </div>
                  </div>
                )}

                {/* Instagram Section */}
                {selectedPlatforms.includes('instagram') && (
                  <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
                    <h5 className="font-medium text-pink-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-pink-600 rounded-full mr-2"></span>
                      Instagram Account Information
                    </h5>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="instagram-url" className="block text-sm font-medium text-gray-700 mb-2">
                          Instagram Profile URL *
                        </label>
                        <input
                          type="url"
                          id="instagram-url"
                          value={instagramUrl}
                          onChange={(e) => setInstagramUrl(e.target.value)}
                          required={selectedPlatforms.includes('instagram')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                          placeholder="https://www.instagram.com/username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Instagram Request Type *
                        </label>
                        <p className="text-sm text-gray-600 mb-4">
                          <strong>Removal:</strong> Permanently deletes the account (requires family verification)<br/>
                          <strong>Memorialization:</strong> Converts to memorial account (anyone can request with proof of death)
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              id="instagram-removal"
                              name="instagramRequestType"
                              value="removal"
                              checked={instagramRequestType === 'removal'}
                              onChange={(e) => setInstagramRequestType(e.target.value)}
                              required
                              className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                            />
                            <label htmlFor="instagram-removal" className="text-sm text-gray-700">
                              <strong>Permanent Removal</strong> - Delete the account completely (immediate family only)
                            </label>
                          </div>
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              id="instagram-memorialization"
                              name="instagramRequestType"
                              value="memorialization"
                              checked={instagramRequestType === 'memorialization'}
                              onChange={(e) => setInstagramRequestType(e.target.value)}
                              required
                              className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                            />
                            <label htmlFor="instagram-memorialization" className="text-sm text-gray-700">
                              <strong>Memorialization</strong> - Convert to memorial account (anyone can request)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Facebook Section */}
                {selectedPlatforms.includes('facebook') && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                      Facebook Account Information
                    </h5>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="facebook-url" className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook Profile URL *
                        </label>
                        <input
                          type="url"
                          id="facebook-url"
                          value={facebookUrl}
                          onChange={(e) => setFacebookUrl(e.target.value)}
                          required={selectedPlatforms.includes('facebook')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="https://www.facebook.com/username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Facebook Request Type *
                        </label>
                        <p className="text-sm text-gray-600 mb-4">
                          <strong>Removal:</strong> Permanently deletes the account (requires family verification)<br/>
                          <strong>Memorialization:</strong> Converts to memorial account (anyone can request with proof of death)
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              id="facebook-removal"
                              name="facebookRequestType"
                              value="removal"
                              checked={facebookRequestType === 'removal'}
                              onChange={(e) => setFacebookRequestType(e.target.value)}
                              required
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="facebook-removal" className="text-sm text-gray-700">
                              <strong>Permanent Removal</strong> - Delete the account completely (immediate family only)
                            </label>
                          </div>
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              id="facebook-memorialization"
                              name="facebookRequestType"
                              value="memorialization"
                              checked={facebookRequestType === 'memorialization'}
                              onChange={(e) => setFacebookRequestType(e.target.value)}
                              required
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="facebook-memorialization" className="text-sm text-gray-700">
                              <strong>Memorialization</strong> - Convert to memorial account (anyone can request)
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="relationship" className="block text-sm font-medium text-gray-700 mb-2">
                Your Relationship to the Deceased Person *
              </label>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="immediate-family"
                    name="relationship"
                    value="immediate-family"
                    checked={relationship === 'immediate-family'}
                    onChange={(e) => setRelationship(e.target.value)}
                    required
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <label htmlFor="immediate-family" className="text-sm text-gray-700">
                    Immediate family (spouse, parent, sibling, child)
                  </label>
                </div>
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="authorized-entity"
                    name="relationship"
                    value="authorized-entity"
                    checked={relationship === 'authorized-entity'}
                    onChange={(e) => setRelationship(e.target.value)}
                    required
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <label htmlFor="authorized-entity" className="text-sm text-gray-700">
                    Authorized Entity (has legal authority to act on behalf of the deceased person)
                  </label>
                </div>
              </div>
            </div>

            {/* Legal Authorization Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Do you have legal authorization documents? *
              </label>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-amber-900 mb-2">Legal Authorization Requirements by Platform:</h4>
                <div className="space-y-2 text-sm text-amber-800">
                  {selectedPlatforms.includes('linkedin') && (
                    <div>
                      <strong>LinkedIn:</strong> Requires death certificate + legal authorization (Letters of Administration, Letters Testamentary, or court order)
                    </div>
                  )}
                  {selectedPlatforms.includes('instagram') && (
                    <div>
                      <strong>Instagram:</strong> 
                      {instagramRequestType === 'removal' 
                        ? " Removal requires family proof OR legal authorization"
                        : " Memorialization only needs proof of death (legal auth optional but helpful)"
                      }
                    </div>
                  )}
                  {selectedPlatforms.includes('facebook') && (
                    <div>
                      <strong>Facebook:</strong> 
                      {facebookRequestType === 'removal' 
                        ? " Removal requires family proof OR legal authorization"
                        : " Memorialization only needs proof of death (legal auth optional but helpful)"
                      }
                    </div>
                  )}
                </div>
                <p className="text-sm text-amber-700 mt-2">
                  <strong>Don't have legal documents?</strong> No problem - we'll generate an affidavit for you based on your family relationship.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="has-legal-auth-yes"
                    name="hasLegalAuth"
                    value="yes"
                    checked={hasLegalAuth === 'yes'}
                    onChange={(e) => setHasLegalAuth(e.target.value)}
                    required
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <label htmlFor="has-legal-auth-yes" className="text-sm text-gray-700">
                    Yes, I have Letters of Administration, Letters Testamentary, or court order documents
                  </label>
                </div>
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="has-legal-auth-no"
                    name="hasLegalAuth"
                    value="no"
                    checked={hasLegalAuth === 'no'}
                    onChange={(e) => setHasLegalAuth(e.target.value)}
                    required
                    className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <label htmlFor="has-legal-auth-no" className="text-sm text-gray-700">
                    No, I only have the death certificate
                  </label>
                </div>
              </div>
            </div>

            {/* Conditional Legal Auth File Upload */}
            {hasLegalAuth === 'yes' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Legal Authorization Document *
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Upload your Letters of Administration, Letters Testamentary, or court order document.
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleLegalAuthFileChange}
                    className="hidden"
                    id="legal-auth-upload"
                    required={hasLegalAuth === 'yes'}
                  />
                  <label htmlFor="legal-auth-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Click to upload legal authorization document
                      </p>
                      <p className="text-xs text-gray-600">
                        PDF, PNG, or JPG files only (max 10MB)
                      </p>
                    </div>
                  </label>
                </div>

                {legalAuthFile && (
                  <div className="mt-3 flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{legalAuthFile.name}</p>
                      <p className="text-xs text-gray-600">
                        {(legalAuthFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {!isValidFileType(legalAuthFile) && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Info for those without legal auth */}
            {hasLegalAuth === 'no' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">We'll Help You Navigate This</h4>
                    <p className="text-sm text-blue-800">
                      Don't worry - many families don't have formal legal authorization documents. We'll submit your request with the death certificate and work with LinkedIn to process it through their verification procedures for immediate family members.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Death Certificate *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="w-10 h-10 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-600">
                      PDF, PNG, or JPG files only (max 10MB)
                    </p>
                  </div>
                </label>
              </div>

              {file && (
                <div className="mt-4 flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {!isValidFileType(file) && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              )}
            </div>

            {/* Death Certificate Confirmation */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="death-cert-attached"
                checked={deathCertAttached}
                onChange={(e) => setDeathCertAttached(e.target.checked)}
                required
                className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="death-cert-attached" className="text-sm text-gray-700">
                I have attached the death certificate *
              </label>
            </div>

            {/* Digital Signature */}
            <div>
              <label htmlFor="digital-signature" className="block text-sm font-medium text-gray-700 mb-2">
                Digital Signature (Type your full name) *
              </label>
              <input
                type="text"
                id="digital-signature"
                value={digitalSignature}
                onChange={(e) => setDigitalSignature(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Type your full legal name"
              />
              <p className="text-xs text-gray-500 mt-1">
                By typing your name, you are providing a digital signature for this request
              </p>
            </div>
          </div>

          {/* Optional Fields Section */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Optional Information
            </h3>

            <div>
              <label htmlFor="deceased-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email of Deceased Person <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="email"
                id="deceased-email"
                value={deceasedEmail}
                onChange={(e) => setDeceasedEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="deceased@example.com"
              />
            </div>

            <div>
              <label htmlFor="date-of-death" className="block text-sm font-medium text-gray-700 mb-2">
                Date They Passed Away <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="date"
                id="date-of-death"
                value={dateOfDeath}
                onChange={(e) => setDateOfDeath(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className="w-full bg-purple-400 text-white py-3 rounded-lg font-medium hover:bg-purple-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Document</span>
            )}
          </button>
        </form>

        {/* Legal Authorization Guidance */}
        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-900 mb-2">Don't Have Legal Authorization Documents?</h3>
              <p className="text-sm text-amber-800 mb-3">
                If you're immediate family but don't have legal authorization documents (like power of attorney or estate executor papers), don't worry. Many families are in this situation.
              </p>
              <p className="text-sm text-amber-800">
                Submit your request with the death certificate and select "Immediate family." We'll guide you through LinkedIn's process, which may include additional verification steps that don't require formal legal documents.
              </p>
            </div>
          </div>
        </div>
        {/* Privacy Disclaimer */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Privacy Guarantee</h3>
              <p className="text-sm text-blue-800">
                We do not store your documents. This form sends them securely to our team 
                and then deletes them. Your sensitive information is handled with the utmost 
                care and never persisted on our servers.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-900 mb-1">Automated Processing</h3>
              <p className="text-sm text-green-800">
                Your request has been automatically processed and submitted to LinkedIn. 
                This typically results in faster processing times compared to manual submissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadForm;