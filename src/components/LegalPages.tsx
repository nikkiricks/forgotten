import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'contact';
  onBack: () => void;
}

const LegalPages: React.FC<LegalPageProps> = ({ type, onBack }) => {
  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          content: (
            <div className="space-y-6">
              <p className="text-gray-600">
                At Forgotten, we understand the sensitive nature of digital legacy management. 
                Your privacy and the privacy of those you're helping is our highest priority.
              </p>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Information We Collect</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Death certificates and legal authorization documents (processed securely, not stored)</li>
                  <li>Contact information for status updates</li>
                  <li>Platform account information for removal requests</li>
                  <li>Basic analytics for service improvement</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">How We Protect Your Data</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Documents are processed in-memory and automatically deleted after 24 hours</li>
                  <li>All data transmission is encrypted with TLS 1.3</li>
                  <li>No sensitive documents are permanently stored on our servers</li>
                  <li>Account discovery data is automatically deleted after 7 days</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Retention</h3>
                <p className="text-gray-600">
                  We retain minimal data necessary for service delivery. Most data is automatically 
                  deleted within 7 days. Request tracking information is kept for 30 days for 
                  status updates only.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Services</h3>
                <p className="text-gray-600">
                  We work directly with platform providers to process removal requests. 
                  We do not share personal information with any third parties except as 
                  required to fulfill removal requests.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Privacy-First Design:</strong> Forgotten is built with privacy by design. 
                  We collect only what's necessary and delete everything as soon as possible.
                </p>
              </div>
            </div>
          )
        };

      case 'terms':
        return {
          title: 'Terms of Service',
          content: (
            <div className="space-y-6">
              <p className="text-gray-600">
                By using Forgotten's digital legacy management services, you agree to these terms.
              </p>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Description</h3>
                <p className="text-gray-600">
                  Forgotten helps families manage digital accounts of deceased individuals by 
                  submitting removal requests to various platforms. We act as an intermediary 
                  to simplify this process during difficult times.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Legal Authorization Required</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>You must be legally authorized to request account removal</li>
                  <li>Valid death certificate and legal documentation required</li>
                  <li>You represent that you have the right to make these requests</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Limitations</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>We submit requests but cannot guarantee platform compliance</li>
                  <li>Each platform has its own policies and processing times</li>
                  <li>Some platforms may require additional verification</li>
                  <li>Results may vary based on platform-specific requirements</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing and Billing</h3>
                <p className="text-gray-600">
                  Individual use is always free. Professional plans for funeral homes and 
                  estate services have monthly subscription fees. All pricing is transparent 
                  and clearly displayed.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  <strong>No Guarantees:</strong> While we work diligently to process all requests, 
                  we cannot guarantee that all platforms will fulfill removal requests as their 
                  policies and procedures may vary.
                </p>
              </div>
            </div>
          )
        };

      case 'contact':
        return {
          title: 'Contact Us',
          content: (
            <div className="space-y-6">
              <p className="text-gray-600">
                We're here to help during difficult times. Reach out with any questions 
                or concerns about our digital legacy management services.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">General Support</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>📧 <a href="mailto:support@forgotten.app" className="text-purple-600 hover:text-purple-700">support@forgotten.app</a></p>
                    <p>Response time: Within 24 hours</p>
                    <p>For questions about our service, technical issues, or account status</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Enterprise & Business</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>📧 <a href="mailto:enterprise@forgotten.app" className="text-purple-600 hover:text-purple-700">enterprise@forgotten.app</a></p>
                    <p>Response time: Within 4 hours</p>
                    <p>For funeral homes, estate attorneys, and professional services</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy & Legal</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>📧 <a href="mailto:privacy@forgotten.app" className="text-purple-600 hover:text-purple-700">privacy@forgotten.app</a></p>
                    <p>For privacy concerns, data requests, or legal inquiries</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Support</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>For urgent cases requiring immediate attention</p>
                    <p>Please mark your email as "URGENT" in the subject line</p>
                    <p>Response time: Within 2 hours during business hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Follow Our Development</h4>
                <p className="text-green-700 text-sm mb-3">
                  Stay updated on new features and platform support:
                </p>
                <a
                  href="https://lnkd.in/gFvHGzms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-700 hover:text-green-800 font-medium text-sm"
                >
                  LinkedIn Project Updates →
                </a>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Commitment</h3>
                <p className="text-gray-600">
                  We understand you're going through a difficult time. Our team is committed 
                  to providing compassionate, professional support throughout the digital 
                  legacy management process. Every inquiry is treated with care and urgency.
                </p>
              </div>
            </div>
          )
        };

      default:
        return { title: '', content: null };
    }
  };

  const { title, content } = getContent();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-purple-600 text-white px-6 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
          </div>
          
          <div className="px-6 py-8">
            {content}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t">
            <p className="text-sm text-gray-600">
              Last updated: January 2025 • 
              <a href="mailto:legal@forgotten.app" className="text-purple-600 hover:text-purple-700 ml-1">
                Questions about this page?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPages;