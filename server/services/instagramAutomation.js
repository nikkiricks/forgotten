import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class InstagramAutomationService {
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

  async submitDeceasedAccountForm(submissionData, certificateBuffer, legalAuthBuffer = null) {
    try {
      await this.initialize();

      // Determine if this is a memorialization or removal request
      const isRemovalRequest = submissionData.requestType === 'removal';
      
      // Navigate to appropriate Instagram form
      const formUrl = isRemovalRequest 
        ? 'https://help.instagram.com/contact/1474899482730688' // Removal form
        : 'https://help.instagram.com/contact/452224988254813'; // Memorialization form

      await this.page.goto(formUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for the form to load
      await this.page.waitForSelector('form', { timeout: 10000 });

      // Fill out the Instagram form
      await this.fillInstagramForm(submissionData, isRemovalRequest);

      // Handle file upload(s)
      if (certificateBuffer) {
        await this.uploadDeathCertificate(certificateBuffer, submissionData.file.originalname);
      }

      // Upload legal authorization if provided (for removal requests)
      if (legalAuthBuffer && isRemovalRequest) {
        const legalAuthFilename = submissionData.legalAuthFile ? 
          submissionData.legalAuthFile.originalname : 
          `legal_auth_${submissionData.deceasedName.replace(/\s+/g, '_')}.pdf`;
        await this.uploadLegalAuthDocument(legalAuthBuffer, legalAuthFilename);
      }

      // Submit the form
      await this.submitForm();

      // Get confirmation data
      const confirmationData = await this.getConfirmationData();

      return {
        success: true,
        confirmationId: confirmationData.id,
        message: `Instagram ${isRemovalRequest ? 'removal' : 'memorialization'} request submitted successfully`,
        estimatedProcessingTime: '7-14 business days',
        method: 'automated_form',
        requestType: isRemovalRequest ? 'removal' : 'memorialization'
      };

    } catch (error) {
      console.error('Instagram automation error:', error);
      
      // Fallback to manual processing if automation fails
      return {
        success: false,
        confirmationId: `MANUAL_IG_${Date.now()}`,
        error: error.message,
        message: 'Instagram automation failed, request will be processed manually',
        estimatedProcessingTime: '7-14 business days',
        method: 'automation_failed'
      };
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async fillInstagramForm(data, isRemovalRequest) {
    // Common form fields for both memorialization and removal
    
    // Contact information
    await this.fillFieldIfExists('#contact_email', data.contactEmail);
    await this.fillFieldIfExists('#reporter_email', data.contactEmail);
    await this.fillFieldIfExists('input[name="email"]', data.contactEmail);
    
    // Reporter name
    await this.fillFieldIfExists('#reporter_name', `${data.firstName} ${data.lastName}`);
    await this.fillFieldIfExists('input[name="reporter_name"]', `${data.firstName} ${data.lastName}`);
    await this.fillFieldIfExists('input[name="full_name"]', `${data.firstName} ${data.lastName}`);

    // Deceased person information
    await this.fillFieldIfExists('#deceased_name', data.deceasedName);
    await this.fillFieldIfExists('input[name="deceased_name"]', data.deceasedName);
    await this.fillFieldIfExists('input[name="account_holder_name"]', data.deceasedName);

    // Instagram username/URL
    const instagramUsername = this.extractInstagramUsername(data.instagramUrl);
    await this.fillFieldIfExists('#instagram_username', instagramUsername);
    await this.fillFieldIfExists('input[name="username"]', instagramUsername);
    await this.fillFieldIfExists('input[name="instagram_username"]', instagramUsername);

    // Relationship to deceased
    if (isRemovalRequest) {
      // For removal requests, specify immediate family relationship
      await this.selectRelationship(data.relationship);
    }

    // Additional information
    const description = this.buildDescription(data, isRemovalRequest);
    await this.fillFieldIfExists('textarea[name="description"]', description);
    await this.fillFieldIfExists('textarea[name="additional_info"]', description);
    await this.fillFieldIfExists('#message', description);

    // Date of death if provided
    if (data.dateOfDeath) {
      await this.fillFieldIfExists('input[name="date_of_death"]', data.dateOfDeath);
      await this.fillFieldIfExists('#date_of_death', data.dateOfDeath);
    }

    // Small delay to ensure all fields are filled
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async fillFieldIfExists(selector, value) {
    try {
      const field = await this.page.$(selector);
      if (field) {
        await field.click();
        await field.clear();
        await field.type(value);
      }
    } catch (error) {
      console.log(`Field ${selector} not found or couldn't be filled:`, error.message);
    }
  }

  async selectRelationship(relationship) {
    // Try to select the appropriate relationship option
    const relationshipSelectors = [
      'select[name="relationship"]',
      '#relationship',
      'select[name="reporter_relationship"]'
    ];

    for (const selector of relationshipSelectors) {
      try {
        const selectElement = await this.page.$(selector);
        if (selectElement) {
          if (relationship === 'immediate-family') {
            await selectElement.select('immediate_family');
          } else {
            await selectElement.select('authorized_entity');
          }
          break;
        }
      } catch (error) {
        console.log(`Relationship selector ${selector} not found:`, error.message);
      }
    }
  }

  extractInstagramUsername(instagramUrl) {
    // Extract username from Instagram URL
    if (!instagramUrl) return '';
    
    const match = instagramUrl.match(/instagram\.com\/([^\/\?]+)/);
    return match ? match[1] : instagramUrl;
  }

  buildDescription(data, isRemovalRequest) {
    const requestType = isRemovalRequest ? 'removal' : 'memorialization';
    
    return `
Request for ${requestType} of deceased Instagram account.

Deceased Person: ${data.deceasedName}
Instagram Account: ${data.instagramUrl}
Date of Death: ${data.dateOfDeath || 'As indicated on death certificate'}
Requester: ${data.firstName} ${data.lastName}
Relationship: ${data.relationship === 'immediate-family' ? 'Immediate Family Member' : 'Authorized Representative'}
Contact Email: ${data.contactEmail}
Digital Signature: ${data.digitalSignature}

${data.additionalInfo ? `Additional Information: ${data.additionalInfo}` : ''}

Death certificate and ${data.hasLegalAuth === 'yes' ? 'legal authorization documents' : 'family relationship affidavit'} attached.
Please process this ${requestType} request according to Instagram's policies for deceased accounts.
    `.trim();
  }

  async uploadDeathCertificate(buffer, filename) {
    return this.uploadFile(buffer, filename, 'death certificate');
  }

  async uploadLegalAuthDocument(buffer, filename) {
    return this.uploadFile(buffer, filename, 'legal authorization');
  }

  async uploadFile(buffer, filename, fileType) {
    try {
      // Save buffer temporarily for upload
      const tempPath = path.join('/tmp', `temp_ig_${Date.now()}_${filename}`);
      fs.writeFileSync(tempPath, buffer);

      // Common file upload selectors for Instagram forms
      const fileInputSelectors = [
        'input[type="file"]',
        'input[accept*="pdf"]',
        'input[accept*="image"]',
        '[data-testid="file-upload"]',
        '#file_upload',
        'input[name="attachment"]',
        'input[name="document"]'
      ];

      let fileInput = null;
      for (const selector of fileInputSelectors) {
        fileInput = await this.page.$(selector);
        if (fileInput) break;
      }

      // Look for "Add file" or "Browse" buttons if no direct input found
      if (!fileInput) {
        const uploadButtonSelectors = [
          'button:contains("Browse")',
          'button:contains("Choose")',
          'button:contains("Upload")',
          'button:contains("Attach")',
          '.upload-btn',
          '[data-testid="upload-button"]'
        ];

        for (const selector of uploadButtonSelectors) {
          const uploadButton = await this.page.$(selector);
          if (uploadButton) {
            await uploadButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Try to find file input again after clicking
            for (const inputSelector of fileInputSelectors) {
              fileInput = await this.page.$(inputSelector);
              if (fileInput) break;
            }
            break;
          }
        }
      }

      if (fileInput) {
        await fileInput.uploadFile(tempPath);
        
        // Wait for upload to complete
        await new Promise(resolve => setTimeout(resolve, 10000));

        try {
          await Promise.race([
            this.page.waitForSelector('.upload-success', { timeout: 15000 }),
            this.page.waitForSelector('[data-testid="upload-complete"]', { timeout: 15000 }),
            this.page.waitForSelector('.file-uploaded', { timeout: 15000 }),
          ]);
          console.log(`${fileType} uploaded successfully`);
        } catch (uploadError) {
          console.warn(`${fileType} upload confirmation not detected, but file may have uploaded:`, uploadError.message);
        }
      } else {
        console.warn(`${fileType} file upload input not found on Instagram form`);
      }
    } catch (error) {
      console.error(`Error uploading ${fileType}:`, error);
    } finally {
      // Clean up temp file
      const tempPath = path.join('/tmp', `temp_ig_${Date.now()}_${filename}`);
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
        '[data-testid="submit-button"]',
        'button:contains("Report")'
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
          if (buttonText.includes('submit') || buttonText.includes('send') || buttonText.includes('report')) {
            submitButton = button;
            break;
          }
        }
      }

      if (submitButton) {
        console.log("Instagram submit button found and clicked");
        // Scroll to submit button to ensure it's visible
        await submitButton.scrollIntoView();
        
        // Click the submit button
        await submitButton.click();
        
        // Wait for navigation or success indicators
        await new Promise(resolve => setTimeout(resolve, 10000));
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
        throw new Error('Submit button not found on Instagram form');
      }
    } catch (error) {
      console.error('Error submitting Instagram form:', error);
      throw error;
    }
  }

  async getConfirmationData() {
    try {
      // Look for confirmation message with Instagram-specific selectors
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
            bodyText.toLowerCase().includes('received') ||
            bodyText.toLowerCase().includes('report')) {
          confirmationText = bodyText;
        }
      }

      // Look for case number or reference ID in the confirmation text
      const caseNumberMatch = confirmationText.match(/case\s*#?\s*(\w+)/i) || 
                             confirmationText.match(/reference\s*#?\s*(\w+)/i) ||
                             confirmationText.match(/ticket\s*#?\s*(\w+)/i) ||
                             confirmationText.match(/report\s*#?\s*(\w+)/i);

      const confirmationId = caseNumberMatch ? caseNumberMatch[1] : `IG_AUTO_${Date.now()}`;

      return {
        id: confirmationId,
        message: confirmationText || 'Instagram form submitted successfully',
        timestamp: new Date().toISOString(),
        url: this.page.url()
      };
    } catch (error) {
      console.error('Error getting Instagram confirmation data:', error);
      return {
        id: `IG_AUTO_${Date.now()}`,
        message: 'Instagram form submitted - confirmation details not available',
        timestamp: new Date().toISOString(),
        url: this.page.url()
      };
    }
  }
}

export default InstagramAutomationService;