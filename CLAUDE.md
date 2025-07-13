# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Forgotten is a comprehensive digital legacy management service that helps families remove deceased loved ones' online accounts across multiple platforms including LinkedIn and Instagram. The application uses web automation to submit removal requests directly to each platform's deceased member forms.

## Development Commands

```bash
# Install dependencies
npm install

# Development
npm run dev          # Start frontend only (Vite dev server on port 5173)
npm run server       # Start backend only (Express server on port 3001)
npm run dev:full     # Start both frontend and backend concurrently

# Production
npm run build        # Build frontend for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 with TypeScript, built with Vite
- **Styling**: Tailwind CSS with PostCSS
- **Structure**: Component-based architecture in `src/components/`
- **Main Components**:
  - `UploadForm`: Handles death certificate upload and form submission
  - `StatusChecker`: Allows users to check request status by email
  - `Hero`, `WhySection`, `ComingSoon`: Marketing/informational sections

### Backend (Node.js + Express)
- **Framework**: Express.js with ES modules
- **File Handling**: Multer with in-memory storage (no disk persistence)
- **Email**: Nodemailer for SMTP-based email notifications
- **Services Architecture**:
  - `LinkedInAutomationService`: Puppeteer-based web automation for LinkedIn form submission
  - `RequestTracker`: Tracks submission requests in JSON file storage
  - `NotificationService`: Handles email notifications to families and admins

### Security Features
- In-memory file processing only (no disk storage)
- File type validation (PDF, PNG, JPG only)
- 10MB file size limit
- CORS protection
- Input sanitization and validation
- Files immediately cleared from memory after processing

### Multi-Platform Automation
- **LinkedIn Automation** (`server/services/linkedinAutomation.js`): Handles LinkedIn's professional network deceased member removal
- **Instagram Automation** (`server/services/instagramAutomation.js`): Handles Instagram's social media deceased account removal/memorialization

Both services use Puppeteer with Firefox to:
1. Navigate to platform-specific deceased member forms
2. Fill out forms with provided family/deceased information
3. Upload death certificates and legal authorization documents
4. Submit requests and capture confirmation details
5. Fallback to manual processing if automation fails

### Data Flow
1. User selects platforms and uploads death certificate via React frontend
2. Express backend receives file in memory via Multer
3. Multi-platform automation processes each selected platform in parallel
4. Individual requests tracked per platform with separate confirmation IDs
5. Email notifications sent to family and admin with comprehensive results
6. File buffers immediately cleared from memory

## Environment Configuration

Required environment variables:
```env
# Email settings (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
RECIPIENT_EMAIL=admin@yourcompany.com

# Server settings
PORT=3001
NODE_ENV=production  # Controls Puppeteer headless mode
```

## Key Technical Details

- **File Security**: Files never touch disk - processed entirely in memory
- **Automation**: Uses incognito mode and realistic browser headers to avoid detection
- **Error Handling**: Graceful fallback to manual processing if automation fails
- **Concurrency**: Frontend and backend designed to run simultaneously in development
- **Production**: CORS configured for all origins in development, needs restriction for production