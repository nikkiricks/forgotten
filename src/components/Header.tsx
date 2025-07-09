import React from 'react';
import { Heart } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-semibold text-gray-900">Forgotten</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#why" className="text-gray-600 hover:text-purple-400 transition-colors">
              Why This Matters
            </a>
            <a href="#upload" className="text-gray-600 hover:text-purple-400 transition-colors">
              Get Started
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;