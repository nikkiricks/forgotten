import React from 'react';
import { Heart, FileText, Home, Building2 } from 'lucide-react';

interface HeaderProps {
  onNavigate?: (view: 'main' | 'wizard' | 'enterprise') => void;
  currentView?: 'main' | 'wizard' | 'enterprise';
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentView = 'main' }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-purple-400" />
            <button 
              onClick={() => onNavigate?.('main')}
              className="text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors"
            >
              Forgotten
            </button>
          </div>
          <nav className="flex items-center space-x-6">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('main')}
                  className={`flex items-center space-x-1 transition-colors ${
                    currentView === 'main' 
                      ? 'text-purple-600 font-medium' 
                      : 'text-gray-600 hover:text-purple-400'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>For Families</span>
                </button>
                <button
                  onClick={() => onNavigate('enterprise')}
                  className={`flex items-center space-x-1 transition-colors ${
                    currentView === 'enterprise' 
                      ? 'text-purple-600 font-medium' 
                      : 'text-gray-600 hover:text-purple-400'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>For Business</span>
                </button>
                <button
                  onClick={() => onNavigate('wizard')}
                  className={`flex items-center space-x-1 transition-colors ${
                    currentView === 'wizard' 
                      ? 'text-purple-600 font-medium' 
                      : 'text-gray-600 hover:text-purple-400'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Document Wizard</span>
                </button>
              </>
            )}
            {currentView === 'main' && !onNavigate && (
              <>
                <a href="#why" className="text-gray-600 hover:text-purple-400 transition-colors">
                  Why This Matters
                </a>
                <a href="#upload" className="text-gray-600 hover:text-purple-400 transition-colors">
                  Get Started
                </a>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;