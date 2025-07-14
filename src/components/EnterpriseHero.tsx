import React from 'react';
import { Building2, Users, Shield, CheckCircle } from 'lucide-react';

const EnterpriseHero = () => {
  return (
    <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center mb-6">
              <Building2 className="w-8 h-8 text-purple-400 mr-3" />
              <span className="text-purple-400 font-semibold">For Funeral Homes & Professional Services</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Offer Digital Legacy Management as a
              <span className="text-purple-400 block">Valued Service</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Help families navigate the complex process of removing deceased loved ones' online accounts. 
              Add value to your services while reducing administrative burden.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href="#pricing"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                View Plans & Pricing
              </a>
              <a
                href="#demo"
                className="border border-gray-400 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-center"
              >
                Request Demo
              </a>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                <span>White Label Options</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 p-6 rounded-lg">
              <Users className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Support Families</h3>
              <p className="text-gray-400 text-sm">
                Provide comprehensive digital legacy management during their most difficult time
              </p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Process</h3>
              <p className="text-gray-400 text-sm">
                Handle sensitive documents and data with enterprise-grade security
              </p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-lg">
              <Building2 className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your Brand</h3>
              <p className="text-gray-400 text-sm">
                Fully customizable with your branding and integrated into your workflow
              </p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-lg">
              <CheckCircle className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Easy Integration</h3>
              <p className="text-gray-400 text-sm">
                Simple setup with existing systems and staff training included
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseHero;