import { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@/types/lead';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (lead: Omit<Lead, 'id'>) => void;
  onUpdate: (id: number, updates: Partial<Lead>) => void;
  editingLead: Lead | null;
}

const COUNTRIES = ['Sri Lanka', 'US', 'UK', 'Canada', 'Australia', 'Gulf', 'India', 'Other'];
const PLATFORMS = ['Google Maps', 'WhatsApp', 'Facebook', 'Instagram', 'Fiverr', 'Referral', 'Walk-in', 'LinkedIn', 'Website', 'Other'];
const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Replied', 'Demo Sent', 'Negotiating', 'Closed-Won', 'Closed-Lost', 'Follow-up Later'];
const PACKAGES = ['Starter', 'Business', 'Premium', 'Custom'];
const PROJECT_TYPES = ['Landing Page', 'Multi-Page', 'Redesign', 'Custom'];
const CURRENCIES = ['LKR', 'USD', 'GBP', 'CAD', 'AUD', 'AED', 'INR'];
const ADVANCE_SCHEMES = ['50', '25', '30', 'custom', 'fixed'];
const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'PayPal', 'Wise', 'Payoneer', 'Crypto', 'Other'];

const TOTAL_STEPS = 6;

export function LeadModal({ open, onClose, onSave, onUpdate, editingLead }: LeadModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (open) {
      if (editingLead) {
        setFormData(editingLead);
      } else {
        const today = new Date();
        const followUpDate = new Date();
        followUpDate.setDate(today.getDate() + 3);
        
        setFormData({
          date: today.toISOString().split('T')[0],
          nextFollowUp: followUpDate.toISOString().split('T')[0],
          country: 'Sri Lanka',
          leadStatus: 'New',
          currency: 'LKR',
          advanceScheme: '50',
          contacted: false,
          replied: false,
          demoSent: false,
          interested: false,
          advancePaid: false,
          balancePaid: false,
          projectCompleted: false,
          freeDomain: false,
          renewalAgreement: false,
          repeatClient: false,
          advanceProof: false,
          balanceProof: false,
        });
      }
      setCurrentStep(1);
    }
  }, [open, editingLead]);

  const updateField = (field: keyof Lead, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePricing = () => {
    const finalVal = formData.finalValue || 0;
    const scheme = formData.advanceScheme || '50';
    const customPercent = formData.advanceAmount || 0;

    let advance = 0;
    if (scheme === '50') advance = finalVal * 0.5;
    else if (scheme === '25') advance = finalVal * 0.25;
    else if (scheme === '30') advance = finalVal * 0.30;
    else if (scheme === 'custom') advance = finalVal * (customPercent / 100);
    else if (scheme === 'fixed') advance = customPercent;

    return { advance, balance: finalVal - advance };
  };

  const handleSave = () => {
    const pricing = calculatePricing();
    const leadData = {
      ...formData,
      advanceAmount: pricing.advance,
      balanceAmount: pricing.balance,
    } as Omit<Lead, 'id'>;

    if (editingLead) {
      onUpdate(editingLead.id, leadData);
    } else {
      onSave(leadData);
    }
    onClose();
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setCurrentStep(step);
    }
  };

  const renderStepIndicator = () => {
    const steps = ['Basic', 'Sales', 'Project', 'Pricing', 'Delivery', 'Admin'];
    
    return (
      <div className="flex items-center justify-between max-w-3xl mx-auto mb-6">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          
          return (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center cursor-pointer group" onClick={() => goToStep(stepNum)}>
                <div className={`step-indicator ${isActive ? 'active' : isCompleted ? 'completed' : 'inactive'}`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span className="text-[10px] font-medium text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
                  {step}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`step-line ${isCompleted ? 'active' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-primary uppercase tracking-wide mb-4 border-b border-border pb-2">
        🧾 Basic Information
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Input 
            type="date" 
            value={formData.date || ''} 
            onChange={(e) => updateField('date', e.target.value)} 
          />
        </div>
        <div>
          <Label>Business Name</Label>
          <Input 
            placeholder="Enter business name"
            value={formData.businessName || ''} 
            onChange={(e) => updateField('businessName', e.target.value)} 
          />
        </div>
        <div>
          <Label>Client Name</Label>
          <Input 
            placeholder="Client contact person"
            value={formData.clientName || ''} 
            onChange={(e) => updateField('clientName', e.target.value)} 
          />
        </div>
        <div>
          <Label>Country</Label>
          <Select value={formData.country || 'Sri Lanka'} onValueChange={(v) => updateField('country', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Platform / Source</Label>
          <Select value={formData.platform || ''} onValueChange={(v) => updateField('platform', v)}>
            <SelectTrigger><SelectValue placeholder="Select Source" /></SelectTrigger>
            <SelectContent>
              {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Industry</Label>
          <Input 
            placeholder="e.g. Retail, Real Estate"
            value={formData.industry || ''} 
            onChange={(e) => updateField('industry', e.target.value)} 
          />
        </div>
        <div className="md:col-span-2">
          <Label>Contact Info</Label>
          <Input 
            placeholder="WhatsApp / Email / Phone"
            value={formData.contactInfo || ''} 
            onChange={(e) => updateField('contactInfo', e.target.value)} 
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-4 border-b border-border pb-2">
        📊 Sales Pipeline
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Lead Status</Label>
          <Select value={formData.leadStatus || 'New'} onValueChange={(v) => updateField('leadStatus', v as LeadStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Next Follow-Up Date</Label>
          <Input 
            type="date"
            value={formData.nextFollowUp || ''} 
            onChange={(e) => updateField('nextFollowUp', e.target.value)} 
          />
          <p className="text-[10px] text-muted-foreground mt-1">Defaults to +3 days from contact.</p>
        </div>
      </div>
      
      <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
        {['contacted', 'replied', 'demoSent', 'interested'].map(field => (
          <label key={field} className="flex flex-col items-center justify-center p-3 bg-secondary border border-border rounded-lg cursor-pointer hover:border-blue-500/50 transition-all">
            <span className="text-xs font-bold text-muted-foreground mb-2 capitalize">
              {field === 'demoSent' ? 'Demo Sent' : field}
            </span>
            <Checkbox 
              checked={formData[field as keyof Lead] as boolean || false}
              onCheckedChange={(checked) => updateField(field as keyof Lead, checked)}
              className="h-5 w-5"
            />
          </label>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wide mb-4 border-b border-border pb-2">
        📦 Project Details
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Package Type</Label>
          <Select value={formData.packageType || ''} onValueChange={(v) => updateField('packageType', v)}>
            <SelectTrigger><SelectValue placeholder="Select Package" /></SelectTrigger>
            <SelectContent>
              {PACKAGES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Project Type</Label>
          <Select value={formData.projectType || ''} onValueChange={(v) => updateField('projectType', v)}>
            <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
            <SelectContent>
              {PROJECT_TYPES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>{formData.packageType === 'Custom' ? 'Custom Project Description' : 'Project Scope Summary'}</Label>
        <Textarea 
          placeholder={formData.packageType === 'Custom' ? 'Describe custom requirements...' : 'Short description of the work...'}
          value={formData.projectScope || ''} 
          onChange={(e) => updateField('projectScope', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep4 = () => {
    const pricing = calculatePricing();
    const isForeign = formData.currency !== 'LKR';
    
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide mb-4 border-b border-border pb-2">
          💰 Pricing & 💳 Payments
        </h4>
        
        <div className="grid grid-cols-2 gap-4 p-3 bg-secondary/50 rounded-lg border border-border">
          <div>
            <Label>Billing Currency</Label>
            <Select value={formData.currency || 'LKR'} onValueChange={(v) => updateField('currency', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {isForeign && (
            <div>
              <Label className="text-emerald-400">Exchange Rate (to LKR)</Label>
              <Input 
                type="number"
                placeholder="e.g. 320"
                value={formData.exchangeRate || ''} 
                onChange={(e) => updateField('exchangeRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Price Quoted ({formData.currency || 'LKR'})</Label>
            <Input 
              type="number"
              placeholder="Original quote"
              value={formData.priceQuoted || ''} 
              onChange={(e) => updateField('priceQuoted', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Final Agreed Value ({formData.currency || 'LKR'})</Label>
            <Input 
              type="number"
              placeholder="Negotiated amount"
              value={formData.finalValue || ''} 
              onChange={(e) => updateField('finalValue', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Advance Scheme</Label>
            <Select value={formData.advanceScheme || '50'} onValueChange={(v) => updateField('advanceScheme', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50% Advance</SelectItem>
                <SelectItem value="25">25% Advance</SelectItem>
                <SelectItem value="30">30% Advance</SelectItem>
                <SelectItem value="custom">Custom %</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Payment Method</Label>
            <Select value={formData.paymentMethod || ''} onValueChange={(v) => updateField('paymentMethod', v)}>
              <SelectTrigger><SelectValue placeholder="Select Method" /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-900/10 border border-emerald-900/30 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Advance Amount</p>
            <p className="text-lg font-bold text-emerald-400">{formData.currency || 'LKR'} {pricing.advance.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Balance Amount</p>
            <p className="text-lg font-bold">{formData.currency || 'LKR'} {pricing.balance.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-2 p-2 bg-secondary rounded cursor-pointer">
            <Checkbox 
              checked={formData.advancePaid || false}
              onCheckedChange={(checked) => updateField('advancePaid', checked)}
            />
            <span className="text-xs">Advance Paid</span>
          </label>
          <label className="flex items-center gap-2 p-2 bg-secondary rounded cursor-pointer">
            <Checkbox 
              checked={formData.advanceProof || false}
              onCheckedChange={(checked) => updateField('advanceProof', checked)}
            />
            <span className="text-xs">Adv. Proof</span>
          </label>
          <label className="flex items-center gap-2 p-2 bg-secondary rounded cursor-pointer">
            <Checkbox 
              checked={formData.balancePaid || false}
              onCheckedChange={(checked) => updateField('balancePaid', checked)}
            />
            <span className="text-xs">Balance Paid</span>
          </label>
          <label className="flex items-center gap-2 p-2 bg-secondary rounded cursor-pointer">
            <Checkbox 
              checked={formData.balanceProof || false}
              onCheckedChange={(checked) => updateField('balanceProof', checked)}
            />
            <span className="text-xs">Bal. Proof</span>
          </label>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide mb-4 border-b border-border pb-2">
        🚀 Delivery Schedule
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Expected Delivery</Label>
          <Input 
            type="date"
            value={formData.expectedDelivery || ''} 
            onChange={(e) => updateField('expectedDelivery', e.target.value)}
          />
        </div>
        <div>
          <Label>Actual Delivery</Label>
          <Input 
            type="date"
            value={formData.actualDelivery || ''} 
            onChange={(e) => updateField('actualDelivery', e.target.value)}
          />
        </div>
      </div>
      <label className="flex items-center gap-3 p-4 bg-emerald-900/10 border border-emerald-900/30 rounded-lg cursor-pointer">
        <Checkbox 
          checked={formData.projectCompleted || false}
          onCheckedChange={(checked) => updateField('projectCompleted', checked)}
          className="h-5 w-5"
        />
        <div>
          <span className="font-medium">Project Completed</span>
          <p className="text-xs text-muted-foreground">Mark when the project is fully delivered</p>
        </div>
      </label>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-pink-400 uppercase tracking-wide mb-4 border-b border-border pb-2">
        ⚙️ Admin & Domain/Hosting
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex items-center gap-2 p-2 bg-secondary rounded cursor-pointer">
          <Checkbox 
            checked={formData.freeDomain || false}
            onCheckedChange={(checked) => updateField('freeDomain', checked)}
          />
          <span className="text-xs">Free Domain</span>
        </label>
        <label className="flex items-center gap-2 p-2 bg-secondary rounded cursor-pointer">
          <Checkbox 
            checked={formData.renewalAgreement || false}
            onCheckedChange={(checked) => updateField('renewalAgreement', checked)}
          />
          <span className="text-xs">Renewal Agreed</span>
        </label>
        <label className="flex items-center gap-2 p-2 bg-secondary rounded cursor-pointer">
          <Checkbox 
            checked={formData.repeatClient || false}
            onCheckedChange={(checked) => updateField('repeatClient', checked)}
          />
          <span className="text-xs">Repeat Client</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Domain Name</Label>
          <Input 
            placeholder="example.com"
            value={formData.domainName || ''} 
            onChange={(e) => updateField('domainName', e.target.value)}
          />
        </div>
        <div>
          <Label>Domain Provider</Label>
          <Input 
            placeholder="e.g. GoDaddy, Namecheap"
            value={formData.domainProvider || ''} 
            onChange={(e) => updateField('domainProvider', e.target.value)}
          />
        </div>
        <div>
          <Label>Hosting Provider</Label>
          <Input 
            placeholder="e.g. Hostinger, DigitalOcean"
            value={formData.hostingProvider || ''} 
            onChange={(e) => updateField('hostingProvider', e.target.value)}
          />
        </div>
        <div>
          <Label>Agreement Link</Label>
          <Input 
            placeholder="https://..."
            value={formData.agreementLink || ''} 
            onChange={(e) => updateField('agreementLink', e.target.value)}
          />
        </div>
        <div>
          <Label>Domain Renewal Date</Label>
          <Input 
            type="date"
            value={formData.domainRenewal || ''} 
            onChange={(e) => updateField('domainRenewal', e.target.value)}
          />
        </div>
        <div>
          <Label>Hosting Renewal Date</Label>
          <Input 
            type="date"
            value={formData.hostingRenewal || ''} 
            onChange={(e) => updateField('hostingRenewal', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea 
          placeholder="Any additional notes..."
          value={formData.notes || ''} 
          onChange={(e) => updateField('notes', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-primary -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-primary-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            {editingLead ? 'Edit Lead' : 'Add New Lead'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {renderStepIndicator()}
          
          <div className="min-h-[300px]">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep < TOTAL_STEPS ? (
              <Button onClick={() => goToStep(currentStep + 1)}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500">
                <Check className="w-4 h-4 mr-2" />
                {editingLead ? 'Update Lead' : 'Save Lead'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
