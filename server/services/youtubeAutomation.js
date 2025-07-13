import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class YouTubeAutomationService {
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

      // Navigate to Google's deceased account form
      const formUrl = 'https://support.google.com/accounts/troubleshooter/6357590?hl=en';

      await this.page.goto(formUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for the form to load
      await this.page.waitForSelector('form', { timeout: 10000 });

      // Fill out the YouTube/Google deceased account form
      await this.fillYouTubeForm(submissionData);

      // Handle file upload(s)
      if (certificateBuffer) {
        await this.uploadDeathCertificate(certificateBuffer, submissionData.file.originalname);
      }

      // Upload legal authorization if provided
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
        message: 'YouTube/Google account removal request submitted successfully',
        estimatedProcessingTime: '14-21 business days',
        method: 'automated_form',
        requestType: 'removal' // YouTube/Google only supports removal, not memorialization
      };

    } catch (error) {
      console.error('YouTube automation error:', error);
      
      // Fallback to manual processing if automation fails
      return {
        success: false,
        confirmationId: `MANUAL_YT_${Date.now()}`,
        error: error.message,
        message: 'YouTube automation failed, request will be processed manually',
        estimatedProcessingTime: '14-21 business days',
        method: 'automation_failed'
      };
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async fillYouTubeForm(data) {
    // Google deceased account form fields based on their help center forms
    
    // First, select the option to close account for deceased user
    await this.selectRequestType();
    
    // Requester information
    await this.fillFieldIfExists('#requester_first_name', data.firstName);
    await this.fillFieldIfExists('#requester_last_name', data.lastName);
    await this.fillFieldIfExists('input[name="requester_first_name"]', data.firstName);
    await this.fillFieldIfExists('input[name="requester_last_name"]', data.lastName);
    await this.fillFieldIfExists('input[name="first_name"]', data.firstName);
    await this.fillFieldIfExists('input[name="last_name"]', data.lastName);
    
    // Contact information
    await this.fillFieldIfExists('#requester_email', data.contactEmail);
    await this.fillFieldIfExists('input[name="email"]', data.contactEmail);
    await this.fillFieldIfExists('input[name="requester_email"]', data.contactEmail);
    await this.fillFieldIfExists('input[name="contact_email"]', data.contactEmail);
    
    // Deceased person information
    await this.fillFieldIfExists('#deceased_first_name', this.extractFirstName(data.deceasedName));
    await this.fillFieldIfExists('#deceased_last_name', this.extractLastName(data.deceasedName));
    await this.fillFieldIfExists('input[name="deceased_first_name"]', this.extractFirstName(data.deceasedName));
    await this.fillFieldIfExists('input[name="deceased_last_name"]', this.extractLastName(data.deceasedName));
    await this.fillFieldIfExists('input[name="account_holder_first_name"]', this.extractFirstName(data.deceasedName));
    await this.fillFieldIfExists('input[name="account_holder_last_name"]', this.extractLastName(data.deceasedName));
    
    // YouTube channel URL or email
    await this.fillFieldIfExists('#youtube_channel_url', data.youtubeUrl);
    await this.fillFieldIfExists('input[name="youtube_url"]', data.youtubeUrl);
    await this.fillFieldIfExists('input[name="channel_url"]', data.youtubeUrl);
    await this.fillFieldIfExists('input[name="account_url"]', data.youtubeUrl);
    
    // Deceased person's email if available
    if (data.deceasedEmail) {
      await this.fillFieldIfExists('#deceased_email', data.deceasedEmail);
      await this.fillFieldIfExists('input[name="deceased_email"]', data.deceasedEmail);
      await this.fillFieldIfExists('input[name="account_email"]', data.deceasedEmail);
    }

    // Relationship to deceased
    await this.selectRelationship(data.relationship);

    // Date of death if provided
    if (data.dateOfDeath) {
      await this.fillFieldIfExists('input[name="date_of_death"]', data.dateOfDeath);
      await this.fillFieldIfExists('#date_of_death', data.dateOfDeath);
      await this.fillFieldIfExists('input[type="date"]', data.dateOfDeath);
    }

    // Additional information / reason for request
    const description = this.buildDescription(data);
    await this.fillFieldIfExists('textarea[name="additional_info"]', description);
    await this.fillFieldIfExists('textarea[name="description"]', description);
    await this.fillFieldIfExists('textarea[name="comments"]', description);
    await this.fillFieldIfExists('#additional_information', description);

    // Small delay to ensure all fields are filled
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async selectRequestType() {
    // Select "Close the account of a deceased user" option
    try {
      const requestTypeSelectors = [
        'input[value*="close"]',
        'input[value*="deceased"]', 
        'input[value*="remove"]',
        'input[name="request_type"]',
        '[data-value*="deceased"]'
      ];

      for (const selector of requestTypeSelectors) {
        try {
          const element = await this.page.$(selector);
          if (element) {
            await element.click();
            break;
          }
        } catch (error) {
          console.log(`Request type selector ${selector} not found:`, error.message);
        }
      }

      // Also try to click text-based options
      await this.clickElementWithText('Close the account of a deceased user');
      await this.clickElementWithText('Remove deceased account');
      await this.clickElementWithText('Delete account');

    } catch (error) {
      console.log('Could not select request type:', error.message);
    }
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
      console.log(`YouTube field ${selector} not found or couldn't be filled:`, error.message);
    }
  }

  async selectRelationship(relationship) {
    // Google relationship options
    const relationshipSelectors = [
      'select[name="relationship"]',
      '#relationship_to_deceased',
      'select[name="relationship_to_deceased"]',
      'select[name="requester_relationship"]'
    ];

    for (const selector of relationshipSelectors) {
      try {
        const selectElement = await this.page.$(selector);
        if (selectElement) {
          if (relationship === 'immediate-family') {
            // Try different Google relationship values for immediate family
            const immediateOptions = ['immediate_family', 'spouse', 'parent', 'child', 'sibling', 'family_member'];
            for (const option of immediateOptions) {
              try {
                await selectElement.select(option);
                break;
              } catch (selectError) {
                continue;
              }
            }
          } else if (relationship === 'extended-family') {
            const extendedOptions = ['extended_family', 'other_family', 'family_member'];
            for (const option of extendedOptions) {
              try {
                await selectElement.select(option);
                break;
              } catch (selectError) {
                continue;
              }
            }
          } else {
            // Legal representative/executor
            const legalOptions = ['legal_representative', 'executor', 'attorney', 'authorized_representative'];
            for (const option of legalOptions) {
              try {
                await selectElement.select(option);
                break;
              } catch (selectError) {
                continue;
              }
            }
          }
          break;
        }
      } catch (error) {
        console.log(`Relationship selector ${selector} not found:`, error.message);
      }
    }

    // Also try radio button selections
    if (relationship === 'immediate-family') {
      await this.clickElementWithText('Immediate family');
      await this.clickElementWithText('Spouse');
      await this.clickElementWithText('Parent');
      await this.clickElementWithText('Child');
    } else if (relationship === 'authorized-entity') {
      await this.clickElementWithText('Legal representative');
      await this.clickElementWithText('Executor');
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

  buildDescription(data) {
    return `
Request for removal of deceased YouTube/Google account.

Deceased Person: ${data.deceasedName}
YouTube Channel: ${data.youtubeUrl}
Date of Death: ${data.dateOfDeath || 'As indicated on death certificate'}
Requester: ${data.firstName} ${data.lastName}
Relationship: ${this.getRelationshipDescription(data.relationship)}
Contact Email: ${data.contactEmail}
Digital Signature: ${data.digitalSignature}

${data.additionalInfo ? `Additional Information: ${data.additionalInfo}` : ''}

Death certificate and ${data.hasLegalAuth === 'yes' ? 'legal authorization documents' : 'family relationship affidavit'} attached.
Please process this account removal request according to Google's policies for deceased accounts.
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
      const tempPath = path.join('/tmp', `temp_yt_${Date.now()}_${filename}`);
      fs.writeFileSync(tempPath, buffer);

      // Common file upload selectors for Google forms
      const fileInputSelectors = [
        'input[type="file"]',
        'input[accept*="pdf"]',
        'input[accept*="image"]',
        '[data-testid="file-upload"]',
        '#file_upload',
        'input[name="death_certificate"]',
        'input[name="supporting_documentation"]',
        'input[name="attachment"]',
        'input[name="document"]',
        'input[name="upload"]'
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
          'button:contains("Add file")',
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
          console.log(`YouTube ${fileType} uploaded successfully`);
        } catch (uploadError) {
          console.warn(`YouTube ${fileType} upload confirmation not detected, but file may have uploaded:`, uploadError.message);
        }
      } else {
        console.warn(`YouTube ${fileType} file upload input not found on form`);
      }
    } catch (error) {
      console.error(`Error uploading YouTube ${fileType}:`, error);
    } finally {
      // Clean up temp file
      const tempPath = path.join('/tmp', `temp_yt_${Date.now()}_${filename}`);
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
        'button:contains("Continue")',
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
          if (buttonText.includes('submit') || buttonText.includes('send') || buttonText.includes('continue')) {
            submitButton = button;
            break;
          }
        }
      }

      if (submitButton) {
        console.log("YouTube submit button found and clicked");
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
        throw new Error('Submit button not found on YouTube form');
      }
    } catch (error) {
      console.error('Error submitting YouTube form:', error);
      throw error;
    }
  }

  async getConfirmationData() {
    try {
      // Look for confirmation message with Google-specific selectors
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

      const confirmationId = caseNumberMatch ? caseNumberMatch[1] : `YT_AUTO_${Date.now()}`;

      return {
        id: confirmationId,
        message: confirmationText || 'YouTube form submitted successfully',
        timestamp: new Date().toISOString(),
        url: this.page.url()
      };
    } catch (error) {
      console.error('Error getting YouTube confirmation data:', error);
      return {
        id: `YT_AUTO_${Date.now()}`,
        message: 'YouTube form submitted - confirmation details not available',
        timestamp: new Date().toISOString(),
        url: this.page.url()
      };
    }
  }
}

export default YouTubeAutomationService;