export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

export interface ExpenseItem {
  id: string;
  category: 'hosting' | 'domain' | 'tools' | 'freelancer' | 'marketing' | 'other';
  name: string;
  amount: number;
  date: string;
}

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
  services: ServiceItem[];
  
  // Pricing
  currency: string;
  exchangeRate: number;
  finalValue: number;
  advanceScheme: string;
  advanceAmount: number;
  balanceAmount: number;
  paymentMethod: string;
  amountInLKR: number;
  
  // Payments
  advancePaid: boolean;
  advanceDate: string;
  advanceMethod: string;
  advanceProof: boolean;
  advanceDateReceived: string;
  balancePaid: boolean;
  balanceDate: string;
  balanceMethod: string;
  balanceProof: boolean;
  balanceDateReceived: string;
  
  // Expenses
  expenses: ExpenseItem[];
  
  // Delivery
  expectedDelivery: string;
  actualDelivery: string;
  projectCompleted: boolean;
  revisionsIncluded: number;
  revisionNotes: string;
  deliveryFeatures: DeliveryFeature[];
  
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

export interface DeliveryFeature {
  id: string;
  feature: string;
  included: boolean;
  price: number;
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

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export const EXPENSE_CATEGORIES = [
  { value: 'hosting', label: 'Hosting', icon: '🖥️' },
  { value: 'domain', label: 'Domain', icon: '🌐' },
  { value: 'tools', label: 'Tools/Software', icon: '🔧' },
  { value: 'freelancer', label: 'Freelancer', icon: '👤' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const;
