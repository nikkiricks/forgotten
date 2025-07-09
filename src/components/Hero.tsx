import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Help Your Loved One's
          <span className="text-purple-400 block">Digital Legacy</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Navigating the removal of a deceased person's online accounts shouldn't add to your grief. 
          We help you handle these difficult digital tasks with dignity and care.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#upload"
            className="bg-purple-400 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-500 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Start with LinkedIn</span>
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#why"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;