import React, { useState } from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import LegalPages from './LegalPages';
import EmailAdmin from './EmailAdmin';

const Footer = () => {
  const [currentPage, setCurrentPage] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  const [showEmailAdmin, setShowEmailAdmin] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);

  const handleLogoClick = () => {
    setAdminClicks(prev => prev + 1);
    if (adminClicks + 1 >= 5) {
      setShowEmailAdmin(true);
      setAdminClicks(0);
    }
  };

  if (currentPage) {
    return <LegalPages type={currentPage} onBack={() => setCurrentPage(null)} />;
  }

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div 
            className="flex items-center justify-center space-x-2 mb-4 cursor-pointer"
            onClick={handleLogoClick}
            title={adminClicks > 0 ? `${5 - adminClicks} more clicks for admin` : undefined}
          >
            <Heart className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold">Forgotten</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Helping families navigate digital legacy with dignity and care
          </p>
          
          <div className="flex justify-center">
            <a
              href="https://lnkd.in/gFvHGzms"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-400 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-500 transition-colors flex items-center space-x-2"
            >
              <span>Follow the project on LinkedIn</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Forgotten. Made with care for those we've lost.
            </p>
            <div className="flex space-x-6 text-sm">
              <button 
                onClick={() => setCurrentPage('privacy')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setCurrentPage('terms')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => setCurrentPage('contact')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      <EmailAdmin 
        isOpen={showEmailAdmin} 
        onClose={() => setShowEmailAdmin(false)} 
      />
    </footer>
  );
};

export default Footer;