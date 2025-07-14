import React, { useState } from 'react';
import { Search, User, Mail, MapPin, Calendar, ExternalLink, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import PrivacyNotice from './PrivacyNotice';

interface DiscoveryResult {
  searchCriteria: {
    fullName: string;
    email?: string;
    username?: string;
    location?: string;
  };
  platforms: {
    [platform: string]: {
      found: boolean;
      profiles?: Array<{
        name?: string;
        displayName?: string;
        username?: string;
        url: string;
        platform: string;
        confidence: string;
        bio?: string;
        followers?: string;
        title?: string;
        location?: string;
      }>;
      confidence: string;
      searchMethod?: string;
      error?: string;
    };
  };
  summary: {
    totalFound: number;
    totalSearched: number;
    confidence: string;
  };
  timestamp: string;
}

interface AccountDiscoveryProps {
  onAccountsFound?: (accounts: any[]) => void;
}

const AccountDiscovery: React.FC<AccountDiscoveryProps> = ({ onAccountsFound }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<DiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasPrivacyConsent, setHasPrivacyConsent] = useState(false);
  const [legalBasis, setLegalBasis] = useState<string>('');
  const [searchId, setSearchId] = useState<string | null>(null);

  const handlePrivacyConsent = (consent: boolean, basis: string) => {
    setHasPrivacyConsent(consent);
    setLegalBasis(basis);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      setError('Please enter the deceased person\'s full name');
      return;
    }

    if (!hasPrivacyConsent || !legalBasis) {
      setError('Please provide privacy consent and legal basis before proceeding');
      return;
    }

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const searchData = {
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        username: username.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        location: location.trim() || undefined,
        legalBasis: legalBasis
      };

      const response = await fetch('http://127.0.0.1:3001/api/discover-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData),
        signal: AbortSignal.timeout(120000), // 2 minute timeout for account discovery
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Account discovery failed');
      }

      const discoveryResults = await response.json();
      setResults(discoveryResults);
      
      // Store the search ID for potential deletion requests
      if (discoveryResults.searchId) {
        setSearchId(discoveryResults.searchId);
      }

      // Extract found accounts for parent component
      if (onAccountsFound) {
        const foundAccounts = Object.entries(discoveryResults.platforms)
          .filter(([_, platformData]: [string, any]) => platformData.found && platformData.profiles)
          .flatMap(([platform, platformData]: [string, any]) => 
            platformData.profiles.map((profile: any) => ({
              platform,
              url: profile.url,
              name: profile.name || profile.displayName,
              confidence: profile.confidence
            }))
          );
        onAccountsFound(foundAccounts);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during account discovery');
    } finally {
      setIsSearching(false);
    }
  };

  const resetSearch = () => {
    setFullName('');
    setEmail('');
    setUsername('');
    setDateOfBirth('');
    setLocation('');
    setResults(null);
    setError(null);
    setSearchId(null);
    setHasPrivacyConsent(false);
    setLegalBasis('');
  };

  const handleDeleteResults = async () => {
    if (!searchId) return;

    try {
      const response = await fetch(`http://127.0.0.1:3001/api/discover-accounts/${searchId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setResults(null);
        setSearchId(null);
        alert('Your search results have been permanently deleted from our servers.');
      } else {
        throw new Error('Failed to delete results');
      }
    } catch (error) {
      console.error('Error deleting results:', error);
      alert('Failed to delete results. Please contact support.');
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPlatformName = (platform: string) => {
    const names = {
      linkedin: 'LinkedIn',
      instagram: 'Instagram',
      facebook: 'Facebook',
      youtube: 'YouTube',
      twitter: 'X (Twitter)'
    };
    return names[platform as keyof typeof names] || platform;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
          <Search className="w-5 h-5 mr-2 text-purple-600" />
          Account Discovery Tool
        </h3>
        <p className="text-gray-600 text-sm">
          Help us find the deceased person's social media accounts by providing their information.
          We'll search across major platforms to identify potential accounts.
        </p>
      </div>

      {/* Privacy Notice */}
      <PrivacyNotice 
        onConsentChange={handlePrivacyConsent}
        consentRequired={true}
      />

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Required Field */}
        <div>
          <label htmlFor="discovery-full-name" className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Full Name *
          </label>
          <input
            type="text"
            id="discovery-full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Enter the deceased person's full name"
          />
        </div>

        {/* Advanced Options Toggle */}
        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {showAdvanced ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced Search Options
          </button>
        </div>

        {/* Advanced Fields */}
        {showAdvanced && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Optional: Providing additional information increases search accuracy
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="discovery-email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="discovery-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="their.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="discovery-username" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Known Username
                </label>
                <input
                  type="text"
                  id="discovery-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="username or handle"
                />
              </div>

              <div>
                <label htmlFor="discovery-dob" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="discovery-dob"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label htmlFor="discovery-location" className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  id="discovery-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="City, State or Country"
                />
              </div>
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="submit"
            disabled={isSearching || !fullName.trim() || !hasPrivacyConsent || !legalBasis}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Accounts
              </>
            )}
          </button>

          {(results || error) && (
            <button
              type="button"
              onClick={resetSearch}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Start New Search
            </button>
          )}
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="mt-6 space-y-6">
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Discovery Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Searched:</span>
                <p className="text-blue-900">{results.summary.totalSearched} platforms</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Found:</span>
                <p className="text-blue-900">{results.summary.totalFound} platforms</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Overall Confidence:</span>
                <div className="flex items-center mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getConfidenceColor(results.summary.confidence)}`}>
                    {getConfidenceIcon(results.summary.confidence)}
                    <span className="ml-1 capitalize">{results.summary.confidence}</span>
                  </span>
                </div>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Search Time:</span>
                <p className="text-blue-900">{new Date(results.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Platform Results */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Platform Results</h4>
            
            {Object.entries(results.platforms).map(([platform, data]) => (
              <div key={platform} className={`border rounded-lg p-4 ${data.found ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900 flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${data.found ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {getPlatformName(platform)}
                  </h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getConfidenceColor(data.confidence)}`}>
                    {getConfidenceIcon(data.confidence)}
                    <span className="ml-1 capitalize">{data.confidence}</span>
                  </span>
                </div>

                {data.found && data.profiles ? (
                  <div className="space-y-3">
                    {data.profiles.map((profile, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-900">
                              {profile.name || profile.displayName || profile.username}
                            </h6>
                            {profile.title && (
                              <p className="text-sm text-gray-600">{profile.title}</p>
                            )}
                            {profile.bio && (
                              <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
                            )}
                            {(profile.followers || profile.location) && (
                              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                {profile.followers && <span>Followers: {profile.followers}</span>}
                                {profile.location && <span>Location: {profile.location}</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(profile.confidence)}`}>
                              {profile.confidence}
                            </span>
                            <a
                              href={profile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    {data.error ? (
                      <span className="text-red-600">Error: {data.error}</span>
                    ) : (
                      `No accounts found (searched via ${data.searchMethod || 'unknown method'})`
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Data Retention & Deletion Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  <strong>Data Retention Notice:</strong> These results will be automatically deleted after 7 days for your privacy. 
                  All searches use publicly available information only and comply with GDPR/CCPA requirements.
                </p>
                {searchId && (
                  <p className="text-xs text-amber-700 mt-2">
                    Search ID: {searchId} | You can request immediate deletion at any time
                  </p>
                )}
              </div>
              {searchId && (
                <button
                  onClick={handleDeleteResults}
                  className="ml-4 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Results Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDiscovery;