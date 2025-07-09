import React from 'react';
import { Heart, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
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
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;