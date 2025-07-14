import React from 'react';
import EnterpriseHero from './EnterpriseHero';
import EnterpriseFeatures from './EnterpriseFeatures';
import PricingPlans from './PricingPlans';
import EnterpriseTestimonials from './EnterpriseTestimonials';
import Footer from './Footer';

const EnterprisePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <EnterpriseHero />
      <EnterpriseFeatures />
      <PricingPlans />
      <EnterpriseTestimonials />
      <Footer />
    </div>
  );
};

export default EnterprisePage;