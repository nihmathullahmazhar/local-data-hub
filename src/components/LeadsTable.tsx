import { Lead, LeadStatus } from '@/types/lead';
import { 
  Pencil, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Printer, 
  Bell,
  CheckCircle2,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (index: number) => void;
  onDelete: (id: number) => void;
  onTogglePayment: (id: number, field: 'advancePaid' | 'balancePaid') => void;
  onToggleCompletion: (id: number) => void;
  onTogglePipelineField: (id: number, field: keyof Lead, value: boolean) => void;
  onGenerateDoc: (id: number) => void;
  allLeads: Lead[];
}

export function LeadsTable({ 
  leads, 
  onEdit, 
  onDelete, 
  onTogglePayment, 
  onToggleCompletion, 
  onTogglePipelineField,
  onGenerateDoc,
  allLeads 
}: LeadsTableProps) {
  const getStatusClass = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'status-new';
      case 'Contacted': return 'status-contacted';
      case 'Demo Sent': return 'status-demo-sent';
      case 'Negotiating': return 'status-negotiating';
      case 'Closed-Won': return 'status-closed-won';
      case 'Closed-Lost': return 'status-closed-lost';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const formatPrice = (val: number | undefined) => val ? val.toLocaleString() : '-';

  const isFollowUpDue = (lead: Lead) => {
    if (!lead.nextFollowUp || lead.leadStatus === 'Closed-Won') return false;
    return lead.nextFollowUp <= new Date().toISOString().split('T')[0];
  };

  const CheckIcon = ({ checked }: { checked: boolean }) => (
    checked 
      ? <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
      : <Minus className="w-4 h-4 text-muted-foreground/50" />
  );

  return (
    <div className="table-wrapper">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-secondary/80 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 whitespace-nowrap">Date</th>
            <th className="px-4 py-3">Business</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Country</th>
            <th className="px-4 py-3">Platform</th>
            <th className="px-4 py-3">Industry</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-2 py-3 text-center">📞</th>
            <th className="px-2 py-3 text-center">💬</th>
            <th className="px-2 py-3 text-center">🎬</th>
            <th className="px-2 py-3 text-center">⭐</th>
            <th className="px-4 py-3">Follow-up</th>
            <th className="px-2 py-3 text-center">🔔</th>
            <th className="px-4 py-3">Package</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Scope</th>
            <th className="px-4 py-3 text-right">Quoted</th>
            <th className="px-4 py-3 text-right">Final</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-2 py-3 text-center">Adv</th>
            <th className="px-4 py-3 text-right">Adv Amt</th>
            <th className="px-2 py-3 text-center">Proof</th>
            <th className="px-2 py-3 text-center">Bal</th>
            <th className="px-4 py-3 text-right">Bal Amt</th>
            <th className="px-4 py-3">Expected</th>
            <th className="px-4 py-3">Actual</th>
            <th className="px-2 py-3 text-center">✅</th>
            <th className="px-2 py-3 text-center">🆓</th>
            <th className="px-4 py-3">Domain</th>
            <th className="px-4 py-3">D. Provider</th>
            <th className="px-4 py-3">H. Provider</th>
            <th className="px-2 py-3 text-center">📋</th>
            <th className="px-4 py-3">D. Renewal</th>
            <th className="px-4 py-3">H. Renewal</th>
            <th className="px-2 py-3 text-center">🔁</th>
            <th className="px-4 py-3">Agreement</th>
            <th className="px-4 py-3 text-center sticky right-0 bg-secondary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const actualIndex = allLeads.findIndex(l => l.id === lead.id);
            const advAmt = lead.advanceAmount || 0;
            const balAmt = lead.balanceAmount || (lead.finalValue || 0) - advAmt;

            return (
              <tr 
                key={lead.id}
                className={`hover:bg-secondary/50 transition-colors border-b border-border group ${
                  lead.projectCompleted ? 'opacity-60 bg-card/30' : ''
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">{lead.date}</td>
                <td className="px-4 py-3 font-medium">{lead.businessName}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.clientName || '-'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{lead.country || '-'}</td>
                <td className="px-4 py-3 text-xs">
                  <span className="bg-secondary border border-border px-2 py-1 rounded">
                    {lead.platform || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{lead.industry || '-'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{lead.contactInfo || '-'}</td>
                
                <td className="px-4 py-3">
                  <span className={`status-badge ${getStatusClass(lead.leadStatus)}`}>
                    {lead.leadStatus}
                  </span>
                </td>
                
                {/* Pipeline toggles */}
                <td className="px-2 py-3 text-center">
                  <Checkbox 
                    checked={lead.contacted}
                    onCheckedChange={(checked) => onTogglePipelineField(lead.id, 'contacted', !!checked)}
                    className="pipeline-checkbox"
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  <Checkbox 
                    checked={lead.replied}
                    onCheckedChange={(checked) => onTogglePipelineField(lead.id, 'replied', !!checked)}
                    className="pipeline-checkbox"
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  <Checkbox 
                    checked={lead.demoSent}
                    onCheckedChange={(checked) => onTogglePipelineField(lead.id, 'demoSent', !!checked)}
                    className="pipeline-checkbox"
                  />
                </td>
                <td className="px-2 py-3 text-center">
                  <Checkbox 
                    checked={lead.interested}
                    onCheckedChange={(checked) => onTogglePipelineField(lead.id, 'interested', !!checked)}
                    className="pipeline-checkbox"
                  />
                </td>
                
                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.nextFollowUp || '-'}</td>
                <td className="px-2 py-3 text-center">
                  {isFollowUpDue(lead) && (
                    <Bell className="w-4 h-4 text-amber-500 animate-pulse drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                  )}
                </td>

                <td className="px-4 py-3 text-muted-foreground">{lead.packageType || '-'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{lead.projectType || '-'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-[150px] truncate" title={lead.projectScope}>
                  {lead.projectScope || '-'}
                </td>

                <td className="px-4 py-3 text-muted-foreground text-right text-xs">{formatPrice(lead.priceQuoted)}</td>
                <td className="px-4 py-3 font-medium text-emerald-400 text-right text-xs">{formatPrice(lead.finalValue)}</td>

                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.paymentMethod || '-'}</td>
                
                <td className="px-2 py-3 text-center">
                  <button 
                    onClick={() => onTogglePayment(lead.id, 'advancePaid')}
                    className="focus:outline-none transition-transform active:scale-95 p-1 rounded hover:bg-secondary"
                  >
                    {lead.advancePaid 
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
                      : <Circle className="w-5 h-5 text-muted-foreground hover:text-emerald-400" />
                    }
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground text-right">{advAmt > 0 ? formatPrice(advAmt) : '-'}</td>
                <td className="px-2 py-3 text-center"><CheckIcon checked={lead.advanceProof} /></td>
                
                <td className="px-2 py-3 text-center">
                  <button 
                    onClick={() => onTogglePayment(lead.id, 'balancePaid')}
                    className="focus:outline-none transition-transform active:scale-95 p-1 rounded hover:bg-secondary"
                  >
                    {lead.balancePaid 
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
                      : <Circle className="w-5 h-5 text-muted-foreground hover:text-emerald-400" />
                    }
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground text-right">{balAmt > 0 ? formatPrice(balAmt) : '-'}</td>

                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.expectedDelivery || '-'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.actualDelivery || '-'}</td>
                <td className="px-2 py-3 text-center"><CheckIcon checked={lead.projectCompleted} /></td>

                <td className="px-2 py-3 text-center"><CheckIcon checked={lead.freeDomain} /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.domainName || '-'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.domainProvider || '-'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.hostingProvider || '-'}</td>
                <td className="px-2 py-3 text-center"><CheckIcon checked={lead.renewalAgreement} /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.domainRenewal || '-'}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{lead.hostingRenewal || '-'}</td>
                <td className="px-2 py-3 text-center"><CheckIcon checked={lead.repeatClient} /></td>

                <td className="px-4 py-3 text-center">
                  {lead.agreementLink ? (
                    <a 
                      href={lead.agreementLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline text-xs"
                    >
                      Link
                    </a>
                  ) : lead.agreementFileName ? (
                    <span className="text-xs text-muted-foreground" title={lead.agreementFileName}>
                      File
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">-</span>
                  )}
                </td>

                <td className="px-4 py-3 text-center sticky right-0 bg-card group-hover:bg-secondary border-l border-border shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.5)] transition-colors">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 ${lead.projectCompleted ? 'bg-emerald-600 text-white' : 'bg-secondary text-muted-foreground hover:text-emerald-400'}`}
                      onClick={() => onToggleCompletion(lead.id)}
                      title="Toggle Completion"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-600/50"
                      onClick={() => onGenerateDoc(lead.id)}
                      title="Generate Receipt/Quote"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/50"
                      onClick={() => onEdit(actualIndex)}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/50"
                      onClick={() => onDelete(lead.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {leads.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No leads found. Add your first lead to get started!</p>
        </div>
      )}
    </div>
  );
}
