import React, { useState } from 'react';
import { Search, Clock, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

interface PlatformStatus {
  name: string;
  status: string;
  lastUpdated: string;
}

interface StatusData {
  trackingNumber: string;
  status: string;
  platforms: PlatformStatus[];
  submittedAt: string;
  lastUpdated: string;
  estimatedCompletionDate: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    message: string;
  }>;
  daysRemaining: number;
  migratedFromLegacy?: boolean;
  newTrackingNumber?: string;
}

const StatusTracker = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError(null);
    setStatusData(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/track/${trackingNumber.trim()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch status');
      }

      const data = await response.json();
      setStatusData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'action_required':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-100 border-green-200';
      case 'processing':
        return 'text-blue-800 bg-blue-100 border-blue-200';
      case 'action_required':
        return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      case 'failed':
        return 'text-red-800 bg-red-100 border-red-200';
      default:
        return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resetForm = () => {
    setTrackingNumber('');
    setStatusData(null);
    setError(null);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Track Your Request
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your tracking number to check the status of your digital legacy request. 
            No login required - we respect your privacy.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="tracking-number" className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="FRG-XXXX-XXXX-XXXX or AUTO_XXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your tracking number (FRG-XXXX-XXXX-XXXX) or legacy confirmation ID (AUTO_XXXXXX)
              </p>
            </div>
            <div className="sm:pt-7">
              <button
                type="submit"
                disabled={loading || !trackingNumber.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-purple-400 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {statusData && (
          <div className="space-y-6">
            {/* Overall Status */}
            <div className={`border rounded-lg p-6 ${getStatusColor(statusData.status)}`}>
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(statusData.status)}
                <div>
                  <h3 className="text-lg font-semibold">
                    Request Status: {formatStatus(statusData.status)}
                  </h3>
                  <p className="text-sm opacity-75">
                    Tracking: {statusData.trackingNumber}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Submitted:</span>
                  <br />
                  {formatDate(statusData.submittedAt)}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <br />
                  {formatDate(statusData.lastUpdated)}
                </div>
                <div>
                  <span className="font-medium">Estimated Completion:</span>
                  <br />
                  {statusData.daysRemaining > 0 
                    ? `${statusData.daysRemaining} days remaining`
                    : formatDate(statusData.estimatedCompletionDate)
                  }
                </div>
              </div>
            </div>

            {/* Migration Notice */}
            {statusData.migratedFromLegacy && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-2">📋 Your New Tracking Number</h3>
                    <p className="text-sm text-blue-800 mb-3">
                      We've upgraded your request to our new privacy-first tracking system! 
                      Your new tracking number is: <strong className="font-mono">{statusData.newTrackingNumber || statusData.trackingNumber}</strong>
                    </p>
                    <p className="text-xs text-blue-700">
                      Save this new tracking number for future reference. The old confirmation ID will continue to work, but the new format provides better privacy protection.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Platform Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Status</h3>
              <div className="space-y-3">
                {statusData.platforms.map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(platform.status)}
                      <span className="font-medium capitalize">{platform.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(platform.status)}`}>
                        {formatStatus(platform.status)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Updated: {formatDate(platform.lastUpdated)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
              <div className="space-y-4">
                {statusData.statusHistory.slice().reverse().map((entry, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{formatStatus(entry.status)}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{entry.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="text-center">
              <button
                onClick={resetForm}
                className="text-purple-400 hover:text-purple-500 font-medium"
              >
                Track Another Request
              </button>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <h4 className="font-medium text-blue-900 mb-2">🔒 Privacy Protected</h4>
            <p className="text-sm text-blue-800">
              We store no personal information with your tracking number. 
              Status data is automatically deleted after 90 days.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatusTracker;