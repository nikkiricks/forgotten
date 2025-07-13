import React from 'react';
import { Globe } from 'lucide-react';

const ComingSoon = () => {
  const platforms = [
    { name: 'Twitter/X', icon: Globe, color: 'text-gray-900' },
    { name: 'TikTok', icon: Globe, color: 'text-purple-600' },
    { name: 'Snapchat', icon: Globe, color: 'text-yellow-500' },
    { name: 'More platforms', icon: Globe, color: 'text-gray-600' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            More Platforms Coming Soon
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We now support LinkedIn, Instagram, Facebook, and YouTube. We're expanding to help with 
            even more platforms, making digital legacy management comprehensive
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
            >
              <platform.icon className={`w-8 h-8 ${platform.color} mx-auto mb-3`} />
              <h3 className="font-medium text-gray-900">{platform.name}</h3>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Want to be notified when we add more platforms?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button className="bg-purple-400 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-500 transition-colors">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComingSoon;