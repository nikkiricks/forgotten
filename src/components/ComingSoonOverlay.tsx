import React, { useState } from 'react';
import { Clock, Mail, CheckCircle, X, ExternalLink } from 'lucide-react';
import { saveEmailSignup } from '../utils/emailCollection';

interface ComingSoonOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  expectedDate?: string;
  emailSignup?: boolean;
  demoAvailable?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({
  isOpen,
  onClose,
  title,
  description,
  expectedDate = "Q2 2025",
  emailSignup = false,
  demoAvailable = false,
  priority = 'medium'
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Save email to local storage for demo
      saveEmailSignup(email, `coming-soon-${title.toLowerCase().replace(/\s+/g, '-')}`);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
        onClose();
      }, 2000);
    }
  };

  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-blue-200 bg-blue-50', 
    low: 'border-gray-200 bg-gray-50'
  };

  const priorityTextColors = {
    high: 'text-red-800',
    medium: 'text-blue-800',
    low: 'text-gray-800'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${priorityColors[priority]}`}>
            <Clock className={`w-8 h-8 ${priorityTextColors[priority]}`} />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{description}</p>

          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${priorityColors[priority]} ${priorityTextColors[priority]}`}>
            Expected: {expectedDate}
          </div>

          {demoAvailable && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 mb-2">
                📊 Business demo available for enterprise prospects
              </p>
              <a
                href="mailto:demo@forgotten.app?subject=Demo Request"
                className="inline-flex items-center text-sm text-green-700 hover:text-green-800 font-medium"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Request demo access
              </a>
            </div>
          )}

          {emailSignup && !submitted && (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Get notified when this feature launches
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Notify Me
              </button>
            </form>
          )}

          {submitted && (
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Thanks! We'll notify you when it's ready.</p>
            </div>
          )}

          {!emailSignup && (
            <button
              onClick={onClose}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Got it
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComingSoonOverlay;