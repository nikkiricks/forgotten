import puppeteer from 'puppeteer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

class LinkedInAutomationService {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'production',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  }

  async submitDeceasedMemberForm(submissionData, certificateBuffer) {
    try {
      await this.initialize();

      // Navigate to LinkedIn's deceased member form
      await this.page.goto('https://www.linkedin.com/help/linkedin/answer/a1339724', {
        waitUntil: 'networkidle2'
      });

      // Look for the deceased member form or contact form
      const formExists = await this.page.$('form') !== null;
      
      if (!formExists) {
        // Try alternative approach - look for help contact form
        await this.navigateToContactForm();
      }

      // Fill out the form with automation
      await this.fillDeceasedMemberForm(submissionData);

      // Handle file upload
      await this.uploadDeathCertificate(certificateBuffer, submissionData.file.originalname);

      // Submit the form
      await this.submitForm();

      // Get confirmation or tracking information
      const confirmationData = await this.getConfirmationData();

      return {
        success: true,
        confirmationId: confirmationData.id,
        message: 'LinkedIn removal request submitted successfully',
        estimatedProcessingTime: '5-10 business days'
      };

    } catch (error) {
      console.error('LinkedIn automation error:', error);
          } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async navigateToContactForm() {
    // Navigate to LinkedIn help contact form
    await this.page.goto('https://www.linkedin.com/help/linkedin/ask', {
      waitUntil: 'networkidle2'
    });

    // Select "Account Management" category
    await this.page.click('select[name="category"]');
    await this.page.select('select[name="category"]', 'account-management');

    // Select "Deceased Member" subcategory
    await this.page.click('select[name="subcategory"]');
    await this.page.select('select[name="subcategory"]', 'deceased-member');
  }

  async fillDeceasedMemberForm(data) {
    // Fill contact information
    await this.page.type('input[name="email"]', data.contactEmail);
    
    // Fill deceased person information
    await this.page.type('input[name="deceased_name"]', data.deceasedName);
    await this.page.type('input[name="linkedin_url"]', data.linkedinUrl);
    
    if (data.deceasedEmail) {
      await this.page.type('input[name="deceased_email"]', data.deceasedEmail);
    }

    // Select relationship
    const relationshipMapping = {
      'immediate-family': 'immediate_family',
      'authorized-entity': 'authorized_representative'
    };
    
    await this.page.select('select[name="relationship"]', relationshipMapping[data.relationship]);

    // Add additional context in description field
    const description = `
Request to remove deceased member's LinkedIn profile.

Deceased: ${data.deceasedName}
Profile: ${data.linkedinUrl}
Date of Death: ${data.dateOfDeath || 'Not provided'}
Relationship: ${data.relationship}
Digital Signature: ${data.digitalSignature}

${data.additionalInfo ? `Additional Information: ${data.additionalInfo}` : ''}

Death certificate attached. Please process this removal request.
    `.trim();

    await this.page.type('textarea[name="description"]', description);
  }

  async uploadDeathCertificate(buffer, filename) {
    // Save buffer temporarily for upload
    const tempPath = path.join('/tmp', `temp_${Date.now()}_${filename}`);
    fs.writeFileSync(tempPath, buffer);

    try {
      // Find file upload input
      const fileInput = await this.page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(tempPath);
        
        // Wait for upload to complete
        await this.page.waitForSelector('.upload-success', { timeout: 30000 });
      }
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  async submitForm() {
    // Click submit button
    await this.page.click('button[type="submit"]');
    
    // Wait for submission confirmation
    await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
  }

  async getConfirmationData() {
    // Extract confirmation details from the page
    const confirmationText = await this.page.$eval('.confirmation-message', el => el.textContent);
    
    // Look for case number or reference ID
    const caseNumberMatch = confirmationText.match(/case\s*#?\s*(\w+)/i) || 
                           confirmationText.match(/reference\s*#?\s*(\w+)/i) ||
                           confirmationText.match(/ticket\s*#?\s*(\w+)/i);

    return {
      id: caseNumberMatch ? caseNumberMatch[1] : `AUTO_${Date.now()}`,
      message: confirmationText,
      timestamp: new Date().toISOString()
    };
  }

  async checkSubmissionStatus(confirmationId) {
    // This would check the status of a previous submission
    // Implementation depends on LinkedIn's system
    return {
      status: 'processing',
      lastUpdated: new Date().toISOString(),
      estimatedCompletion: '5-10 business days'
    };
  }
}

export default LinkedInAutomationService;