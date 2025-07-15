// Simple email collection for demo purposes
export interface EmailSignup {
  email: string;
  timestamp: number;
  source: string; // 'platform-notifications', 'coming-soon-overlay', etc.
}

const STORAGE_KEY = 'forgotten-email-signups';

// Production-ready email submission with fallback to localStorage
export const submitEmailSignup = async (email: string, source: string = 'unknown'): Promise<boolean> => {
  // Try Netlify Forms first (production)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
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

      if (response.ok) {
        console.log('✅ Email submitted to Netlify Forms');
        // Still save locally as backup
        saveEmailSignupLocal(email, source);
        return true;
      }
    } catch (error) {
      console.warn('Netlify Forms failed, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage (development or if production fails)
  saveEmailSignupLocal(email, source);
  return true;
};

export const saveEmailSignupLocal = (email: string, source: string = 'unknown'): void => {
  const existingSignups = getEmailSignups();
  
  // Check if email already exists
  const exists = existingSignups.some(signup => signup.email === email && signup.source === source);
  if (exists) {
    return; // Don't add duplicates
  }

  const newSignup: EmailSignup = {
    email,
    timestamp: Date.now(),
    source
  };

  const updatedSignups = [...existingSignups, newSignup];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSignups));
  
  // Also log for demo purposes
  console.log(`📧 Email collected: ${email} (${source})`);
  console.log(`📊 Total signups: ${updatedSignups.length}`);
  console.log('📋 All stored emails:', updatedSignups);
  console.log('💾 LocalStorage key:', STORAGE_KEY);
};

// Legacy function for backward compatibility
export const saveEmailSignup = saveEmailSignupLocal;

export const getEmailSignups = (): EmailSignup[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const exportEmailSignups = (): string => {
  const signups = getEmailSignups();
  const csv = [
    'Email,Source,Date',
    ...signups.map(signup => 
      `${signup.email},${signup.source},${new Date(signup.timestamp).toISOString()}`
    )
  ].join('\n');
  
  return csv;
};

export const downloadEmailSignups = (): void => {
  const csv = exportEmailSignups();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `forgotten-email-signups-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};