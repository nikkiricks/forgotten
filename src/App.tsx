import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import UploadForm from './components/UploadForm';
import AccountDiscovery from './components/AccountDiscovery';
import StatusTracker from './components/StatusTracker';
import WhySection from './components/WhySection';
import ComingSoon from './components/ComingSoon';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <AccountDiscovery />
          </div>
        </section>
        <UploadForm />
        <StatusTracker />
        <WhySection />
        <ComingSoon />
      </main>
      <Footer />
    </div>
  );
}

export default App;