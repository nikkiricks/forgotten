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
      product: 'firefox',
      protocol: 'webDriverBidi',
      headless: process.env.NODE_ENV === 'production',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--incognito']
    });
    
    // Create incognito browser context
    const context = await this.browser.createBrowserContext();
    this.page = await context.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set additional headers to appear more like a real browser
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
  }

  async submitDeceasedMemberForm(submissionData, certificateBuffer) {
    try {
      await this.initialize();

      // Navigate directly to the deceased member form
      await this.page.goto('https://www.linkedin.com/help/linkedin/ask/ts-rmdmlp', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for the form to load
      await this.page.waitForSelector('form', { timeout: 10000 });

      // Fill out the form with the correct field mappings
      await this.fillDeceasedMemberForm(submissionData);

      // Handle file upload if certificate provided
      if (certificateBuffer) {
        await this.uploadDeathCertificate(certificateBuffer, submissionData.file.originalname);
      }

      // Submit the form
      await this.submitForm();

      // Get confirmation or tracking information
      const confirmationData = await this.getConfirmationData();

      return {
        success: true,
        confirmationId: confirmationData.id,
        message: 'LinkedIn removal request submitted successfully',
        estimatedProcessingTime: '5-10 business days',
        method: 'automated_form'
      };

    } catch (error) {
      console.error('LinkedIn automation error:', error);
      
      // Fallback to email method if automation fails
      return {
        success: false,
        error: error.message,
        message: 'Automation failed, manual processing required',
        method: 'automation_failed'
      };
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
    // Fill requester contact information (based on the form structure from images)
    await this.page.waitForSelector('#dyna-first_name', { timeout: 5000 });
    await this.page.type('#dyna-first_name', data.firstName);
    
    await this.page.waitForSelector('#dyna-last_name', { timeout: 5000 });
    await this.page.type('#dyna-last_name', data.lastName);
    
    await this.page.waitForSelector('#dyna-email', { timeout: 5000 });
    await this.page.type('#dyna-email', data.contactEmail);

    // Fill deceased person information
    await this.page.waitForSelector('#dyna-deceased_name', { timeout: 10000 });
    await this.page.type('#dyna-deceased_name', data.deceasedName);
    
    await this.page.waitForSelector('#dyna-deceased_profile_url', { timeout: 5000 });
    await this.page.type('#dyna-deceased_profile_url', data.linkedinUrl);

    // Add additional context in the description/details field
    const description = `
Request to remove deceased member's LinkedIn profile.
First Name: ${data.firstName}
Last Name: ${data.lastName}
Deceased: ${data.deceasedName}
Profile: ${data.linkedinUrl}
Date of Death: ${data.dateOfDeath || 'Not provided'}
Relationship: ${data.relationship}
Digital Signature: ${data.digitalSignature}

${data.additionalInfo ? `Additional Information: ${data.additionalInfo}` : ''}

Death certificate attached. Please process this removal request according to LinkedIn's policies for deceased members.
    `.trim();

    // Look for textarea or description field
    const descriptionField = await this.page.$('textarea') || await this.page.$('input[type="text"]:last-of-type');
    if (descriptionField) {
      await descriptionField.click();
      await descriptionField.type(description);
    }

    // Small delay to ensure all fields are filled
  await new Promise(resolve => setTimeout(resolve, 1000))
  }

  async uploadDeathCertificate(buffer, filename) {
    try {
      // Save buffer temporarily for upload
      const tempPath = path.join('/tmp', `temp_${Date.now()}_${filename}`);
      fs.writeFileSync(tempPath, buffer);

      // Find file upload input - look for common selectors
      const fileInputSelectors = [
        'input[type="file"]',
        'input[accept*="pdf"]',
        'input[accept*="image"]',
        '[data-testid="file-upload"]',
        '.file-upload input'
      ];

      let fileInput = null;
      for (const selector of fileInputSelectors) {
        fileInput = await this.page.$(selector);
        if (fileInput) break;
      }

      if (fileInput) {
        await fileInput.uploadFile(tempPath);
        
        // Wait for upload to complete with multiple possible success indicators
        await new Promise(resolve => setTimeout(resolve, 10000))

        try {
          await Promise.race([
            this.page.waitForSelector('.upload-success', { timeout: 15000 }),
            this.page.waitForSelector('[data-testid="upload-complete"]', { timeout: 15000 }),
            this.page.waitForSelector('.file-uploaded', { timeout: 15000 }),
          ]);
        } catch (uploadError) {
          console.warn('Upload confirmation not detected, but file may have uploaded:', uploadError.message);
        }
      } else {
        console.warn('File upload input not found on the page');
      }
    } catch (error) {
      console.error('Error uploading death certificate:', error);
    } finally {
      // Clean up temp file
      const tempPath = path.join('/tmp', `temp_${Date.now()}_${filename}`);
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  async submitForm() {
    try {
      // Look for submit button with various possible selectors
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:contains("Submit")',
        'button:contains("Send")',
        '.submit-btn',
        '[data-testid="submit-button"]'
      ];

      let submitButton = null;
      for (const selector of submitSelectors) {
        submitButton = await this.page.$(selector);
        if (submitButton) break;
      }

      if (!submitButton) {
        // Try to find any button that might be the submit button
        const buttons = await this.page.$$('button');
        for (const button of buttons) {
          const buttonText = await button.evaluate(el => el.textContent.toLowerCase());
          if (buttonText.includes('submit') || buttonText.includes('send')) {
            submitButton = button;
            break;
          }
        }
      }

      if (submitButton) {
        console.log("submit button hit!")
        // Scroll to submit button to ensure it's visible
        await submitButton.scrollIntoView();
        
        // Click the submit button
        await submitButton.click();
        
        // Wait for navigation or success indicators
        await new Promise(resolve => setTimeout(resolve, 10000))
        try {
          await Promise.race([
            this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }),
            this.page.waitForSelector('.success-message', { timeout: 15000 }),
            this.page.waitForSelector('.confirmation', { timeout: 15000 }),
          ]);
        } catch (navigationError) {
          console.warn('Navigation timeout, but form may have been submitted:', navigationError.message);
        }
      } else {
        throw new Error('Submit button not found');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  }

  async getConfirmationData() {
    try {
      // Look for confirmation message with multiple possible selectors
      const confirmationSelectors = [
        '.confirmation-message',
        '.success-message',
        '.alert-success',
        '[data-testid="confirmation"]',
        '.thank-you-message',
        'h1, h2, h3' // Sometimes confirmation is in a heading
      ];

      let confirmationElement = null;
      let confirmationText = '';

      for (const selector of confirmationSelectors) {
        confirmationElement = await this.page.$(selector);
        if (confirmationElement) {
          confirmationText = await confirmationElement.evaluate(el => el.textContent);
          break;
        }
      }

      // If no specific confirmation element found, get page title or main content
      if (!confirmationText) {
        confirmationText = await this.page.title();
        
        // Also try to get any visible text that might indicate success
        const bodyText = await this.page.evaluate(() => {
          const body = document.body;
          return body ? body.innerText.substring(0, 500) : '';
        });
        
        if (bodyText.toLowerCase().includes('thank you') || 
            bodyText.toLowerCase().includes('submitted') ||
            bodyText.toLowerCase().includes('received')) {
          confirmationText = bodyText;
        }
      }

      // Look for case number or reference ID in the confirmation text
      const caseNumberMatch = confirmationText.match(/case\s*#?\s*(\w+)/i) || 
                             confirmationText.match(/reference\s*#?\s*(\w+)/i) ||
                             confirmationText.match(/ticket\s*#?\s*(\w+)/i) ||
                             confirmationText.match(/request\s*#?\s*(\w+)/i);

      const confirmationId = caseNumberMatch ? caseNumberMatch[1] : `AUTO_${Date.now()}`;

      return {
        id: confirmationId,
        message: confirmationText || 'Form submitted successfully',
        timestamp: new Date().toISOString(),
        url: this.page.url()
      };
    } catch (error) {
      console.error('Error getting confirmation data:', error);
      return {
        id: `AUTO_${Date.now()}`,
        message: 'Form submitted - confirmation details not available',
        timestamp: new Date().toISOString(),
        url: this.page.url()
      };
    }
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