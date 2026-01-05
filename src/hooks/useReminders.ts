import { useMemo } from 'react';
import { Lead, Reminder } from '@/types/lead';

export function useReminders(leads: Lead[]) {
  const reminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result: Reminder[] = [];
    
    leads.forEach(lead => {
      // Skip completed projects
      if (lead.projectCompleted) return;
      
      // 1. FOLLOW-UP REMINDERS (Overdue or Due Today)
      if (lead.nextFollowUp && lead.leadStatus !== 'Closed-Won' && lead.leadStatus !== 'Closed-Lost') {
        const followUpDate = new Date(lead.nextFollowUp);
        followUpDate.setHours(0, 0, 0, 0);
        
        if (followUpDate <= today) {
          const daysOverdue = Math.floor((today.getTime() - followUpDate.getTime()) / (1000 * 60 * 60 * 24));
          result.push({
            type: 'followup',
            lead,
            date: lead.nextFollowUp,
            daysOverdue,
            priority: daysOverdue > 7 ? 'high' : daysOverdue > 3 ? 'medium' : 'normal',
          });
        }
      }
      
      // 2. DOMAIN RENEWAL REMINDERS (3 months before expiry)
      if (lead.domainRenewal) {
        const renewalDate = new Date(lead.domainRenewal);
        renewalDate.setHours(0, 0, 0, 0);
        
        const threeMonthsBefore = new Date(renewalDate);
        threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);
        
        if (today >= threeMonthsBefore && today <= renewalDate) {
          const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          result.push({
            type: 'domain',
            lead,
            date: lead.domainRenewal,
            daysUntil,
            priority: daysUntil <= 14 ? 'high' : daysUntil <= 30 ? 'medium' : 'normal',
          });
        }
      }
      
      // 3. HOSTING RENEWAL REMINDERS (3 months before expiry)
      if (lead.hostingRenewal) {
        const renewalDate = new Date(lead.hostingRenewal);
        renewalDate.setHours(0, 0, 0, 0);
        
        const threeMonthsBefore = new Date(renewalDate);
        threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);
        
        if (today >= threeMonthsBefore && today <= renewalDate) {
          const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          result.push({
            type: 'hosting',
            lead,
            date: lead.hostingRenewal,
            daysUntil,
            priority: daysUntil <= 14 ? 'high' : daysUntil <= 30 ? 'medium' : 'normal',
          });
        }
      }
      
      // 4. UNPAID BALANCE REMINDERS (for Closed-Won deals)
      if (lead.leadStatus === 'Closed-Won' && !lead.balancePaid) {
        const balanceAmount = lead.balanceAmount || (lead.finalValue - (lead.advanceAmount || 0));
        if (balanceAmount > 0) {
          result.push({
            type: 'balance',
            lead,
            date: lead.date,
            priority: 'medium',
          });
        }
      }
    });
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, normal: 2 };
    result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    return result;
  }, [leads]);

  return { reminders, count: reminders.length };
}
