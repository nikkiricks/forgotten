// Production email collection services

interface EmailSubmission {
  email: string;
  source: string;
  timestamp: number;
}

// Option 1: Netlify Forms (FREE - Recommended)
export const submitToNetlifyForms = async (email: string, source: string): Promise<boolean> => {
  try {
    const formData = new FormData();
    formData.append('form-name', 'email-signups');
    formData.append('email', email);
    formData.append('source', source);
    formData.append('timestamp', new Date().toISOString());

    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as any).toString()
    });

    return response.ok;
  } catch (error) {
    console.error('Netlify form submission failed:', error);
    return false;
  }
};

// Option 2: Formspree (FREE tier: 50 submissions/month)
export const submitToFormspree = async (email: string, source: string): Promise<boolean> => {
  try {
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        source,
        timestamp: new Date().toISOString()
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Formspree submission failed:', error);
    return false;
  }
};

// Option 3: Airtable (FREE tier: 1,000 records)
export const submitToAirtable = async (email: string, source: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://api.airtable.com/v0/YOUR_BASE_ID/Email%20Signups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Email: email,
          Source: source,
          Timestamp: new Date().toISOString()
        }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Airtable submission failed:', error);
    return false;
  }
};

// Option 4: Google Sheets (FREE)
export const submitToGoogleSheets = async (email: string, source: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        source,
        timestamp: new Date().toISOString()
      })
    });

    // Note: no-cors mode means we can't check response.ok
    return true;
  } catch (error) {
    console.error('Google Sheets submission failed:', error);
    return false;
  }
};

// Fallback chain - tries multiple services
export const submitEmailSignup = async (email: string, source: string): Promise<boolean> => {
  // Always save locally as backup
  const { saveEmailSignup } = await import('../utils/emailCollection');
  saveEmailSignup(email, source);

  // Try production services in order of preference
  const services = [
    submitToNetlifyForms,
    submitToFormspree,
    submitToAirtable,
    submitToGoogleSheets
  ];

  for (const service of services) {
    try {
      const success = await service(email, source);
      if (success) {
        console.log(`✅ Email submitted successfully via ${service.name}`);
        return true;
      }
    } catch (error) {
      console.warn(`Failed ${service.name}, trying next service...`);
    }
  }

  console.warn('All services failed, email saved locally only');
  return false;
};