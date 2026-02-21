import { Lead, LeadStatus } from '@/types/lead';
import { 
  Pencil, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Printer, 
  Bell,
  CheckCircle2,
  Minus,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';

const ALL_STATUSES: LeadStatus[] = [
  'New', 'Contacted', 'Replied', 'Demo Sent', 'Negotiating', 'Closed-Won', 'Closed-Lost', 'Follow-up Later'
];

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (index: number) => void;
  onDelete: (id: number) => void;
  onTogglePayment: (id: number, field: 'advancePaid' | 'balancePaid') => void;
  onToggleCompletion: (id: number) => void;
  onTogglePipelineField: (id: number, field: keyof Lead, value: boolean) => void;
  onGenerateDoc: (id: number) => void;
  onStatusChange: (id: number, status: LeadStatus) => void;
  allLeads: Lead[];
}

function StatusDropdown({ lead, onStatusChange }: { lead: Lead; onStatusChange: (id: number, status: LeadStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getStatusClass = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'status-new';
      case 'Contacted': return 'status-contacted';
      case 'Demo Sent': return 'status-demo-sent';
      case 'Negotiating': return 'status-negotiating';
      case 'Closed-Won': return 'status-closed-won';
      case 'Closed-Lost': return 'status-closed-lost';
      case 'Replied': return 'bg-cyan-900/30 text-cyan-300 border-cyan-700/50';
      case 'Follow-up Later': return 'bg-slate-900/30 text-slate-300 border-slate-700/50';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`status-badge ${getStatusClass(lead.leadStatus)} cursor-pointer flex items-center gap-1 whitespace-nowrap`}
      >
        {lead.leadStatus}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[140px]">
          {ALL_STATUSES.map(status => (
            <button
              key={status}
              onClick={() => { onStatusChange(lead.id, status); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-secondary transition-colors ${lead.leadStatus === status ? 'bg-secondary font-bold' : ''}`}
            >
              <span className={`status-badge ${getStatusClass(status)} text-[10px]`}>{status}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PipelineToggle({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="focus:outline-none transition-transform active:scale-95 p-0.5 rounded hover:bg-secondary"
    >
      {checked
        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
        : <Circle className="w-4 h-4 text-muted-foreground/40 hover:text-emerald-400" />
      }
    </button>
  );
}

export function LeadsTable({ 
  leads, onEdit, onDelete, onTogglePayment, onToggleCompletion,
  onTogglePipelineField, onGenerateDoc, onStatusChange, allLeads 
}: LeadsTableProps) {
  const getRowClass = (lead: Lead) => {
    if (lead.leadStatus === 'Closed-Lost') return 'bg-red-950/30 border-red-900/30';
    if (lead.leadStatus === 'Closed-Won') return 'bg-emerald-950/30 border-emerald-900/30';
    if (lead.projectCompleted) return 'opacity-60 bg-card/30';
    return '';
  };

  const getTotalExpenses = (lead: Lead) => (lead.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const getNetProfit = (lead: Lead) => (lead.amountInLKR || lead.finalValue || 0) - getTotalExpenses(lead);

  const isFollowUpDue = (lead: Lead) => {
    if (!lead.nextFollowUp || lead.leadStatus === 'Closed-Won') return false;
    return lead.nextFollowUp <= new Date().toISOString().split('T')[0];
  };

  return (
    <div className="table-wrapper">
      <table className="w-full text-sm text-left">
        <thead className="text-[10px] uppercase bg-secondary/80 text-muted-foreground">
          <tr>
            <th className="px-2 py-2.5 text-center w-10">#</th>
            <th className="px-3 py-2.5 whitespace-nowrap">Date</th>
            <th className="px-3 py-2.5">Business</th>
            <th className="px-3 py-2.5">Client</th>
            <th className="px-3 py-2.5">Country</th>
            <th className="px-3 py-2.5">Platform</th>
            <th className="px-3 py-2.5">Industry</th>
            <th className="px-3 py-2.5">Contact</th>
            <th className="px-3 py-2.5">Status</th>
            {/* Pipeline toggles */}
            <th className="px-1 py-2.5 text-center" title="Contacted">📞</th>
            <th className="px-1 py-2.5 text-center" title="Replied">💬</th>
            <th className="px-1 py-2.5 text-center" title="Demo Sent">🎬</th>
            <th className="px-1 py-2.5 text-center" title="Interested">⭐</th>
            <th className="px-3 py-2.5">Follow-up</th>
            <th className="px-3 py-2.5">Package</th>
            <th className="px-3 py-2.5">Type</th>
            <th className="px-3 py-2.5">Scope</th>
            <th className="px-3 py-2.5 text-right">Final</th>
            <th className="px-3 py-2.5 text-right">LKR</th>
            <th className="px-3 py-2.5">Method</th>
            <th className="px-1 py-2.5 text-center">Adv</th>
            <th className="px-3 py-2.5">Proof</th>
            <th className="px-1 py-2.5 text-center">Bal</th>
            <th className="px-3 py-2.5 text-right">Bal Amt</th>
            <th className="px-3 py-2.5 text-right">Expenses</th>
            <th className="px-3 py-2.5 text-right">Net Profit</th>
            <th className="px-3 py-2.5">Expected</th>
            <th className="px-3 py-2.5">Actual</th>
            <th className="px-1 py-2.5 text-center">✅</th>
            <th className="px-3 py-2.5">Domain</th>
            <th className="px-3 py-2.5">D. Provider</th>
            <th className="px-3 py-2.5">H. Provider</th>
            <th className="px-3 py-2.5">D. Renewal</th>
            <th className="px-3 py-2.5 text-center sticky right-0 bg-secondary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, displayIndex) => {
            const actualIndex = allLeads.findIndex(l => l.id === lead.id);
            const lkrValue = lead.amountInLKR || lead.finalValue || 0;
            const expenses = getTotalExpenses(lead);
            const netProfit = getNetProfit(lead);

            return (
              <tr 
                key={lead.id}
                className={`hover:bg-secondary/50 transition-colors border-b border-border group ${getRowClass(lead)}`}
              >
                <td className="px-2 py-2.5 text-center text-xs font-bold text-muted-foreground">{displayIndex + 1}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground text-xs">{lead.date}</td>
                <td className="px-3 py-2.5 font-medium text-xs">{lead.businessName}</td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs">{lead.clientName || '-'}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.country || '-'}</td>
                <td className="px-3 py-2.5 text-xs">
                  <span className="bg-secondary border border-border px-1.5 py-0.5 rounded text-[10px]">{lead.platform || '-'}</span>
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.industry || '-'}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.contactInfo || '-'}</td>
                
                {/* Status Dropdown */}
                <td className="px-3 py-2.5">
                  <StatusDropdown lead={lead} onStatusChange={onStatusChange} />
                </td>

                {/* Pipeline Toggles */}
                <td className="px-1 py-2.5 text-center">
                  <PipelineToggle checked={lead.contacted} onClick={() => onTogglePipelineField(lead.id, 'contacted', !lead.contacted)} label="Contacted" />
                </td>
                <td className="px-1 py-2.5 text-center">
                  <PipelineToggle checked={lead.replied} onClick={() => onTogglePipelineField(lead.id, 'replied', !lead.replied)} label="Replied" />
                </td>
                <td className="px-1 py-2.5 text-center">
                  <PipelineToggle checked={lead.demoSent} onClick={() => onTogglePipelineField(lead.id, 'demoSent', !lead.demoSent)} label="Demo Sent" />
                </td>
                <td className="px-1 py-2.5 text-center">
                  <PipelineToggle checked={lead.interested} onClick={() => onTogglePipelineField(lead.id, 'interested', !lead.interested)} label="Interested" />
                </td>

                <td className="px-3 py-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    {lead.nextFollowUp || '-'}
                    {isFollowUpDue(lead) && <Bell className="w-3 h-3 text-amber-500 animate-pulse" />}
                  </div>
                </td>

                <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.packageType || '-'}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.projectType || '-'}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.projectScope || '-'}</td>
                <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                  {lead.finalValue ? `${lead.currency || ''} ${lead.finalValue.toLocaleString()}` : '-'}
                </td>
                <td className="px-3 py-2.5 font-medium text-emerald-400 text-right text-xs">
                  {lkrValue > 0 ? lkrValue.toLocaleString() : '-'}
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.paymentMethod || '-'}</td>

                {/* Advance */}
                <td className="px-1 py-2.5 text-center">
                  <button onClick={() => onTogglePayment(lead.id, 'advancePaid')} className="focus:outline-none transition-transform active:scale-95 p-0.5 rounded hover:bg-secondary">
                    {lead.advancePaid
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
                      : <Circle className="w-4 h-4 text-muted-foreground hover:text-emerald-400" />
                    }
                  </button>
                </td>
                <td className="px-3 py-2.5 text-center">
                  {lead.advanceProof
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                    : <Minus className="w-3 h-3 text-muted-foreground/40 mx-auto" />
                  }
                </td>

                {/* Balance */}
                <td className="px-1 py-2.5 text-center">
                  <button onClick={() => onTogglePayment(lead.id, 'balancePaid')} className="focus:outline-none transition-transform active:scale-95 p-0.5 rounded hover:bg-secondary">
                    {lead.balancePaid
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
                      : <Circle className="w-4 h-4 text-muted-foreground hover:text-emerald-400" />
                    }
                  </button>
                </td>
                <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                  {lead.balanceAmount ? `Rs. ${lead.balanceAmount.toLocaleString()}` : '-'}
                </td>

                <td className="px-3 py-2.5 text-right text-xs text-red-400">
                  {expenses > 0 ? `Rs. ${expenses.toLocaleString()}` : '-'}
                </td>
                <td className={`px-3 py-2.5 text-right text-xs font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {lkrValue > 0 ? `Rs. ${netProfit.toLocaleString()}` : '-'}
                </td>

                <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{lead.expectedDelivery || '-'}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{lead.actualDelivery || '-'}</td>

                <td className="px-1 py-2.5 text-center">
                  {lead.projectCompleted
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)] mx-auto" />
                    : <Minus className="w-3 h-3 text-muted-foreground/40 mx-auto" />
                  }
                </td>

                <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.domainName || '-'}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.domainProvider || '-'}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.hostingProvider || '-'}</td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{lead.domainRenewal || '-'}</td>

                <td className="px-3 py-2.5 text-center sticky right-0 bg-card group-hover:bg-secondary border-l border-border shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.5)] transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon"
                      className={`h-7 w-7 ${lead.projectCompleted ? 'bg-emerald-600 text-white' : 'bg-secondary text-muted-foreground hover:text-emerald-400'}`}
                      onClick={() => onToggleCompletion(lead.id)} title="Toggle Completion">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon"
                      className="h-7 w-7 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-600/50"
                      onClick={() => onGenerateDoc(lead.id)} title="Generate Receipt/Quote">
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon"
                      className="h-7 w-7 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/50"
                      onClick={() => onEdit(actualIndex)} title="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon"
                      className="h-7 w-7 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/50"
                      onClick={() => onDelete(lead.id)} title="Delete">
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
