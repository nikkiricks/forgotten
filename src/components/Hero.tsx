import React from 'react';
import { ArrowRight, FileText } from 'lucide-react';

interface HeroProps {
  onNavigate?: (view: 'main' | 'wizard' | 'enterprise') => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Help Your Loved One's
          <span className="text-purple-400 block">Digital Legacy</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
          Navigating the removal of a deceased person's online accounts shouldn't add to your grief. 
          We help you handle these difficult digital tasks with dignity and care.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
          <p className="text-green-800 font-semibold">
            ✓ Always free for families and individuals
          </p>
          {onNavigate && (
            <p className="text-green-700 text-sm mt-1">
              Professional services available for funeral homes and estate professionals. 
              <button 
                onClick={() => onNavigate('enterprise')}
                className="text-green-600 hover:text-green-800 font-medium underline ml-1"
              >
                Learn more
              </button>
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#upload"
            className="bg-purple-400 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-500 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Begin Your Request</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          
          {onNavigate && (
            <button
              onClick={() => onNavigate('wizard')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Document Preparation Wizard</span>
            </button>
          )}
          
          <a
            href="#why"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Learn More
          </a>
        </div>
        
        {onNavigate && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>New!</strong> Use our Document Preparation Wizard to get step-by-step guidance 
                for obtaining Letters of Administration and managing probate requirements in your state.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;