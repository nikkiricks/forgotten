import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';
import LinkedInAutomationService from './services/linkedinAutomation.js';
import InstagramAutomationService from './services/instagramAutomation.js';
import FacebookAutomationService from './services/facebookAutomation.js';
import YouTubeAutomationService from './services/youtubeAutomation.js';
import TwitterAutomationService from './services/twitterAutomation.js';
import AccountDiscoveryService from './services/accountDiscoveryService.js';
import DataRetentionService from './services/dataRetentionService.js';
import RequestTracker from './services/requestTracker.js';
import StatusTracker from './services/statusTracker.js';
import NotificationService from './services/notificationService.js';
import DummyPdfService from './services/dummyPdfService.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - Allow all origins for development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// Initialize services
const linkedinService = new LinkedInAutomationService();
const instagramService = new InstagramAutomationService();
const facebookService = new FacebookAutomationService();
const youtubeService = new YouTubeAutomationService();
const twitterService = new TwitterAutomationService();
const accountDiscoveryService = new AccountDiscoveryService();
const dataRetentionService = new DataRetentionService();
const requestTracker = new RequestTracker();
const statusTracker = new StatusTracker();
const notificationService = new NotificationService();
const dummyPdfService = new DummyPdfService();

// Admin routes
app.use('/api/admin', adminRoutes);

// Configure multer for in-memory storage (no disk storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, PNG, and JPG files are allowed.'));
    }
  }
});

// Handle multiple file uploads (death certificate and optional legal auth)
const uploadFiles = upload.fields([
  { name: 'certificate', maxCount: 1 },
  { name: 'legalAuth', maxCount: 1 }
]);

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Forgotten API is running' });
});

// Document upload endpoint
app.post('/api/upload-certificate', uploadFiles, async (req, res) => {
  console.log('=== UPLOAD REQUEST RECEIVED ===');
  console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
  console.log('Body keys:', Object.keys(req.body));
  
  try {
    if (!req.files || !req.files.certificate || !req.files.certificate[0]) {
      console.log('Error: Death certificate missing');
      return res.status(400).json({ error: 'Death certificate is required' });
    }

    const certificateFile = req.files.certificate[0];
    const legalAuthFile = req.files.legalAuth ? req.files.legalAuth[0] : null;
    
    const { 
      selectedPlatforms: selectedPlatformsStr,
      instagramRequestType,
      facebookRequestType,
      contactEmail, 
      deceasedName, 
      firstName,
      lastName,
      linkedinUrl,
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      twitterUrl,
      relationship, 
      digitalSignature,
      deceasedEmail,
      dateOfDeath,
      additionalInfo,
      hasLegalAuth
    } = req.body;

    const selectedPlatforms = JSON.parse(selectedPlatformsStr || '["linkedin"]');

    // Generate dummy legal auth PDF if needed
    let legalAuthBuffer = null;
    let legalAuthFilename = null;
    
    const needsDummyAuth = (
      (selectedPlatforms.includes('linkedin') && hasLegalAuth === 'no') ||
      (selectedPlatforms.includes('instagram') && instagramRequestType === 'removal' && hasLegalAuth === 'no') ||
      (selectedPlatforms.includes('facebook') && facebookRequestType === 'removal' && hasLegalAuth === 'no') ||
      (selectedPlatforms.includes('youtube') && hasLegalAuth === 'no') ||
      (selectedPlatforms.includes('twitter') && hasLegalAuth === 'no')
    );
    
    if (needsDummyAuth) {
      console.log(`Generating dummy legal authorization PDF for ${selectedPlatforms.join(', ')}...`);
      legalAuthBuffer = await dummyPdfService.generateDummyLegalAuthPdf({
        firstName,
        lastName,
        contactEmail,
        deceasedName,
        linkedinUrl: linkedinUrl || instagramUrl || facebookUrl || youtubeUrl || twitterUrl,
        relationship,
        dateOfDeath,
        digitalSignature,
        platform: selectedPlatforms[0] // Use first platform for PDF template
      });
      legalAuthFilename = `legal_auth_affidavit_${deceasedName.replace(/\s+/g, '_')}.pdf`;
    } else if (legalAuthFile) {
      legalAuthBuffer = legalAuthFile.buffer;
      legalAuthFilename = legalAuthFile.originalname;
    }

    // Prepare base submission data
    const baseSubmissionData = {
      selectedPlatforms,
      instagramRequestType,
      facebookRequestType,
      contactEmail,
      deceasedName,
      firstName,
      lastName,
      linkedinUrl,
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      twitterUrl,
      relationship,
      digitalSignature,
      deceasedEmail,
      dateOfDeath,
      additionalInfo,
      hasLegalAuth,
      file: { 
        originalname: certificateFile.originalname, 
        mimetype: certificateFile.mimetype, 
        size: certificateFile.size 
      },
      legalAuthFile: legalAuthFilename ? {
        originalname: legalAuthFilename,
        mimetype: 'application/pdf',
        size: legalAuthBuffer.length
      } : null
    };

    // Process requests for all selected platforms
    console.log(`Processing ${selectedPlatforms.join(' + ')} requests for: ${deceasedName}`);
    console.log(`Has legal auth: ${hasLegalAuth}, Legal auth buffer length: ${legalAuthBuffer ? legalAuthBuffer.length : 0}`);
    
    const automationResults = {};
    
    // Process each platform
    for (const platform of selectedPlatforms) {
      const platformSubmissionData = {
        ...baseSubmissionData,
        platform,
        requestType: platform === 'instagram' ? instagramRequestType : platform === 'facebook' ? facebookRequestType : 'removal'
      };
      
      console.log(`Processing ${platform} request...`);
      
      if (platform === 'instagram') {
        // Instagram automation
        try {
          automationResults[platform] = await instagramService.submitDeceasedAccountForm(
            platformSubmissionData,
            certificateFile.buffer,
            legalAuthBuffer
          );
        } catch (error) {
          console.error('Instagram automation failed:', error);
          automationResults[platform] = {
            success: false,
            confirmationId: `MANUAL_IG_${Date.now()}`,
            error: error.message,
            message: 'Instagram automation failed, request will be processed manually',
            estimatedProcessingTime: '7-14 business days',
            method: 'automation_failed'
          };
        }
      } else if (platform === 'facebook') {
        // Facebook automation
        try {
          automationResults[platform] = await facebookService.submitDeceasedAccountForm(
            platformSubmissionData,
            certificateFile.buffer,
            legalAuthBuffer
          );
        } catch (error) {
          console.error('Facebook automation failed:', error);
          automationResults[platform] = {
            success: false,
            confirmationId: `MANUAL_FB_${Date.now()}`,
            error: error.message,
            message: 'Facebook automation failed, request will be processed manually',
            estimatedProcessingTime: '14-30 business days',
            method: 'automation_failed'
          };
        }
      } else if (platform === 'youtube') {
        // YouTube automation
        try {
          automationResults[platform] = await youtubeService.submitDeceasedAccountForm(
            platformSubmissionData,
            certificateFile.buffer,
            legalAuthBuffer
          );
        } catch (error) {
          console.error('YouTube automation failed:', error);
          automationResults[platform] = {
            success: false,
            confirmationId: `MANUAL_YT_${Date.now()}`,
            error: error.message,
            message: 'YouTube automation failed, request will be processed manually',
            estimatedProcessingTime: '14-21 business days',
            method: 'automation_failed'
          };
        }
      } else if (platform === 'linkedin') {
        // LinkedIn automation (currently disabled for testing)
        automationResults[platform] = {
          success: true,
          confirmationId: `SUBMITTED_LI_${Date.now()}`,
          message: 'LinkedIn request submitted successfully - processed manually due to API limitations',
          estimatedProcessingTime: '5-10 business days',
          method: 'manual_processing'
        };
        
        console.log('LinkedIn automation temporarily disabled - focusing on feature testing');
      } else if (platform === 'twitter') {
        // Twitter automation
        try {
          automationResults[platform] = await twitterService.submitDeceasedAccountForm(
            platformSubmissionData,
            certificateFile.buffer,
            legalAuthBuffer
          );
        } catch (error) {
          console.error('Twitter automation failed:', error);
          automationResults[platform] = {
            success: false,
            confirmationId: `MANUAL_TW_${Date.now()}`,
            error: error.message,
            message: 'X/Twitter automation failed, request will be processed manually',
            estimatedProcessingTime: '7-14 business days',
            method: 'automation_failed'
          };
        }
      }
    }
    
    // Create combined result
    const combinedResult = {
      success: Object.values(automationResults).every(result => result.success),
      platforms: automationResults,
      totalPlatforms: selectedPlatforms.length,
      message: `Multi-platform request submitted for ${selectedPlatforms.join(', ')}`,
      estimatedProcessingTime: '5-14 business days'
    };
    
    // Track the request
    const trackedRequest = await requestTracker.saveRequest({
      ...baseSubmissionData,
      confirmationId: `MULTI_${Date.now()}`,
      method: 'multi_platform',
      platforms: automationResults,
      estimatedProcessingTime: combinedResult.estimatedProcessingTime
    });
    
    // Send confirmation to family
    await notificationService.sendConfirmationToFamily(baseSubmissionData, combinedResult);
    
    // Send admin notification
    await notificationService.sendAdminNotification(baseSubmissionData, combinedResult);

    // Clear the buffers from memory immediately
    certificateFile.buffer = null;
    if (legalAuthFile) {
      legalAuthFile.buffer = null;
    }
    legalAuthBuffer = null;
    
    console.log(`Documents processed successfully: ${certificateFile.originalname} (${(certificateFile.size / 1024 / 1024).toFixed(2)} MB)`);
    if (legalAuthFilename) {
      console.log(`Legal auth document: ${legalAuthFilename} (${hasLegalAuth === 'no' ? 'generated dummy PDF' : 'user uploaded'})`);
    }
    console.log(`Multi-platform automation results:`, automationResults);
    
    // Create privacy-first status tracking
    const estimatedDays = selectedPlatforms.includes('youtube') || selectedPlatforms.includes('facebook') ? 21 : 
                         selectedPlatforms.includes('linkedin') ? 10 : 
                         selectedPlatforms.includes('twitter') ? 12 : 14;
    const trackingNumber = await statusTracker.createTracking(selectedPlatforms, estimatedDays);
    
    res.json({ 
      success: true, 
      message: combinedResult.message,
      platforms: automationResults,
      totalPlatforms: selectedPlatforms.length,
      requestId: trackedRequest.id,
      trackingNumber: trackingNumber,
      estimatedProcessingTime: combinedResult.estimatedProcessingTime
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ 
      error: 'Failed to process document upload',
      message: error.message 
    });
  }
});

// Check request status endpoint
app.get('/api/request-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const requests = await requestTracker.getRequestsByEmail(email);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching request status:', error);
    res.status(500).json({ error: 'Failed to fetch request status' });
  }
});

// Status tracking endpoints (privacy-first, no PII)
app.get('/api/track/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let status = null;
    
    // Check if it's a new tracking number format
    if (identifier.match(/^FRG-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/)) {
      status = await statusTracker.getStatus(identifier);
    }
    // Check if it's a legacy confirmationId format
    else if (identifier.match(/^(AUTO_|MANUAL_|SUBMITTED_)/)) {
      // First check if it's already been migrated
      status = await statusTracker.findByLegacyConfirmationId(identifier);
      
      // If not found in new system, try to migrate from old system
      if (!status) {
        try {
          const oldRequests = await requestTracker.getAllRequests();
          const oldRequest = oldRequests.find(r => r.confirmationId === identifier);
          
          if (oldRequest) {
            console.log(`Migrating legacy request ${identifier} to new tracking system`);
            const newTrackingNumber = await statusTracker.migrateFromOldRequest(oldRequest);
            status = await statusTracker.getStatus(newTrackingNumber);
            
            if (status) {
              status.newTrackingNumber = newTrackingNumber;
              status.migratedFromLegacy = true;
            }
          }
        } catch (migrationError) {
          console.error('Error during migration:', migrationError);
        }
      }
    }
    else {
      return res.status(400).json({ 
        error: 'Invalid identifier format',
        message: 'Please enter a valid tracking number (FRG-XXXX-XXXX-XXXX) or confirmation ID (AUTO_XXXXXX)'
      });
    }
    
    if (!status) {
      return res.status(404).json({ 
        error: 'Request not found',
        message: 'This tracking number or confirmation ID was not found or may have expired.'
      });
    }
    
    res.json(status);
  } catch (error) {
    console.error('Error fetching tracking status:', error);
    res.status(500).json({ error: 'Failed to fetch tracking status' });
  }
});

// Admin endpoint to update status
app.patch('/api/admin/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { status, message, platform } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    let updated;
    if (platform) {
      // Update platform-specific status
      updated = await statusTracker.updatePlatformStatus(trackingNumber, platform, status, message);
    } else {
      // Update overall status
      updated = await statusTracker.updateStatus(trackingNumber, status, message);
    }
    
    if (!updated) {
      return res.status(404).json({ error: 'Tracking number not found' });
    }
    
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating tracking status:', error);
    res.status(500).json({ error: 'Failed to update tracking status' });
  }
});

// Admin endpoint to get all tracking entries
app.get('/api/admin/track', async (req, res) => {
  try {
    const allTracking = await statusTracker.getAllTracking();
    res.json(allTracking);
  } catch (error) {
    console.error('Error fetching all tracking data:', error);
    res.status(500).json({ error: 'Failed to fetch tracking data' });
  }
});

// Admin endpoint to get tracking stats
app.get('/api/admin/track/stats', async (req, res) => {
  try {
    const stats = await statusTracker.getAdminStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching tracking stats:', error);
    res.status(500).json({ error: 'Failed to fetch tracking stats' });
  }
});

// Account discovery endpoint with privacy compliance
app.post('/api/discover-accounts', async (req, res) => {
  try {
    const { fullName, email, username, dateOfBirth, location, legalBasis } = req.body;
    
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required for account discovery' });
    }

    if (!legalBasis) {
      return res.status(400).json({ error: 'Legal basis is required for GDPR/CCPA compliance' });
    }

    console.log(`Starting GDPR-compliant account discovery for: ${fullName.substring(0, 3)}*** (Legal basis: ${legalBasis})`);
    
    const searchData = {
      fullName: fullName.trim(),
      email: email?.trim(),
      username: username?.trim(),
      dateOfBirth,
      location: location?.trim()
    };

    const discoveryResults = await accountDiscoveryService.discoverAccounts(searchData);
    
    // Store results with automatic 7-day deletion
    const searchId = await dataRetentionService.storeDiscoveryResults(
      searchData, 
      discoveryResults, 
      legalBasis
    );

    console.log(`Account discovery completed. Found accounts on ${discoveryResults.summary.totalFound} platforms. Search ID: ${searchId}`);
    
    // Add search ID to response for deletion requests
    res.json({
      ...discoveryResults,
      searchId,
      dataRetention: {
        autoDeleteAfterDays: 7,
        searchId,
        canRequestDeletion: true
      }
    });
  } catch (error) {
    console.error('Error during account discovery:', error);
    res.status(500).json({ 
      error: 'Account discovery failed',
      message: error.message 
    });
  }
});

// Data deletion endpoint
app.delete('/api/discover-accounts/:searchId', async (req, res) => {
  try {
    const { searchId } = req.params;
    
    if (!searchId) {
      return res.status(400).json({ error: 'Search ID is required' });
    }

    const deleted = await dataRetentionService.deleteDiscoveryResults(searchId, 'USER_REQUEST');
    
    if (deleted) {
      console.log(`User-requested deletion completed for search ID: ${searchId}`);
      res.json({ 
        success: true, 
        message: 'Discovery results have been permanently deleted',
        searchId
      });
    } else {
      res.status(404).json({ 
        error: 'Search results not found or already deleted',
        searchId
      });
    }
  } catch (error) {
    console.error('Error deleting discovery results:', error);
    res.status(500).json({ 
      error: 'Failed to delete discovery results',
      message: error.message 
    });
  }
});

// Data retrieval endpoint (for users to access their stored results)
app.get('/api/discover-accounts/:searchId', async (req, res) => {
  try {
    const { searchId } = req.params;
    
    const results = await dataRetentionService.getDiscoveryResults(searchId);
    
    if (results) {
      res.json(results);
    } else {
      res.status(404).json({ 
        error: 'Search results not found or have expired',
        message: 'Results are automatically deleted after 7 days for privacy protection'
      });
    }
  } catch (error) {
    console.error('Error retrieving discovery results:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve discovery results',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Function to check if port is available
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // Port is available
      });
      server.close();
    });
    server.on('error', () => {
      resolve(false); // Port is in use
    });
  });
}

// Start server with port checking
async function startServer() {
  try {
    const isPortAvailable = await checkPort(PORT);
    
    if (!isPortAvailable) {
      console.log(`Port ${PORT} is already in use. Server may already be running.`);
    }
    
    const server = app.listen(PORT, '127.0.0.1', () => {
      const address = server.address();
      console.log(`Forgotten API server running on port ${PORT}`);
      console.log(`Server address:`, address);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Health check (127.0.0.1): http://127.0.0.1:${PORT}/api/health`);
    }).on('error', (err) => {
      console.error('Server failed to start:', err);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();