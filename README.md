<img width="897" height="901" alt="image" src="https://github.com/user-attachments/assets/71519358-c342-4837-a007-022bba5090b7" />

# Forgotten - Digital Legacy Management

A respectful tool to help families remove deceased loved ones' online accounts across multiple platforms including LinkedIn and Instagram.

## 🚀 Quick Production Setup (5 minutes)

This application is production-ready and can handle real documents immediately. Follow these steps:

### 1. Gmail Setup (Recommended - Most Reliable)

**Option A: Gmail App Password (Recommended)**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords → Generate password for "Mail"
4. Copy the 16-character app password

**Option B: Gmail with OAuth (Advanced)**
- More secure but requires additional setup
- Good for high-volume production use

### 2. Alternative Email Providers

**Outlook/Hotmail:**
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

**Yahoo:**
```
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

**Professional Email Services:**
- AWS SES (recommended for production)
- SendGrid
- Mailgun

## Quick Setup for Production Testing

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure your email settings:

```bash
cp .env.example .env
```

**Edit `.env` with your real credentials:**

```env
# Your Gmail credentials
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.actual.email@gmail.com
SMTP_PASS=your-16-char-app-password

# Where you want to receive the death certificates
RECIPIENT_EMAIL=support@yourcompany.com

# Production settings
PORT=3001
NODE_ENV=production
```

### 3. Test the System

```bash
# Install dependencies
npm install

# Start the full application
npm run dev:full
```

**Test with a real document:**
1. Go to http://localhost:5173
2. Fill out the form with real information
3. Upload a test PDF/image
4. Submit and check your email

### 4. Share with Others

Once tested, others can:
1. Visit your deployed URL
2. Upload their death certificate
3. Fill out the LinkedIn information
4. Submit - you'll receive their documents via email
5. You manually process their LinkedIn removal request

## 📧 What Happens When Someone Submits

1. **User uploads document** → Secure form submission
2. **System sends email** → You receive structured email with:
   - Death certificate attachment
   - Contact information
   - LinkedIn profile details
   - Relationship information
   - Digital signature
3. **File deleted immediately** → No storage on servers
4. **You process manually** → Use the information to contact LinkedIn

## 🔒 Security Features (Production Ready)

✅ **No file storage** - Documents only exist in memory during email send
✅ **Immediate deletion** - Files purged after successful email
✅ **File validation** - Only PDF, PNG, JPG accepted
✅ **Size limits** - 10MB maximum
✅ **Input sanitization** - All form data validated
✅ **CORS protection** - Prevents unauthorized access
✅ **HTTPS ready** - SSL/TLS support for production

## 🚀 Production Deployment Options

**Quick Deploy (Recommended):**
- [Railway](https://railway.app) - Easy Node.js deployment
- [Render](https://render.com) - Free tier available
- [Vercel](https://vercel.com) - Frontend + serverless functions

**Enterprise:**
- AWS (EC2 + SES for email)
- Google Cloud Platform
- Microsoft Azure

### Railway Deployment (5 minutes)

1. Push code to GitHub
2. Connect Railway to your repo
3. Add environment variables in Railway dashboard
4. Deploy automatically

### Environment Variables for Production

```env
# Email (use production email service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@yourcompany.com
SMTP_PASS=your-production-password
RECIPIENT_EMAIL=team@yourcompany.com

# Production settings
NODE_ENV=production
PORT=3001
```

## 📋 Manual LinkedIn Process (What You Do)

When you receive a submission:

1. **Review the email** with attached death certificate
2. **Go to LinkedIn Help Center** → "Deceased Member"
3. **Submit LinkedIn's form** using the provided information:
   - Death certificate (attached to email)
   - Deceased person's LinkedIn URL
   - Your contact information
   - Relationship verification
4. **Follow up with family** via their provided email
5. **Track progress** until account is removed

## 🎯 Business Model Options

**Free Service:**
- Run as community service
- Cover costs through donations

**Paid Service:**
- Charge $25-50 per request
- Covers your time + processing
- Premium support included

**Subscription:**
- Monthly fee for families
- Handle multiple platforms
- Ongoing digital legacy management

## 📞 Customer Support Ready

The system includes:
- Clear error messages
- File validation feedback  
- Success confirmations
- Privacy guarantees displayed
- Guidance for users without legal docs

## 🔄 Scaling Considerations

**Current capacity:** Handles dozens of requests per day
**To scale:** 
- Add database for tracking requests
- Implement user accounts
- Add automated LinkedIn API integration
- Multi-platform support (Facebook, Instagram, etc.)

### 3. Run the Application

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev:full
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### 4. Testing with Real Documents

The application is now production-ready and will:
- Accept PDF, PNG, or JPG death certificates (up to 10MB)
- Collect contact information and relationship details
- Send the document securely via email
- Delete the file from memory immediately after sending
- Never store files on disk

### Security Features

- ✅ In-memory file processing only
- ✅ Immediate file deletion after email send
- ✅ File type and size validation
- ✅ HTTPS ready for production
- ✅ CORS protection
- ✅ Input validation and sanitization

### Production Deployment

For production deployment:
1. Update CORS origins in `server/index.js`
2. Set `NODE_ENV=production`
3. Use a production email service (AWS SES, SendGrid, etc.)
4. Deploy to a service like Railway, Render, or AWS

## Privacy Commitment

This application follows the privacy principles outlined in the original vision:
- No persistent file storage
- Secure transmission only
- Immediate deletion after processing
- Transparent about data handling
