import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import UploadForm from './components/UploadForm';
import AccountDiscovery from './components/AccountDiscovery';
import StatusTracker from './components/StatusTracker';
import WhySection from './components/WhySection';
import ComingSoon from './components/ComingSoon';
import Footer from './components/Footer';
import DocumentPreparationWizard from './components/DocumentPreparationWizard';
import EnterprisePage from './components/EnterprisePage';

type ViewMode = 'main' | 'wizard' | 'enterprise';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('main');

  if (currentView === 'wizard') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onNavigate={setCurrentView} currentView={currentView} />
        <DocumentPreparationWizard />
        <Footer />
      </div>
    );
  }

  if (currentView === 'enterprise') {
    return (
      <div className="min-h-screen bg-white">
        <Header onNavigate={setCurrentView} currentView={currentView} />
        <EnterprisePage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={setCurrentView} currentView={currentView} />
      <main>
        <Hero onNavigate={setCurrentView} />
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