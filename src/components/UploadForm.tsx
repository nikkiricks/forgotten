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
  const [linkedinUrl, setLinkedinUrl] = useState('');
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
      linkedinUrl.trim() &&
      relationship &&
      deathCertAttached &&
      digitalSignature.trim() &&
      isValidFileType(file) &&
      hasLegalAuth.trim()
    );

    // If they have legal auth, they must upload the file
    if (hasLegalAuth === 'yes') {
      return baseValid && legalAuthFile && isValidFileType(legalAuthFile);
    }

    // If they don't have legal auth, base validation is enough (dummy will be created)
    return baseValid;
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
      formData.append('hasLegalAuth', hasLegalAuth);
      formData.append('contactEmail', contactEmail);
      formData.append('deceasedName', deceasedName);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('linkedinUrl', linkedinUrl);
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
    setContactEmail('');
    setDeceasedName('');
    setFirstName('');
    setLastName('');
    setLinkedinUrl('');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted Successfully</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Confirmation Details</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Confirmation ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{submissionResult?.confirmationId}</code></p>
              <p><strong>Processing Time:</strong> {submissionResult?.estimatedProcessingTime}</p>
              <p><strong>Contact Email:</strong> {contactEmail}</p>
            </div>
          </div>
          
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">What Happens Next:</h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Your request has been automatically submitted to LinkedIn</li>
              <li>LinkedIn will review the death certificate and information</li>
              <li>You'll receive email updates on the progress</li>
              <li>The profile will be removed or memorialized once approved</li>
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
            Submit Death Certificate
          </h2>
          <p className="text-gray-600">
            We'll help you navigate the LinkedIn account removal process
          </p>
          
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Required Information
            </h3>

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
                placeholder="Full name as it appears on LinkedIn"
              />
            </div>

            <div>
              <label htmlFor="linkedin-url" className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile URL *
              </label>
              <input
                type="url"
                id="linkedin-url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="https://www.linkedin.com/in/profile-name"
              />
            </div>

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
              <p className="text-sm text-gray-600 mb-4">
                LinkedIn requires either a death certificate AND one of the following legal documents: Letters of Administration, Letters Testamentary, or a court order appointing you as an authorized representative for the deceased member's estate.
              </p>
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