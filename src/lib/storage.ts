import { Lead, Activity } from '@/types/lead';

const LEADS_KEY = 'crm_leads';
const ACTIVITIES_KEY = 'crm_activities';
const API_URL_KEY = 'crm_api_url';

// Google Sheets sync URL - user can configure this
const GOOGLE_SCRIPT_URL = "";

// Get configured API URL
const getApiUrl = (): string => {
  try {
    return localStorage.getItem(API_URL_KEY) || '';
  } catch {
    return '';
  }
};

export const storage = {
  // API URL configuration
  getApiUrl,
  setApiUrl: (url: string): void => {
    localStorage.setItem(API_URL_KEY, url);
  },

  // Leads - with MySQL fallback to localStorage
  getLeads: async (): Promise<Lead[]> => {
    const apiUrl = getApiUrl();
    
    // Try MySQL first if configured
    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/fetch_leads.php`);
        if (response.ok) {
          const data = await response.json();
          // Cache in localStorage as backup
          localStorage.setItem(LEADS_KEY, JSON.stringify(data));
          return data;
        }
      } catch (error) {
        console.error('MySQL fetch failed, using localStorage:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const data = localStorage.getItem(LEADS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getLeadsSync: (): Lead[] => {
    try {
      const data = localStorage.getItem(LEADS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLeads: async (leads: Lead[]): Promise<void> => {
    // Always save to localStorage
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    
    // Sync to Google Sheets if configured
    if (GOOGLE_SCRIPT_URL) {
      storage.syncToGoogleSheet(leads);
    }
  },

  saveLead: async (lead: Omit<Lead, 'id'> | Lead): Promise<{ success: boolean; id?: number; error?: string }> => {
    const apiUrl = getApiUrl();
    
    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/save_lead.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Trigger sync to Google Sheets
            storage.syncToGoogleSheetViaAPI();
            return { success: true, id: result.id };
          }
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('MySQL save failed:', error);
        return { success: false, error: 'Connection failed' };
      }
    }
    
    // Fallback: save to localStorage
    const leads = storage.getLeadsSync();
    if ('id' in lead && lead.id) {
      // Update existing
      const idx = leads.findIndex(l => l.id === lead.id);
      if (idx !== -1) {
        leads[idx] = lead as Lead;
      }
    } else {
      // Add new
      const newId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
      leads.push({ ...lead, id: newId } as Lead);
    }
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    return { success: true };
  },

  deleteLead: async (id: number): Promise<{ success: boolean; error?: string }> => {
    const apiUrl = getApiUrl();
    
    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/delete_lead.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            storage.syncToGoogleSheetViaAPI();
            return { success: true };
          }
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('MySQL delete failed:', error);
        return { success: false, error: 'Connection failed' };
      }
    }
    
    // Fallback: delete from localStorage
    const leads = storage.getLeadsSync().filter(l => l.id !== id);
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
    return { success: true };
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

  // Google Sheets Sync via client
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

  // Sync via PHP backend
  syncToGoogleSheetViaAPI: async (): Promise<boolean> => {
    const apiUrl = getApiUrl();
    if (!apiUrl) return false;

    try {
      const response = await fetch(`${apiUrl}/sync_sheets.php`, {
        method: 'POST',
      });
      const result = await response.json();
      return result.success;
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
    a.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  // Export to CSV
  exportToCSV: (leads: Lead[]): void => {
    if (leads.length === 0) return;
    
    const headers = [
      'Date', 'Business Name', 'Client Name', 'Status', 
      'Currency', 'Final Value', 'Amount LKR', 'Balance Paid', 'Agreement Link'
    ];
    
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        lead.date,
        `"${lead.businessName}"`,
        `"${lead.clientName}"`,
        lead.leadStatus,
        lead.currency,
        lead.finalValue,
        lead.amountInLKR,
        lead.balancePaid ? 'Yes' : 'No',
        `"${lead.agreementLink || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crm-export-${new Date().toISOString().split('T')[0]}.csv`;
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