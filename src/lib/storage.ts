import { Lead, Activity } from '@/types/lead';

const LEADS_KEY = 'gododal_leads';
const ACTIVITIES_KEY = 'gododal_activities';

// Google Sheets sync URL - user can configure this
const GOOGLE_SCRIPT_URL = "";

export const storage = {
  // Leads
  getLeads: (): Lead[] => {
    try {
      const data = localStorage.getItem(LEADS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLeads: (leads: Lead[]): void => {
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  },

  // Activities
  getActivities: (): Activity[] => {
    try {
      const data = localStorage.getItem(ACTIVITIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveActivities: (activities: Activity[]): void => {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  },

  // Google Sheets Sync
  syncToGoogleSheet: async (leads: Lead[]): Promise<boolean> => {
    if (!GOOGLE_SCRIPT_URL) return false;

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(leads),
      });
      console.log("Synced to Google Sheet");
      return true;
    } catch (error) {
      console.error("Sheet Sync Error:", error);
      return false;
    }
  },

  // Export to JSON
  exportToJSON: (leads: Lead[]): void => {
    const dataStr = JSON.stringify(leads, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gododal-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Export to CSV
  exportToCSV: (leads: Lead[]): void => {
    if (leads.length === 0) return;
    
    const headers = [
      'Date', 'Business Name', 'Client Name', 'Status', 
      'Price Quoted', 'Final Value', 'Balance Paid', 'Agreement Link'
    ];
    
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.date,
        `"${lead.businessName}"`,
        `"${lead.clientName}"`,
        lead.leadStatus,
        lead.priceQuoted,
        lead.finalValue,
        lead.balancePaid ? 'Yes' : 'No',
        `"${lead.agreementLink || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gododal-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Import from JSON
  importFromJSON: (file: File): Promise<Lead[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const leads = JSON.parse(e.target?.result as string);
          resolve(leads);
        } catch {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  // Clear all data
  clearAll: (): void => {
    localStorage.removeItem(LEADS_KEY);
    localStorage.removeItem(ACTIVITIES_KEY);
  },
};
