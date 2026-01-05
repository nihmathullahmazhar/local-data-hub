export interface Lead {
  id: number;
  date: string;
  businessName: string;
  clientName: string;
  country: string;
  platform: string;
  industry: string;
  contactInfo: string;
  
  // Sales Pipeline
  leadStatus: LeadStatus;
  contacted: boolean;
  replied: boolean;
  demoSent: boolean;
  interested: boolean;
  nextFollowUp: string;
  
  // Project Details
  packageType: string;
  projectType: string;
  projectScope: string;
  
  // Pricing
  currency: string;
  exchangeRate: number;
  priceQuoted: number;
  finalValue: number;
  advanceScheme: string;
  advanceAmount: number;
  balanceAmount: number;
  paymentMethod: string;
  
  // Payments
  advancePaid: boolean;
  advanceDate: string;
  advanceMethod: string;
  advanceProof: boolean;
  balancePaid: boolean;
  balanceDate: string;
  balanceMethod: string;
  balanceProof: boolean;
  
  // Delivery
  expectedDelivery: string;
  actualDelivery: string;
  projectCompleted: boolean;
  
  // Admin
  freeDomain: boolean;
  domainName: string;
  domainProvider: string;
  hostingProvider: string;
  renewalAgreement: boolean;
  domainRenewal: string;
  hostingRenewal: string;
  repeatClient: boolean;
  agreementLink: string;
  agreementFileName: string;
  
  // Notes
  notes: string;
}

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Replied'
  | 'Demo Sent'
  | 'Negotiating'
  | 'Closed-Won'
  | 'Closed-Lost'
  | 'Follow-up Later';

export interface Activity {
  action: string;
  details: string;
  icon: string;
  color: string;
  timestamp: string;
}

export interface Reminder {
  type: 'followup' | 'domain' | 'hosting' | 'balance';
  lead: Lead;
  date: string;
  daysOverdue?: number;
  daysUntil?: number;
  priority: 'high' | 'medium' | 'normal';
}
