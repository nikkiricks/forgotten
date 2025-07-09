import React, { useState } from 'react';
import { Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const StatusChecker = () => {
  const [email, setEmail] = useState('');
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/request-status/${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch request status');
      }

      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Check Request Status
          </h2>
          <p className="text-gray-600">
            Enter your email address to check the status of your LinkedIn removal requests
          </p>
        </div>

        <form onSubmit={checkStatus} className="mb-8">
          <div className="flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-400 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-500 transition-colors disabled:bg-gray-300 flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{loading ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {requests.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Requests</h3>
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{request.deceasedName}</h4>
                    <p className="text-sm text-gray-600">{request.linkedinUrl}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center space-x-2 ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    <span>{request.status.toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Confirmation ID:</p>
                    <p className="font-mono text-gray-900">{request.confirmationId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Submitted:</p>
                    <p className="text-gray-900">{new Date(request.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Method:</p>
                    <p className="text-gray-900">{request.method === 'email_fallback' ? 'Email Submission' : 'Automated'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Updated:</p>
                    <p className="text-gray-900">{new Date(request.lastUpdated).toLocaleDateString()}</p>
                  </div>
                </div>

                {request.notes && request.notes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Updates:</p>
                    <div className="space-y-2">
                      {request.notes.map((note: any, index: number) => (
                        <div key={index} className="text-sm">
                          <p className="text-gray-600">{new Date(note.timestamp).toLocaleDateString()}</p>
                          <p className="text-gray-900">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {requests.length === 0 && email && !loading && !error && (
          <div className="text-center py-8">
            <p className="text-gray-600">No requests found for this email address.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatusChecker;