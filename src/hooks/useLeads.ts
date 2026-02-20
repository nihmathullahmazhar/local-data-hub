import { useState, useEffect, useCallback } from 'react';
import { Lead, Activity, LeadStatus } from '@/types/lead';
import { storage } from '@/lib/storage';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedLeads = await storage.getLeads();
        const loadedActivities = storage.getActivities();
        setLeads(loadedLeads);
        setActivities(loadedActivities);
      } catch (error) {
        console.error('Failed to load data:', error);
        const loadedLeads = storage.getLeadsSync();
        const loadedActivities = storage.getActivities();
        setLeads(loadedLeads);
        setActivities(loadedActivities);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      storage.saveLeads(leads);
    }
  }, [leads, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      storage.saveActivities(activities);
    }
  }, [activities, isLoading]);

  const logActivity = useCallback((
    action: string, 
    details: string, 
    icon: string = 'circle', 
    color: string = 'text-muted-foreground'
  ) => {
    const newActivity: Activity = { action, details, icon, color, timestamp: new Date().toISOString() };
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  }, []);

  const generateId = useCallback(() => Date.now() + Math.floor(Math.random() * 1000), []);

  const addLead = useCallback(async (leadData: Omit<Lead, 'id'>) => {
    const newId = generateId();
    const newLead: Lead = { ...leadData, id: newId };
    const result = await storage.saveLead(newLead);
    if (result.success && result.id) newLead.id = result.id;
    setLeads(prev => [...prev, newLead]);
    logActivity('Lead Added', `"${newLead.businessName}" added to pipeline`, 'plus-circle', 'text-emerald-400');
    return newLead;
  }, [generateId, logActivity]);

  const updateLead = useCallback(async (id: number, updates: Partial<Lead>) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    const updatedLead = { ...lead, ...updates };
    await storage.saveLead(updatedLead);
    setLeads(prev => prev.map(l => l.id === id ? updatedLead : l));
    logActivity('Lead Updated', `"${lead.businessName}" updated`, 'pencil', 'text-blue-400');
  }, [leads, logActivity]);

  const deleteLead = useCallback(async (id: number) => {
    const lead = leads.find(l => l.id === id);
    await storage.deleteLead(id);
    setLeads(prev => prev.filter(l => l.id !== id));
    if (lead) logActivity('Lead Deleted', `"${lead.businessName}" removed from system`, 'trash-2', 'text-red-400');
  }, [leads, logActivity]);

  const updateLeadStatus = useCallback(async (id: number, status: LeadStatus) => {
    const lead = leads.find(l => l.id === id);
    if (lead && lead.leadStatus !== status) {
      const oldStatus = lead.leadStatus;
      const updatedLead = { ...lead, leadStatus: status };
      await storage.saveLead(updatedLead);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, leadStatus: status } : l));
      logActivity('Status Changed', `"${lead.businessName}" moved from ${oldStatus} to ${status}`, 'arrow-right-circle', 'text-blue-400');
    }
  }, [leads, logActivity]);

  const togglePayment = useCallback(async (id: number, field: 'advancePaid' | 'balancePaid') => {
    const lead = leads.find(l => l.id === id);
    if (lead) {
      const newValue = !lead[field];
      const updatedLead = { ...lead, [field]: newValue };
      await storage.saveLead(updatedLead);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, [field]: newValue } : l));
      const type = field === 'advancePaid' ? 'Advance' : 'Balance';
      logActivity('Payment Update', `${newValue ? `${type} marked as Paid` : `${type} marked as Unpaid`} for "${lead.businessName}"`, 'dollar-sign', newValue ? 'text-emerald-400' : 'text-muted-foreground');
    }
  }, [leads, logActivity]);

  const toggleCompletion = useCallback(async (id: number): Promise<boolean> => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return false;
    if (!lead.projectCompleted && !lead.balancePaid) return false;
    const newValue = !lead.projectCompleted;
    const updatedLead = { ...lead, projectCompleted: newValue };
    await storage.saveLead(updatedLead);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, projectCompleted: newValue } : l));
    if (newValue) logActivity('Project Completed', `"${lead.businessName}" marked as completed`, 'check-circle', 'text-emerald-400');
    return true;
  }, [leads, logActivity]);

  const togglePipelineField = useCallback(async (id: number, field: keyof Lead, value: boolean) => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    const updates: Partial<Lead> = { [field]: value };
    if (field === 'contacted' && value) {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      updates.nextFollowUp = d.toISOString().split('T')[0];
    }
    const updatedLead = { ...lead, ...updates };
    await storage.saveLead(updatedLead);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, [leads]);

  const refreshLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedLeads = await storage.getLeads();
      setLeads(loadedLeads);
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
    setIsLoading(false);
  }, []);

  // Sort: Closed-Lost → bottom, Completed → bottom, then newest first
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

    filtered.sort((a, b) => {
      // Closed-Lost goes to bottom
      const aLost = a.leadStatus === 'Closed-Lost' ? 1 : 0;
      const bLost = b.leadStatus === 'Closed-Lost' ? 1 : 0;
      if (aLost !== bLost) return aLost - bLost;

      // Completed goes to bottom
      const aCompleted = a.projectCompleted ? 1 : 0;
      const bCompleted = b.projectCompleted ? 1 : 0;
      if (aCompleted !== bCompleted) return aCompleted - bCompleted;

      // Closed-Won goes above lost but below active
      const aWon = a.leadStatus === 'Closed-Won' && !a.projectCompleted ? 1 : 0;
      const bWon = b.leadStatus === 'Closed-Won' && !b.projectCompleted ? 1 : 0;
      // Won stays in normal position, just sort by date
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return filtered;
  }, [leads]);

  // Stats - all in LKR
  const totalExpenses = leads.reduce((sum, l) => {
    return sum + (l.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  }, 0);

  const totalRevenue = leads
    .filter(l => l.leadStatus === 'Closed-Won')
    .reduce((sum, l) => sum + (l.amountInLKR || l.finalValue || 0), 0);

  const closedWonCount = leads.filter(l => l.leadStatus === 'Closed-Won').length;
  const closedLostCount = leads.filter(l => l.leadStatus === 'Closed-Lost').length;
  const totalDecided = closedWonCount + closedLostCount;

  const stats = {
    totalLeads: leads.filter(l => l.leadStatus !== 'Closed-Lost').length,
    contactedCount: leads.filter(l => l.contacted).length,
    interestedCount: leads.filter(l => l.interested).length,
    closedWonCount,
    closedLostCount,
    completedProjects: leads.filter(l => l.projectCompleted).length,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    pendingBalance: leads.reduce((sum, l) => {
      if (!l.balancePaid && l.finalValue && l.leadStatus === 'Closed-Won') {
        const adv = l.advanceAmount || 0;
        const exchangeRate = l.exchangeRate || 1;
        return sum + (l.currency === 'LKR' ? (l.finalValue - adv) : (l.finalValue - adv) * exchangeRate);
      }
      return sum;
    }, 0),
    conversionRate: totalDecided > 0 ? Math.round((closedWonCount / totalDecided) * 100) : 0,
  };

  const pipelineData = {
    labels: ['New', 'Contacted', 'Demo Sent', 'Negotiating', 'Closed-Won', 'Closed-Lost'],
    data: ['New', 'Contacted', 'Demo Sent', 'Negotiating', 'Closed-Won', 'Closed-Lost'].map(
      status => leads.filter(l => l.leadStatus === status).length
    ),
  };

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
    refreshLeads,
  };
}
