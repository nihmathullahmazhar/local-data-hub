import { useState, useEffect } from 'react';
import { Lead, LeadStatus, ServiceItem, DeliveryFeature } from '@/types/lead';
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
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  UserPlus, 
  Plus, 
  Trash2, 
  Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: '1', name: 'Website Design', description: 'Custom website design', quantity: 1, price: 0 },
];

const DEFAULT_FEATURES: DeliveryFeature[] = [
  { id: '1', feature: 'Responsive Design', included: true, price: 0 },
  { id: '2', feature: 'SEO Optimization', included: true, price: 0 },
  { id: '3', feature: 'Contact Form', included: true, price: 0 },
  { id: '4', feature: 'Social Media Integration', included: false, price: 0 },
  { id: '5', feature: 'E-commerce Integration', included: false, price: 0 },
];

const TOTAL_STEPS = 6;

export function LeadModal({ open, onClose, onSave, onUpdate, editingLead }: LeadModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [servicesOpen, setServicesOpen] = useState(false);

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
          services: DEFAULT_SERVICES,
          deliveryFeatures: DEFAULT_FEATURES,
          revisionsIncluded: 2,
          exchangeRate: 1,
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
    const exchangeRate = formData.exchangeRate || 1;

    let advance = 0;
    if (scheme === '50') advance = finalVal * 0.5;
    else if (scheme === '25') advance = finalVal * 0.25;
    else if (scheme === '30') advance = finalVal * 0.30;
    else if (scheme === 'custom') advance = finalVal * (customPercent / 100);
    else if (scheme === 'fixed') advance = customPercent;

    const amountInLKR = formData.currency === 'LKR' ? finalVal : finalVal * exchangeRate;

    return { advance, balance: finalVal - advance, amountInLKR };
  };

  const handleSave = () => {
    const pricing = calculatePricing();
    const leadData = {
      ...formData,
      advanceAmount: pricing.advance,
      balanceAmount: pricing.balance,
      amountInLKR: pricing.amountInLKR,
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

  // Services management
  const addService = () => {
    const services = formData.services || [];
    const newService: ServiceItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      quantity: 1,
      price: 0,
    };
    updateField('services', [...services, newService]);
  };

  const updateService = (id: string, field: keyof ServiceItem, value: any) => {
    const services = (formData.services || []).map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    updateField('services', services);
  };

  const removeService = (id: string) => {
    const services = (formData.services || []).filter(s => s.id !== id);
    updateField('services', services);
  };

  // Delivery features management
  const addFeature = () => {
    const features = formData.deliveryFeatures || [];
    const newFeature: DeliveryFeature = {
      id: Date.now().toString(),
      feature: '',
      included: true,
      price: 0,
    };
    updateField('deliveryFeatures', [...features, newFeature]);
  };

  const updateFeature = (id: string, field: keyof DeliveryFeature, value: any) => {
    const features = (formData.deliveryFeatures || []).map(f => 
      f.id === id ? { ...f, [field]: value } : f
    );
    updateField('deliveryFeatures', features);
  };

  const removeFeature = (id: string) => {
    const features = (formData.deliveryFeatures || []).filter(f => f.id !== id);
    updateField('deliveryFeatures', features);
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

  const renderSaveButton = () => (
    <Button 
      onClick={handleSave} 
      size="sm"
      className="bg-emerald-600 hover:bg-emerald-500"
    >
      <Save className="w-4 h-4 mr-2" />
      {editingLead ? 'Update' : 'Save'} Lead
    </Button>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-primary uppercase tracking-wide border-b border-border pb-2 flex-1">
          🧾 Basic Information
        </h4>
        {renderSaveButton()}
      </div>
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
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wide border-b border-border pb-2 flex-1">
          📊 Sales Pipeline
        </h4>
        {renderSaveButton()}
      </div>
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
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wide border-b border-border pb-2 flex-1">
          📦 Project Details
        </h4>
        {renderSaveButton()}
      </div>
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

      {/* Services Table Dropdown */}
      <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              📋 Services / Line Items ({(formData.services || []).length})
            </span>
            {servicesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-3 font-medium">Service Name</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-center p-3 font-medium w-20">Qty</th>
                  <th className="text-right p-3 font-medium w-32">Price (LKR)</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {(formData.services || []).map((service) => (
                  <tr key={service.id} className="border-t border-border">
                    <td className="p-2">
                      <Input 
                        value={service.name}
                        onChange={(e) => updateService(service.id, 'name', e.target.value)}
                        placeholder="Service name"
                        className="h-8"
                      />
                    </td>
                    <td className="p-2">
                      <Input 
                        value={service.description}
                        onChange={(e) => updateService(service.id, 'description', e.target.value)}
                        placeholder="Description"
                        className="h-8"
                      />
                    </td>
                    <td className="p-2">
                      <Input 
                        type="number"
                        value={service.quantity}
                        onChange={(e) => updateService(service.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="h-8 text-center"
                        min={1}
                      />
                    </td>
                    <td className="p-2">
                      <Input 
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(service.id, 'price', parseFloat(e.target.value) || 0)}
                        className="h-8 text-right"
                      />
                    </td>
                    <td className="p-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeService(service.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-secondary/50">
                <tr>
                  <td colSpan={3} className="p-3 text-right font-medium">Total:</td>
                  <td className="p-3 text-right font-bold text-primary">
                    Rs. {(formData.services || []).reduce((sum, s) => sum + (s.price * s.quantity), 0).toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            <div className="p-3 border-t border-border">
              <Button variant="outline" size="sm" onClick={addService}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderStep4 = () => {
    const pricing = calculatePricing();
    const isForeign = formData.currency !== 'LKR';
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide border-b border-border pb-2 flex-1">
            💰 Pricing & 💳 Payments
          </h4>
          {renderSaveButton()}
        </div>
        
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
            <Label>Final Agreed Value ({formData.currency || 'LKR'})</Label>
            <Input 
              type="number"
              placeholder="Agreed amount"
              value={formData.finalValue || ''} 
              onChange={(e) => updateField('finalValue', parseFloat(e.target.value) || 0)}
            />
          </div>
          {isForeign && formData.exchangeRate && formData.exchangeRate > 0 && (
            <div>
              <Label className="text-emerald-400">Amount in LKR</Label>
              <div className="h-10 flex items-center px-3 bg-emerald-900/20 border border-emerald-500/30 rounded-md text-emerald-400 font-bold">
                Rs. {pricing.amountInLKR.toLocaleString()}
              </div>
            </div>
          )}
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
            <p className="text-xs text-muted-foreground mb-1">Advance Amount ({formData.currency || 'LKR'})</p>
            <p className="text-lg font-bold text-emerald-400">
              {formData.currency === 'LKR' ? 'Rs.' : formData.currency} {pricing.advance.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Balance Amount ({formData.currency || 'LKR'})</p>
            <p className="text-lg font-bold">
              {formData.currency === 'LKR' ? 'Rs.' : formData.currency} {pricing.balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Advance Payment Section */}
        <div className="p-4 bg-amber-900/10 border border-amber-900/30 rounded-lg space-y-3">
          <h5 className="text-sm font-bold text-amber-400">Advance Payment</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 p-2 bg-secondary rounded cursor-pointer">
              <Checkbox 
                checked={formData.advancePaid || false}
                onCheckedChange={(checked) => updateField('advancePaid', checked)}
              />
              <span className="text-xs">Paid</span>
            </label>
            <label className="flex items-center gap-2 p-2 bg-secondary rounded cursor-pointer">
              <Checkbox 
                checked={formData.advanceProof || false}
                onCheckedChange={(checked) => updateField('advanceProof', checked)}
              />
              <span className="text-xs">Proof</span>
            </label>
            <div>
              <Label className="text-xs">Date Received</Label>
              <Input 
                type="date"
                value={formData.advanceDateReceived || ''}
                onChange={(e) => updateField('advanceDateReceived', e.target.value)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Method</Label>
              <Select value={formData.advanceMethod || ''} onValueChange={(v) => updateField('advanceMethod', v)}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Method" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Balance Payment Section */}
        <div className="p-4 bg-blue-900/10 border border-blue-900/30 rounded-lg space-y-3">
          <h5 className="text-sm font-bold text-blue-400">Balance Payment</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 p-2 bg-secondary rounded cursor-pointer">
              <Checkbox 
                checked={formData.balancePaid || false}
                onCheckedChange={(checked) => updateField('balancePaid', checked)}
              />
              <span className="text-xs">Paid</span>
            </label>
            <label className="flex items-center gap-2 p-2 bg-secondary rounded cursor-pointer">
              <Checkbox 
                checked={formData.balanceProof || false}
                onCheckedChange={(checked) => updateField('balanceProof', checked)}
              />
              <span className="text-xs">Proof</span>
            </label>
            <div>
              <Label className="text-xs">Date Received</Label>
              <Input 
                type="date"
                value={formData.balanceDateReceived || ''}
                onChange={(e) => updateField('balanceDateReceived', e.target.value)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Method</Label>
              <Select value={formData.balanceMethod || ''} onValueChange={(v) => updateField('balanceMethod', v)}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Method" /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wide border-b border-border pb-2 flex-1">
          🚀 Delivery Schedule
        </h4>
        {renderSaveButton()}
      </div>
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
        <div>
          <Label>Revisions Included</Label>
          <Input 
            type="number"
            min={0}
            value={formData.revisionsIncluded || 2} 
            onChange={(e) => updateField('revisionsIncluded', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label>Revision Notes</Label>
          <Input 
            placeholder="Notes about revisions..."
            value={formData.revisionNotes || ''} 
            onChange={(e) => updateField('revisionNotes', e.target.value)}
          />
        </div>
      </div>

      {/* Delivery Features Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-secondary p-3 flex justify-between items-center">
          <h5 className="font-medium text-sm">📋 Project Features / Deliverables</h5>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left p-3 font-medium">Feature</th>
              <th className="text-center p-3 font-medium w-24">Included</th>
              <th className="text-right p-3 font-medium w-32">Price (LKR)</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {(formData.deliveryFeatures || []).map((feature) => (
              <tr key={feature.id} className="border-t border-border">
                <td className="p-2">
                  <Input 
                    value={feature.feature}
                    onChange={(e) => updateFeature(feature.id, 'feature', e.target.value)}
                    placeholder="Feature name"
                    className="h-8"
                  />
                </td>
                <td className="p-2 text-center">
                  <Checkbox 
                    checked={feature.included}
                    onCheckedChange={(checked) => updateFeature(feature.id, 'included', checked)}
                  />
                </td>
                <td className="p-2">
                  <Input 
                    type="number"
                    value={feature.price}
                    onChange={(e) => updateFeature(feature.id, 'price', parseFloat(e.target.value) || 0)}
                    className="h-8 text-right"
                  />
                </td>
                <td className="p-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeFeature(feature.id)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={addFeature}>
            <Plus className="w-4 h-4 mr-2" />
            Add Feature
          </Button>
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
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-pink-400 uppercase tracking-wide border-b border-border pb-2 flex-1">
          ⚙️ Admin & Domain/Hosting
        </h4>
        {renderSaveButton()}
      </div>
      
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
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500">
              <Save className="w-4 h-4 mr-2" />
              {editingLead ? 'Update' : 'Save'}
            </Button>
            {currentStep < TOTAL_STEPS && (
              <Button onClick={() => goToStep(currentStep + 1)}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
