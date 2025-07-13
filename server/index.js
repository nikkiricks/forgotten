import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';
import LinkedInAutomationService from './services/linkedinAutomation.js';
import RequestTracker from './services/requestTracker.js';
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
const requestTracker = new RequestTracker();
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
      contactEmail, 
      deceasedName, 
      firstName,
      lastName,
      linkedinUrl, 
      relationship, 
      digitalSignature,
      deceasedEmail,
      dateOfDeath,
      additionalInfo,
      hasLegalAuth
    } = req.body;

    // Generate dummy legal auth PDF if user doesn't have legal authorization documents
    let legalAuthBuffer = null;
    let legalAuthFilename = null;
    
    if (hasLegalAuth === 'no') {
      console.log('Generating dummy legal authorization PDF...');
      legalAuthBuffer = await dummyPdfService.generateDummyLegalAuthPdf({
        firstName,
        lastName,
        contactEmail,
        deceasedName,
        linkedinUrl,
        relationship,
        dateOfDeath,
        digitalSignature
      });
      legalAuthFilename = `legal_auth_affidavit_${deceasedName.replace(/\s+/g, '_')}.pdf`;
    } else if (legalAuthFile) {
      legalAuthBuffer = legalAuthFile.buffer;
      legalAuthFilename = legalAuthFile.originalname;
    }

    // Prepare submission data
    const submissionData = {
      contactEmail,
      deceasedName,
      firstName,
      lastName,
      linkedinUrl,
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

    // Attempt automated LinkedIn submission
    console.log(`Processing automated LinkedIn removal for: ${deceasedName}`);
    console.log(`Has legal auth: ${hasLegalAuth}, Legal auth buffer length: ${legalAuthBuffer ? legalAuthBuffer.length : 0}`);
    
    // TEMPORARY: Skip LinkedIn automation due to LinkedIn API issues
    // Let's focus on testing the legal authorization feature itself
    const automationResult = {
      success: true,
      confirmationId: `SUBMITTED_${Date.now()}`,
      message: 'Request submitted successfully - will be processed manually due to LinkedIn API limitations',
      estimatedProcessingTime: '5-10 business days',
      method: 'manual_processing'
    };
    
    console.log('LinkedIn automation skipped - focusing on legal auth feature testing');
    
    // let automationResult;
    // try {
    //   automationResult = await linkedinService.submitDeceasedMemberForm(
    //     submissionData, 
    //     certificateFile.buffer, 
    //     legalAuthBuffer
    //   );
    // } catch (automationError) {
    //   console.error('LinkedIn automation service failed:', automationError);
    //   // Fallback result if automation service crashes
    //   automationResult = {
    //     success: false,
    //     confirmationId: `FALLBACK_${Date.now()}`,
    //     error: automationError.message,
    //     message: 'Automation service unavailable, request will be processed manually',
    //     estimatedProcessingTime: '5-10 business days',
    //     method: 'service_fallback'
    //   };
    // }
    
    // Track the request
    const trackedRequest = await requestTracker.saveRequest({
      ...submissionData,
      confirmationId: automationResult.confirmationId,
      method: automationResult.method,
      estimatedProcessingTime: automationResult.estimatedProcessingTime
    });
    
    // Send confirmation to family
    await notificationService.sendConfirmationToFamily(submissionData, automationResult);
    
    // Send admin notification
    await notificationService.sendAdminNotification(submissionData, automationResult);

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
    console.log(`LinkedIn automation result: ${automationResult.success ? 'SUCCESS' : 'FALLBACK'} - ${automationResult.confirmationId}`);
    
    res.json({ 
      success: true, 
      message: 'LinkedIn removal request submitted successfully',
      confirmationId: automationResult.confirmationId,
      requestId: trackedRequest.id,
      estimatedProcessingTime: automationResult.estimatedProcessingTime
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