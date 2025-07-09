import React from 'react';
import { Quote } from 'lucide-react';

const WhySection = () => {
  return (
    <section id="why" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why This Matters
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A personal story about digital legacy and the importance of handling 
            online accounts with dignity
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 relative">
          <Quote className="w-8 h-8 text-purple-400 mb-6" />
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 leading-relaxed mb-6">
              I care about privacy, data ownership, and the right to be forgotten. 
              My dad died almost 9 years ago, and his LinkedIn profile is still up. 
              No activity, no connections—just digital residue we leave behind.
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              In a time when systems rely on accurate data, it matters that we treat 
              these accounts with care—and dignity.
            </p>
            
            <p className="text-gray-800 leading-relaxed mb-6">
              Removing accounts like Facebook, YouTube, or LinkedIn often requires 
              death certificates or even court documentation. It's confusing and 
              emotional—especially while grieving.
            </p>
            
            <p className="text-gray-800 leading-relaxed">
              I decided to build a tool to help others navigate these painful, 
              bureaucratic tasks. This is step one. More to come.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhySection;