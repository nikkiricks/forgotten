import nodemailer from 'nodemailer';

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendConfirmationToFamily(requestData, automationResult) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: requestData.contactEmail,
      subject: `LinkedIn Account Removal Request Submitted - ${requestData.deceasedName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Request Confirmation</h2>
          
          <p>Dear ${requestData.digitalSignature},</p>
          
          <p>We have successfully submitted your request to remove the LinkedIn profile for <strong>${requestData.deceasedName}</strong>.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Request Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Confirmation ID:</strong> ${automationResult.confirmationId}</li>
              <li><strong>LinkedIn Profile:</strong> <a href="${requestData.linkedinUrl}">${requestData.linkedinUrl}</a></li>
              <li><strong>Submission Method:</strong> ${automationResult.method === 'email_fallback' ? 'Direct Email to LinkedIn' : 'Automated Form Submission'}</li>
              <li><strong>Estimated Processing Time:</strong> ${automationResult.estimatedProcessingTime}</li>
            </ul>
          </div>
          
          <h3>What Happens Next:</h3>
          <ol>
            <li>LinkedIn will review your request and the death certificate</li>
            <li>They may contact you for additional verification if needed</li>
            <li>Once approved, the profile will be removed or memorialized</li>
            <li>We'll send you updates as we receive them</li>
          </ol>
          
          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Important:</strong> Please save this confirmation ID: <code>${automationResult.confirmationId}</code></p>
            <p style="margin: 10px 0 0 0;">You can reference this ID if you need to follow up with LinkedIn directly.</p>
          </div>
          
          <p>If you have any questions or concerns, please reply to this email. We're here to help during this difficult time.</p>
          
          <p>With sympathy,<br>
          The Forgotten Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">
            This is an automated message from the Forgotten digital legacy management service.
          </p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendStatusUpdate(requestData, status, message) {
    const statusMessages = {
      'processing': 'Your request is being processed by LinkedIn',
      'completed': 'The LinkedIn profile has been successfully removed',
      'failed': 'There was an issue processing your request',
      'needs_info': 'LinkedIn requires additional information'
    };

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: requestData.contactEmail,
      subject: `Update: LinkedIn Removal Request - ${requestData.deceasedName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Request Update</h2>
          
          <p>Dear ${requestData.digitalSignature || 'Family Member'},</p>
          
          <div style="background: ${status === 'completed' ? '#d4edda' : status === 'failed' ? '#f8d7da' : '#fff3cd'}; 
                      padding: 20px; border-radius: 8px; margin: 20px 0;
                      border-left: 4px solid ${status === 'completed' ? '#28a745' : status === 'failed' ? '#dc3545' : '#ffc107'};">
            <h3 style="margin-top: 0;">Status: ${status.toUpperCase()}</h3>
            <p style="margin-bottom: 0;">${statusMessages[status] || message}</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Request ID:</strong> ${requestData.confirmationId}</p>
            <p style="margin: 10px 0 0 0;"><strong>Profile:</strong> ${requestData.linkedinUrl}</p>
          </div>
          
          ${message ? `<p><strong>Additional Details:</strong><br>${message}</p>` : ''}
          
          ${status === 'completed' ? 
            '<p>The LinkedIn profile has been successfully removed. Thank you for using our service.</p>' :
            status === 'failed' ?
            '<p>We apologize for the inconvenience. Please reply to this email and we will help resolve the issue.</p>' :
            '<p>We will continue to monitor your request and send updates as they become available.</p>'
          }
          
          <p>If you have any questions, please reply to this email.</p>
          
          <p>With sympathy,<br>
          The Forgotten Team</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendAdminNotification(requestData, automationResult) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.RECIPIENT_EMAIL,
      subject: `[ADMIN] New Automated LinkedIn Request - ${requestData.deceasedName}`,
      html: `
        <h2>New Automated LinkedIn Removal Request</h2>
        <p><strong>Status:</strong> ${automationResult.success ? 'Successfully Submitted' : 'Failed - Manual Review Required'}</p>
        
        <h3>Request Details:</h3>
        <ul>
          <li><strong>Confirmation ID:</strong> ${automationResult.confirmationId}</li>
          <li><strong>Method:</strong> ${automationResult.method}</li>
          <li><strong>Deceased:</strong> ${requestData.deceasedName}</li>
          <li><strong>LinkedIn:</strong> <a href="${requestData.linkedinUrl}">${requestData.linkedinUrl}</a></li>
          <li><strong>Contact:</strong> ${requestData.contactEmail}</li>
          <li><strong>Relationship:</strong> ${requestData.relationship}</li>
        </ul>
        
        <h3>Automation Result:</h3>
        <p>${automationResult.message}</p>
        
        ${!automationResult.success ? '<p><strong>Action Required:</strong> Manual processing needed</p>' : ''}
        
        <p><em>Family has been notified of submission status.</em></p>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export default NotificationService;