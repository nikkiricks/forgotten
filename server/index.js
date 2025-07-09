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
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize services
const linkedinService = new LinkedInAutomationService();
const requestTracker = new RequestTracker();
const notificationService = new NotificationService();

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
app.post('/api/upload-certificate', upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    const { 
      contactEmail, 
      deceasedName, 
      linkedinUrl, 
      relationship, 
      digitalSignature,
      deceasedEmail,
      dateOfDeath,
      additionalInfo 
    } = req.body;

    // Prepare submission data
    const submissionData = {
      contactEmail,
      deceasedName,
      linkedinUrl,
      relationship,
      digitalSignature,
      deceasedEmail,
      dateOfDeath,
      additionalInfo,
      file: { originalname, mimetype, size }
    };

    // Attempt automated LinkedIn submission
    console.log(`Processing automated LinkedIn removal for: ${deceasedName}`);
    const automationResult = await linkedinService.submitDeceasedMemberForm(submissionData, buffer);
    
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

    // Clear the buffer from memory immediately
    req.file.buffer = null;
    
    console.log(`Document processed successfully: ${originalname} (${(size / 1024 / 1024).toFixed(2)} MB)`);
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
    
    app.listen(PORT, () => {
      console.log(`Forgotten API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();