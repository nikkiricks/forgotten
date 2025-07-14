import React from 'react';
import { 
  BarChart3, 
  Shield, 
  Clock, 
  Users, 
  Palette, 
  Globe,
  FileText,
  Headphones,
  Zap
} from 'lucide-react';

const EnterpriseFeatures = () => {
  const features = [
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Track case volumes, processing times, and client satisfaction metrics with detailed dashboards and custom reports.',
      benefits: ['Monthly performance reports', 'Client satisfaction tracking', 'Processing time analytics', 'Revenue impact metrics']
    },
    {
      icon: Palette,
      title: 'White Label Branding',
      description: 'Fully customize the platform with your branding, colors, and logo to seamlessly integrate with your existing services.',
      benefits: ['Custom color schemes', 'Logo integration', 'Branded email templates', 'Custom domain options']
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Comprehensive client dashboard to manage multiple cases, track progress, and maintain family communication.',
      benefits: ['Centralized client profiles', 'Case status tracking', 'Family communication tools', 'Document management']
    },
    {
      icon: Zap,
      title: 'API Integration',
      description: 'Connect with your existing funeral home management software and CRM systems for seamless workflow integration.',
      benefits: ['CRM integration', 'Automated case creation', 'Data synchronization', 'Custom webhooks']
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with HIPAA compliance, encrypted data storage, and audit trails for sensitive information.',
      benefits: ['HIPAA compliance', 'End-to-end encryption', 'Audit logging', 'SOC 2 Type II certified']
    },
    {
      icon: Clock,
      title: 'Automated Processing',
      description: 'Streamline workflows with automated document processing, status updates, and family notifications.',
      benefits: ['Automated form submission', 'Status notifications', 'Document processing', 'Workflow automation']
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Secure document storage and processing with automatic validation and compliance checking.',
      benefits: ['Secure document storage', 'Automatic validation', 'Compliance checking', 'Version control']
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      description: 'Priority support with dedicated account managers and staff training to ensure smooth operations.',
      benefits: ['Dedicated account manager', 'Staff training sessions', 'Priority support queue', '24/7 emergency support']
    },
    {
      icon: Globe,
      title: 'Multi-Platform Coverage',
      description: 'Comprehensive coverage across all major social media and professional platforms with regular updates.',
      benefits: ['15+ platforms supported', 'Regular platform updates', 'New platform integration', 'Custom platform requests']
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Enterprise Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional tools designed specifically for funeral homes, estate attorneys, and professional services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow">
                <div className="mb-6">
                  <Icon className="w-10 h-10 text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Transform Your Digital Legacy Services?
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Join leading funeral homes already using Forgotten to provide comprehensive digital legacy management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Schedule Demo
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseFeatures;