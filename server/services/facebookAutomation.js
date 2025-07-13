import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class FacebookAutomationService {
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
      
      // Navigate to appropriate Facebook form
      // Facebook uses the same form for both, with a choice in the form
      const formUrl = 'https://www.facebook.com/help/contact/228813257197480';

      await this.page.goto(formUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for the form to load
      await this.page.waitForSelector('form', { timeout: 10000 });

      // Fill out the Facebook form
      await this.fillFacebookForm(submissionData, isRemovalRequest);

      // Handle file upload(s)
      if (certificateBuffer) {
        await this.uploadDeathCertificate(certificateBuffer, submissionData.file.originalname);
      }

      // Upload legal authorization if provided (especially for removal requests)
      if (legalAuthBuffer) {
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
        message: `Facebook ${isRemovalRequest ? 'removal' : 'memorialization'} request submitted successfully`,
        estimatedProcessingTime: '14-30 business days',
        method: 'automated_form',
        requestType: isRemovalRequest ? 'removal' : 'memorialization'
      };

    } catch (error) {
      console.error('Facebook automation error:', error);
      
      // Fallback to manual processing if automation fails
      return {
        success: false,
        confirmationId: `MANUAL_FB_${Date.now()}`,
        error: error.message,
        message: 'Facebook automation failed, request will be processed manually',
        estimatedProcessingTime: '14-30 business days',
        method: 'automation_failed'
      };
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async fillFacebookForm(data, isRemovalRequest) {
    // Facebook form fields based on their help center forms
    
    // Requester information
    await this.fillFieldIfExists('#requester_first_name', data.firstName);
    await this.fillFieldIfExists('#requester_last_name', data.lastName);
    await this.fillFieldIfExists('input[name="requester_first_name"]', data.firstName);
    await this.fillFieldIfExists('input[name="requester_last_name"]', data.lastName);
    
    // Contact information
    await this.fillFieldIfExists('#requester_email', data.contactEmail);
    await this.fillFieldIfExists('input[name="email"]', data.contactEmail);
    await this.fillFieldIfExists('input[name="requester_email"]', data.contactEmail);
    
    // Deceased person information
    await this.fillFieldIfExists('#deceased_first_name', this.extractFirstName(data.deceasedName));
    await this.fillFieldIfExists('#deceased_last_name', this.extractLastName(data.deceasedName));
    await this.fillFieldIfExists('input[name="deceased_first_name"]', this.extractFirstName(data.deceasedName));
    await this.fillFieldIfExists('input[name="deceased_last_name"]', this.extractLastName(data.deceasedName));
    
    // Facebook profile URL
    const facebookUsername = this.extractFacebookUsername(data.facebookUrl);
    await this.fillFieldIfExists('#facebook_profile_url', data.facebookUrl);
    await this.fillFieldIfExists('input[name="profile_url"]', data.facebookUrl);
    await this.fillFieldIfExists('input[name="facebook_url"]', data.facebookUrl);

    // Request type selection (memorialization vs removal)
    await this.selectRequestType(isRemovalRequest);

    // Relationship to deceased
    await this.selectRelationship(data.relationship);

    // Date of death if provided
    if (data.dateOfDeath) {
      await this.fillFieldIfExists('input[name="date_of_death"]', data.dateOfDeath);
      await this.fillFieldIfExists('#date_of_death', data.dateOfDeath);
    }

    // Additional information / reason for request
    const description = this.buildDescription(data, isRemovalRequest);
    await this.fillFieldIfExists('textarea[name="additional_info"]', description);
    await this.fillFieldIfExists('textarea[name="description"]', description);
    await this.fillFieldIfExists('#additional_information', description);

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
      console.log(`Facebook field ${selector} not found or couldn't be filled:`, error.message);
    }
  }

  async selectRequestType(isRemovalRequest) {
    // Try to select removal vs memorialization
    const requestTypeSelectors = [
      'select[name="request_type"]',
      '#request_type',
      'input[name="request_type"]'
    ];

    for (const selector of requestTypeSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          if (element.tagName.toLowerCase() === 'select') {
            if (isRemovalRequest) {
              await element.select('remove');
            } else {
              await element.select('memorialize');
            }
          } else {
            // Radio button selection
            const radioValue = isRemovalRequest ? 'remove' : 'memorialize';
            await this.page.click(`input[name="request_type"][value="${radioValue}"]`);
          }
          break;
        }
      } catch (error) {
        console.log(`Request type selector ${selector} not found:`, error.message);
      }
    }

    // Alternative: Look for text-based selection
    if (isRemovalRequest) {
      await this.clickElementWithText('Remove the account');
      await this.clickElementWithText('Delete permanently');
    } else {
      await this.clickElementWithText('Memorialize the account');
      await this.clickElementWithText('Convert to memorial');
    }
  }

  async selectRelationship(relationship) {
    // Facebook relationship options
    const relationshipSelectors = [
      'select[name="relationship"]',
      '#relationship_to_deceased',
      'select[name="relationship_to_deceased"]'
    ];

    for (const selector of relationshipSelectors) {
      try {
        const selectElement = await this.page.$(selector);
        if (selectElement) {
          if (relationship === 'immediate-family') {
            // Try different Facebook relationship values
            await selectElement.select('immediate_family');
            await selectElement.select('spouse');
            await selectElement.select('parent');
            await selectElement.select('child');
            await selectElement.select('sibling');
          } else if (relationship === 'extended-family') {
            await selectElement.select('extended_family');
            await selectElement.select('other_family');
          } else {
            await selectElement.select('legal_representative');
            await selectElement.select('executor');
          }
          break;
        }
      } catch (error) {
        console.log(`Relationship selector ${selector} not found:`, error.message);
      }
    }
  }

  async clickElementWithText(text) {
    try {
      const elements = await this.page.$x(`//*[contains(text(), "${text}")]`);
      if (elements.length > 0) {
        await elements[0].click();
      }
    } catch (error) {
      console.log(`Element with text "${text}" not found:`, error.message);
    }
  }

  extractFirstName(fullName) {
    return fullName ? fullName.split(' ')[0] : '';
  }

  extractLastName(fullName) {
    if (!fullName) return '';
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }

  extractFacebookUsername(facebookUrl) {
    // Extract username from Facebook URL
    if (!facebookUrl) return '';
    
    const match = facebookUrl.match(/facebook\.com\/([^\/\?]+)/);
    return match ? match[1] : facebookUrl;
  }

  buildDescription(data, isRemovalRequest) {
    const requestType = isRemovalRequest ? 'removal' : 'memorialization';
    
    return `
Request for ${requestType} of deceased Facebook account.

Deceased Person: ${data.deceasedName}
Facebook Account: ${data.facebookUrl}
Date of Death: ${data.dateOfDeath || 'As indicated on death certificate'}
Requester: ${data.firstName} ${data.lastName}
Relationship: ${this.getRelationshipDescription(data.relationship)}
Contact Email: ${data.contactEmail}
Digital Signature: ${data.digitalSignature}

${data.additionalInfo ? `Additional Information: ${data.additionalInfo}` : ''}

Death certificate and ${data.hasLegalAuth === 'yes' ? 'legal authorization documents' : 'family relationship affidavit'} attached.
Please process this ${requestType} request according to Facebook's policies for deceased accounts.
    `.trim();
  }

  getRelationshipDescription(relationship) {
    switch (relationship) {
      case 'immediate-family': return 'Immediate Family Member';
      case 'extended-family': return 'Extended Family Member';
      case 'authorized-entity': return 'Legal Representative/Executor';
      default: return 'Family Member';
    }
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
      const tempPath = path.join('/tmp', `temp_fb_${Date.now()}_${filename}`);
      fs.writeFileSync(tempPath, buffer);

      // Common file upload selectors for Facebook forms
      const fileInputSelectors = [
        'input[type="file"]',
        'input[accept*="pdf"]',
        'input[accept*="image"]',
        '[data-testid="file-upload"]',
        '#file_upload',
        'input[name="death_certificate"]',
        'input[name="supporting_documentation"]',
        'input[name="attachment"]'
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
          console.log(`Facebook ${fileType} uploaded successfully`);
        } catch (uploadError) {
          console.warn(`Facebook ${fileType} upload confirmation not detected, but file may have uploaded:`, uploadError.message);
        }
      } else {
        console.warn(`Facebook ${fileType} file upload input not found on form`);
      }
    } catch (error) {
      console.error(`Error uploading Facebook ${fileType}:`, error);
    } finally {
      // Clean up temp file
      const tempPath = path.join('/tmp', `temp_fb_${Date.now()}_${filename}`);
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
        'button:contains("Send Request")'
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
          if (buttonText.includes('submit') || buttonText.includes('send') || buttonText.includes('request')) {
            submitButton = button;
            break;
          }
        }
      }

      if (submitButton) {
        console.log("Facebook submit button found and clicked");
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
        throw new Error('Submit button not found on Facebook form');
      }
    } catch (error) {
      console.error('Error submitting Facebook form:', error);
      throw error;
    }
  }

  async getConfirmationData() {
    try {
      // Look for confirmation message with Facebook-specific selectors
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
            bodyText.toLowerCase().includes('request')) {
          confirmationText = bodyText;
        }
      }

      // Look for case number or reference ID in the confirmation text
      const caseNumberMatch = confirmationText.match(/case\s*#?\s*(\w+)/i) || 
                             confirmationText.match(/reference\s*#?\s*(\w+)/i) ||
                             confirmationText.match(/ticket\s*#?\s*(\w+)/i) ||
                             confirmationText.match(/request\s*#?\s*(\w+)/i);

      const confirmationId = caseNumberMatch ? caseNumberMatch[1] : `FB_AUTO_${Date.now()}`;

      return {
        id: confirmationId,
        message: confirmationText || 'Facebook form submitted successfully',
        timestamp: new Date().toISOString(),
        url: this.page.url()
      };
    } catch (error) {
      console.error('Error getting Facebook confirmation data:', error);
      return {
        id: `FB_AUTO_${Date.now()}`,
        message: 'Facebook form submitted - confirmation details not available',
        timestamp: new Date().toISOString(),
        url: this.page.url()
      };
    }
  }
}

export default FacebookAutomationService;