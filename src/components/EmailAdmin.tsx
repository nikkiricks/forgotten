import React, { useState, useEffect } from 'react';
import { Download, Mail, Calendar, Tag, X } from 'lucide-react';
import { getEmailSignups, downloadEmailSignups, type EmailSignup } from '../utils/emailCollection';

interface EmailAdminProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailAdmin: React.FC<EmailAdminProps> = ({ isOpen, onClose }) => {
  const [signups, setSignups] = useState<EmailSignup[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSignups(getEmailSignups());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const groupedBySource = signups.reduce((acc, signup) => {
    if (!acc[signup.source]) {
      acc[signup.source] = [];
    }
    acc[signup.source].push(signup);
    return acc;
  }, {} as Record<string, EmailSignup[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6" />
            <h2 className="text-xl font-bold">Email Signups</h2>
            <span className="bg-purple-700 px-2 py-1 rounded-full text-sm">
              {signups.length} total
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadEmailSignups}
              className="bg-purple-700 hover:bg-purple-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {signups.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No email signups yet</h3>
              <p className="text-gray-600">
                Email addresses will appear here when users sign up for notifications.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedBySource).map(([source, sourceSignups]) => (
                <div key={source} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gray-600" />
                        <h3 className="font-medium text-gray-900 capitalize">
                          {source.replace(/-/g, ' ')}
                        </h3>
                        <span className="bg-gray-200 px-2 py-1 rounded-full text-xs text-gray-600">
                          {sourceSignups.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {sourceSignups.map((signup, index) => (
                      <div key={index} className="px-4 py-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <Mail className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{signup.email}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(signup.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(signup.email)}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Emails are stored locally in your browser for demo purposes.
            </p>
            <div className="text-sm text-gray-500">
              Last updated: {signups.length > 0 ? new Date().toLocaleTimeString() : 'Never'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailAdmin;