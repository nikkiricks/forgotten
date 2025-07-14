import React from 'react';
import { Check, Star, Building2, Users, Zap } from 'lucide-react';

const PricingPlans = () => {
  const plans = [
    {
      name: 'Individual',
      price: 'Free',
      period: 'Always',
      icon: Users,
      description: 'For families handling their own digital legacy needs',
      features: [
        'Process up to 1 case per month',
        'Support for all major platforms',
        'Death certificate upload',
        'Basic status tracking',
        'Email notifications',
        'Community support'
      ],
      buttonText: 'Start Free',
      buttonClass: 'bg-gray-600 hover:bg-gray-700',
      popular: false
    },
    {
      name: 'Professional',
      price: '$49',
      period: 'per month',
      icon: Building2,
      description: 'Perfect for small funeral homes and estate attorneys',
      features: [
        'Process up to 5 cases per month',
        'Basic custom branding',
        'Priority email support',
        'Client management dashboard',
        'Bulk document processing',
        'Basic analytics & reporting',
        'Staff training session'
      ],
      buttonText: 'Start Free Trial',
      buttonClass: 'bg-purple-600 hover:bg-purple-700',
      popular: true
    },
    {
      name: 'Business',
      price: '$149',
      period: 'per month',
      icon: Star,
      description: 'For growing funeral homes and professional services',
      features: [
        'Process up to 25 cases per month',
        'Full white-label branding',
        'Advanced analytics dashboard',
        'API access for integrations',
        'Dedicated account manager',
        'Custom workflow automation',
        'Staff training & onboarding',
        'Priority phone support'
      ],
      buttonText: 'Start Free Trial',
      buttonClass: 'bg-purple-600 hover:bg-purple-700',
      popular: false
    },
    {
      name: 'Enterprise',
      price: '$299',
      period: 'per month',
      icon: Zap,
      description: 'For large organizations with high-volume needs',
      features: [
        'Unlimited case processing',
        'Custom integrations & API',
        'Advanced security features',
        'Custom reporting & analytics',
        'Dedicated support team',
        'SLA guarantees',
        'Custom training programs',
        'Compliance certifications'
      ],
      buttonText: 'Contact Sales',
      buttonClass: 'bg-slate-900 hover:bg-slate-800',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Always free for individuals. Professional plans for funeral homes and estate services.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div 
                key={index}
                className={`bg-white rounded-lg shadow-lg p-8 relative ${
                  plan.popular ? 'ring-2 ring-purple-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <Icon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-600 ml-2">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${plan.buttonClass}`}>
                  {plan.buttonText}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            All plans include 24/7 platform monitoring and automated processing
          </p>
          <p className="text-sm text-gray-500">
            * Enterprise pricing includes volume discounts for 50+ cases per month
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;