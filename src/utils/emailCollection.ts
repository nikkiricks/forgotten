// Simple email collection for demo purposes
export interface EmailSignup {
  email: string;
  timestamp: number;
  source: string; // 'platform-notifications', 'coming-soon-overlay', etc.
}

const STORAGE_KEY = 'forgotten-email-signups';

export const saveEmailSignup = (email: string, source: string = 'unknown'): void => {
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
};

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