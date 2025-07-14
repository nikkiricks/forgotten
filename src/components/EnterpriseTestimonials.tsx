import React from 'react';
import { Quote, Star } from 'lucide-react';

const EnterpriseTestimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Mitchell',
      title: 'Director of Family Services',
      company: 'Heritage Funeral Home',
      location: 'Portland, OR',
      rating: 5,
      text: 'Forgotten has transformed how we support families during their most difficult time. What used to take weeks of confusing paperwork now happens automatically. Our families appreciate the additional value we provide.',
      image: '/api/placeholder/64/64'
    },
    {
      name: 'Michael Chen',
      title: 'Estate Planning Attorney',
      company: 'Chen & Associates Law',
      location: 'San Francisco, CA',
      rating: 5,
      text: 'The integration with our existing workflow has been seamless. We can now offer comprehensive digital estate planning services to our clients, and the automated processing saves us countless hours.',
      image: '/api/placeholder/64/64'
    },
    {
      name: 'Jennifer Rodriguez',
      title: 'Operations Manager',
      company: 'Sunset Memorial Services',
      location: 'Phoenix, AZ',
      rating: 5,
      text: 'The white-label branding makes it feel like our own service. Families love that we can handle their digital legacy needs alongside traditional services. It\'s become a key differentiator for us.',
      image: '/api/placeholder/64/64'
    },
    {
      name: 'David Thompson',
      title: 'Senior Partner',
      company: 'Thompson Estate Law',
      location: 'Chicago, IL',
      rating: 5,
      text: 'The analytics dashboard helps us track our digital estate services and show clients the value we provide. The compliance features give us confidence when handling sensitive documents.',
      image: '/api/placeholder/64/64'
    },
    {
      name: 'Lisa Park',
      title: 'Family Care Coordinator',
      company: 'Peaceful Passages Funeral Home',
      location: 'Denver, CO',
      rating: 5,
      text: 'Our staff training was excellent, and the ongoing support has been exceptional. We\'ve processed over 200 cases with zero issues. It\'s become an essential part of our service offering.',
      image: '/api/placeholder/64/64'
    },
    {
      name: 'Robert Williams',
      title: 'Managing Director',
      company: 'Williams & Sons Funeral Directors',
      location: 'Nashville, TN',
      rating: 5,
      text: 'The ROI has been impressive. We\'ve increased our average service value by 15% while providing genuine value to families. The automated processing means we can focus on what matters most - caring for families.',
      image: '/api/placeholder/64/64'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Leading Funeral Homes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how funeral homes and estate professionals are using Forgotten to provide better service to families
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8 relative">
              <Quote className="w-8 h-8 text-purple-400 mb-4" />
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4 bg-gray-300"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                  <p className="text-sm text-purple-600 font-medium">{testimonial.company}</p>
                  <p className="text-xs text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join 500+ Funeral Homes Already Using Forgotten
            </h3>
            <p className="text-gray-600 mb-6">
              Provide comprehensive digital legacy management services to your families while growing your business
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Start Free Trial
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Schedule Demo
              </button>
            </div>
            
            <div className="mt-6 flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseTestimonials;