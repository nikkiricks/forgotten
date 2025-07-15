import React from 'react';
import { getEmailSignups, saveEmailSignup, downloadEmailSignups } from '../utils/emailCollection';

const EmailDebug: React.FC = () => {
  const testEmail = () => {
    const testEmailAddress = `test-${Date.now()}@example.com`;
    saveEmailSignup(testEmailAddress, 'debug-test');
    alert(`Saved test email: ${testEmailAddress}`);
  };

  const showStoredEmails = () => {
    const emails = getEmailSignups();
    console.log('📧 All stored emails:', emails);
    
    if (emails.length === 0) {
      alert('No emails stored yet!');
    } else {
      alert(`Found ${emails.length} stored emails:\n\n${emails.map(e => `${e.email} (${e.source})`).join('\n')}`);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('forgotten-email-signups');
    alert('Email storage cleared!');
  };

  const checkBrowserStorage = () => {
    const stored = localStorage.getItem('forgotten-email-signups');
    console.log('Raw localStorage data:', stored);
    alert(`Raw storage data: ${stored || 'EMPTY'}`);
  };

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 space-y-2 text-sm z-50">
      <div className="font-medium text-yellow-800">Email Debug Panel</div>
      <div className="space-y-1">
        <button onClick={testEmail} className="block w-full text-left bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600">
          Test Save Email
        </button>
        <button onClick={showStoredEmails} className="block w-full text-left bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600">
          Show Stored Emails
        </button>
        <button onClick={checkBrowserStorage} className="block w-full text-left bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600">
          Check Raw Storage
        </button>
        <button onClick={clearStorage} className="block w-full text-left bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600">
          Clear Storage
        </button>
        <button onClick={downloadEmailSignups} className="block w-full text-left bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600">
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default EmailDebug;