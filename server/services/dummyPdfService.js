import puppeteer from 'puppeteer';

class DummyPdfService {
  /**
   * Generate a dummy legal authorization PDF when families don't have formal legal documents
   * @param {Object} submissionData - The form submission data
   * @returns {Buffer} PDF buffer
   */
  async generateDummyLegalAuthPdf(submissionData) {
    let browser = null;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Create HTML content for the dummy legal authorization document
      const htmlContent = this.generateLegalAuthHtml(submissionData);
      
      await page.setContent(htmlContent);
      
      // Generate PDF with proper formatting
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in'
        }
      });
      
      return pdfBuffer;
      
    } catch (error) {
      console.error('Error generating dummy legal auth PDF:', error);
      throw new Error('Failed to generate legal authorization document');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate HTML content for the legal authorization document
   * @param {Object} data - Submission data
   * @returns {string} HTML content
   */
  generateLegalAuthHtml(data) {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const platform = data.platform || 'linkedin';
    const platformName = platform === 'instagram' ? 'Instagram' : platform === 'facebook' ? 'Facebook' : platform === 'youtube' ? 'YouTube' : 'LinkedIn';
    const profileUrl = data.linkedinUrl || data.instagramUrl || data.facebookUrl || data.youtubeUrl || data.profileUrl;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Legal Authorization Statement</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .title {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .content {
            margin: 30px 0;
        }
        .field {
            margin: 15px 0;
        }
        .label {
            font-weight: bold;
            display: inline-block;
            width: 200px;
        }
        .value {
            border-bottom: 1px solid #333;
            display: inline-block;
            min-width: 300px;
            padding-bottom: 2px;
        }
        .statement {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #333;
            background-color: #f9f9f9;
        }
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 45%;
            border-top: 1px solid #333;
            padding-top: 10px;
            text-align: center;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 20px;
        }
        .notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Affidavit of Family Relationship</div>
        <div style="margin-top: 10px; font-size: 14px;">
            For Deceased ${platformName} Account Management
        </div>
    </div>

    <div class="content">
        <div class="field">
            <span class="label">Requester Name:</span>
            <span class="value">${data.firstName} ${data.lastName}</span>
        </div>
        
        <div class="field">
            <span class="label">Requester Email:</span>
            <span class="value">${data.contactEmail}</span>
        </div>
        
        <div class="field">
            <span class="label">Deceased Person:</span>
            <span class="value">${data.deceasedName}</span>
        </div>
        
        <div class="field">
            <span class="label">${platformName} Profile:</span>
            <span class="value">${profileUrl}</span>
        </div>
        
        <div class="field">
            <span class="label">Relationship:</span>
            <span class="value">${data.relationship === 'immediate-family' ? 'Immediate Family Member' : 'Authorized Entity'}</span>
        </div>
        
        <div class="field">
            <span class="label">Date of Death:</span>
            <span class="value">${data.dateOfDeath || 'As indicated on death certificate'}</span>
        </div>
        
        <div class="field">
            <span class="label">Date of Affidavit:</span>
            <span class="value">${currentDate}</span>
        </div>
    </div>

    <div class="statement">
        <p><strong>AFFIDAVIT STATEMENT:</strong></p>
        <p>I, <strong>${data.firstName} ${data.lastName}</strong>, hereby affirm under penalty of perjury that:</p>
        <ol>
            <li>I am the ${data.relationship === 'immediate-family' ? 'immediate family member' : 'authorized representative'} of the deceased person named above.</li>
            <li>The deceased person named above has passed away, as evidenced by the death certificate provided with this request.</li>
            <li>I am requesting the removal/memorialization of the deceased person's ${platformName} account as part of managing their digital legacy.</li>
            <li>I understand that providing false information in this affidavit may result in legal consequences.</li>
            <li>I acknowledge that while I do not possess formal court-appointed legal authorization documents at this time, I am acting in good faith as a family member to manage the deceased's digital accounts.</li>
        </ol>
    </div>

    <div class="notice">
        <strong>Notice:</strong> This affidavit is provided in lieu of formal legal authorization documents (Letters of Administration, Letters Testamentary, or court orders). The requester acknowledges that ${platformName} may require additional verification or formal legal documentation to process this request.
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div style="margin-bottom: 30px; height: 40px;"></div>
            <div>Signature</div>
            <div style="margin-top: 10px; font-size: 12px;">${data.digitalSignature}</div>
        </div>
        <div class="signature-box">
            <div style="margin-bottom: 30px; height: 40px;"></div>
            <div>Date</div>
            <div style="margin-top: 10px; font-size: 12px;">${currentDate}</div>
        </div>
    </div>

    <div class="footer">
        <p>This document was generated automatically to accompany a ${platformName} deceased account removal request.</p>
        <p>Generated on ${currentDate}</p>
    </div>
</body>
</html>`;
  }
}

export default DummyPdfService;