import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import UploadForm from './components/UploadForm';
import StatusChecker from './components/StatusChecker';
import WhySection from './components/WhySection';
import ComingSoon from './components/ComingSoon';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <UploadForm />
        <StatusChecker />
        <WhySection />
        <ComingSoon />
      </main>
      <Footer />
    </div>
  );
}

export default App;