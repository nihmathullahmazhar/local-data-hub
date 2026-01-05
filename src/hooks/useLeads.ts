import { useState, useEffect, useCallback } from 'react';
import { Lead, Activity, LeadStatus } from '@/types/lead';
import { storage } from '@/lib/storage';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadedLeads = storage.getLeads();
    const loadedActivities = storage.getActivities();
    setLeads(loadedLeads);
    setActivities(loadedActivities);
    setIsLoading(false);
  }, []);

  // Save leads whenever they change
  useEffect(() => {
    if (!isLoading) {
      storage.saveLeads(leads);
      storage.syncToGoogleSheet(leads);
    }
  }, [leads, isLoading]);

  // Save activities whenever they change
  useEffect(() => {
    if (!isLoading) {
      storage.saveActivities(activities);
    }
  }, [activities, isLoading]);

  // Log activity
  const logActivity = useCallback((
    action: string, 
    details: string, 
    icon: string = 'circle', 
    color: string = 'text-muted-foreground'
  ) => {
    const newActivity: Activity = {
      action,
      details,
      icon,
      color,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => {
      const updated = [newActivity, ...prev];
      return updated.slice(0, 50); // Keep last 50
    });
  }, []);

  // Generate unique ID
  const generateId = useCallback(() => {
    return Date.now() + Math.floor(Math.random() * 1000);
  }, []);

  // Add lead
  const addLead = useCallback((leadData: Omit<Lead, 'id'>) => {
    const newLead: Lead = {
      ...leadData,
      id: generateId(),
    };
    setLeads(prev => [...prev, newLead]);
    logActivity('Lead Added', `"${newLead.businessName}" added to pipeline`, 'plus-circle', 'text-emerald-400');
    return newLead;
  }, [generateId, logActivity]);

  // Update lead
  const updateLead = useCallback((id: number, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(lead => 
      lead.id === id ? { ...lead, ...updates } : lead
    ));
    const lead = leads.find(l => l.id === id);
    if (lead) {
      logActivity('Lead Updated', `"${lead.businessName}" updated`, 'pencil', 'text-blue-400');
    }
  }, [leads, logActivity]);

  // Delete lead
  const deleteLead = useCallback((id: number) => {
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (lead) {
      logActivity('Lead Deleted', `"${lead.businessName}" removed from system`, 'trash-2', 'text-red-400');
    }
  }, [leads, logActivity]);

  // Update lead status
  const updateLeadStatus = useCallback((id: number, status: LeadStatus) => {
    const lead = leads.find(l => l.id === id);
    if (lead && lead.leadStatus !== status) {
      const oldStatus = lead.leadStatus;
      setLeads(prev => prev.map(l => 
        l.id === id ? { ...l, leadStatus: status } : l
      ));
      logActivity('Status Changed', `"${lead.businessName}" moved from ${oldStatus} to ${status}`, 'arrow-right-circle', 'text-blue-400');
    }
  }, [leads, logActivity]);

  // Toggle payment
  const togglePayment = useCallback((id: number, field: 'advancePaid' | 'balancePaid') => {
    const lead = leads.find(l => l.id === id);
    if (lead) {
      const newValue = !lead[field];
      setLeads(prev => prev.map(l => 
        l.id === id ? { ...l, [field]: newValue } : l
      ));
      const type = field === 'advancePaid' ? 'Advance' : 'Balance';
      const msg = newValue ? `${type} marked as Paid` : `${type} marked as Unpaid`;
      logActivity('Payment Update', `${msg} for "${lead.businessName}"`, 'dollar-sign', newValue ? 'text-emerald-400' : 'text-muted-foreground');
    }
  }, [leads, logActivity]);

  // Toggle project completion
  const toggleCompletion = useCallback((id: number): boolean => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return false;

    if (!lead.projectCompleted && !lead.balancePaid) {
      return false; // Cannot complete without balance paid
    }

    const newValue = !lead.projectCompleted;
    setLeads(prev => prev.map(l => 
      l.id === id ? { ...l, projectCompleted: newValue } : l
    ));
    
    if (newValue) {
      logActivity('Project Completed', `"${lead.businessName}" marked as completed`, 'check-circle', 'text-emerald-400');
    }
    return true;
  }, [leads, logActivity]);

  // Toggle pipeline field
  const togglePipelineField = useCallback((id: number, field: keyof Lead, value: boolean) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    const updates: Partial<Lead> = { [field]: value };

    // Auto follow-up logic: if Contacted is checked, set follow-up to +3 days
    if (field === 'contacted' && value) {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      updates.nextFollowUp = d.toISOString().split('T')[0];
    }

    setLeads(prev => prev.map(l => 
      l.id === id ? { ...l, ...updates } : l
    ));
  }, [leads]);

  // Get filtered leads
  const getFilteredLeads = useCallback((statusFilter: string, searchText: string) => {
    let filtered = [...leads];

    if (statusFilter) {
      filtered = filtered.filter(l => l.leadStatus === statusFilter);
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(l =>
        (l.businessName && l.businessName.toLowerCase().includes(search)) ||
        (l.clientName && l.clientName.toLowerCase().includes(search))
      );
    }

    // Sort: Unfinished first, then by date (newest first)
    filtered.sort((a, b) => {
      if (a.projectCompleted === b.projectCompleted) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.projectCompleted ? 1 : -1;
    });

    return filtered;
  }, [leads]);

  // Stats calculations
  const stats = {
    totalLeads: leads.filter(l => l.leadStatus !== 'Closed-Lost').length,
    contactedCount: leads.filter(l => l.contacted).length,
    interestedCount: leads.filter(l => l.interested).length,
    closedWonCount: leads.filter(l => l.leadStatus === 'Closed-Won').length,
    completedProjects: leads.filter(l => l.projectCompleted).length,
    totalRevenue: leads.reduce((sum, l) => sum + (l.finalValue || 0), 0),
    pendingBalance: leads.reduce((sum, l) => {
      if (!l.balancePaid && l.finalValue) {
        const adv = l.advanceAmount || 0;
        return sum + (l.finalValue - adv);
      }
      return sum;
    }, 0),
  };

  // Pipeline chart data
  const pipelineData = {
    labels: ['New', 'Contacted', 'Demo Sent', 'Negotiating', 'Closed-Won', 'Closed-Lost'],
    data: ['New', 'Contacted', 'Demo Sent', 'Negotiating', 'Closed-Won', 'Closed-Lost'].map(
      status => leads.filter(l => l.leadStatus === status).length
    ),
  };

  // Clear all data
  const clearAllData = useCallback(() => {
    setLeads([]);
    setActivities([]);
    storage.clearAll();
  }, []);

  return {
    leads,
    activities,
    isLoading,
    stats,
    pipelineData,
    addLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    togglePayment,
    toggleCompletion,
    togglePipelineField,
    getFilteredLeads,
    clearAllData,
    logActivity,
  };
}
