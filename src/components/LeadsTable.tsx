import { Lead, LeadStatus } from '@/types/lead';
import { 
  Pencil, Trash2, CheckCircle, Circle, Printer, Bell,
  CheckCircle2, Minus, ChevronDown, Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';

const ALL_STATUSES: LeadStatus[] = [
  'New', 'Contacted', 'Replied', 'Demo Sent', 'Negotiating', 'Closed-Won', 'Closed-Lost', 'Follow-up Later'
];

type ColumnKey =
  | 'date' | 'business' | 'client' | 'country' | 'platform' | 'industry' | 'contact'
  | 'status' | 'pipeline' | 'followUp' | 'package' | 'type' | 'scope'
  | 'final' | 'lkr' | 'method' | 'advance' | 'proof' | 'balance' | 'balAmt'
  | 'expenses' | 'netProfit' | 'expected' | 'actual' | 'completed'
  | 'domain' | 'domainProvider' | 'hostingProvider' | 'domainRenewal';

const COLUMN_LABELS: Record<ColumnKey, string> = {
  date: 'Date', business: 'Business', client: 'Client', country: 'Country',
  platform: 'Platform', industry: 'Industry', contact: 'Contact', status: 'Status',
  pipeline: 'Pipeline (📞💬🎬⭐)', followUp: 'Follow-up', package: 'Package',
  type: 'Type', scope: 'Scope', final: 'Final Value', lkr: 'LKR',
  method: 'Pay Method', advance: 'Advance', proof: 'Proof', balance: 'Balance',
  balAmt: 'Bal Amount', expenses: 'Expenses', netProfit: 'Net Profit',
  expected: 'Expected', actual: 'Actual', completed: 'Completed',
  domain: 'Domain', domainProvider: 'D. Provider', hostingProvider: 'H. Provider',
  domainRenewal: 'D. Renewal',
};

const DEFAULT_VISIBLE: ColumnKey[] = [
  'date', 'business', 'client', 'status', 'pipeline', 'followUp',
  'final', 'lkr', 'advance', 'balance', 'netProfit',
];

const STORAGE_KEY = 'nws-column-visibility';

function loadVisibility(): Record<ColumnKey, boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  const vis = {} as Record<ColumnKey, boolean>;
  for (const key of Object.keys(COLUMN_LABELS) as ColumnKey[]) {
    vis[key] = DEFAULT_VISIBLE.includes(key);
  }
  return vis;
}

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
    <button onClick={onClick} title={label} className="focus:outline-none transition-transform active:scale-95 p-0.5 rounded hover:bg-secondary">
      {checked
        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" />
        : <Circle className="w-4 h-4 text-muted-foreground/40 hover:text-emerald-400" />
      }
    </button>
  );
}

function ColumnVisibilityToggle({ visibility, onChange }: { visibility: Record<ColumnKey, boolean>; onChange: (v: Record<ColumnKey, boolean>) => void }) {
  const toggle = (key: ColumnKey) => {
    const updated = { ...visibility, [key]: !visibility[key] };
    onChange(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const showAll = () => {
    const all = {} as Record<ColumnKey, boolean>;
    for (const key of Object.keys(COLUMN_LABELS) as ColumnKey[]) all[key] = true;
    onChange(all);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  };

  const reset = () => {
    const vis = {} as Record<ColumnKey, boolean>;
    for (const key of Object.keys(COLUMN_LABELS) as ColumnKey[]) vis[key] = DEFAULT_VISIBLE.includes(key);
    onChange(vis);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vis));
  };

  const visibleCount = Object.values(visibility).filter(Boolean).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
          <Settings2 className="w-3.5 h-3.5" />
          Columns
          <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">{visibleCount}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">Toggle Columns</span>
          <div className="flex gap-1">
            <button onClick={showAll} className="text-[10px] text-primary hover:underline">All</button>
            <span className="text-muted-foreground text-[10px]">|</span>
            <button onClick={reset} className="text-[10px] text-primary hover:underline">Reset</button>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
          {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map(key => (
            <label key={key} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-secondary cursor-pointer">
              <span className="text-xs text-foreground">{COLUMN_LABELS[key]}</span>
              <Switch checked={visibility[key]} onCheckedChange={() => toggle(key)} className="scale-75" />
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function LeadsTable({ 
  leads, onEdit, onDelete, onTogglePayment, onToggleCompletion,
  onTogglePipelineField, onGenerateDoc, onStatusChange, allLeads 
}: LeadsTableProps) {
  const [visibility, setVisibility] = useState<Record<ColumnKey, boolean>>(loadVisibility);

  const v = visibility;
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
    <div>
      <div className="flex justify-end mb-2">
        <ColumnVisibilityToggle visibility={visibility} onChange={setVisibility} />
      </div>
      <div className="table-wrapper">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] uppercase bg-secondary/80 text-muted-foreground">
            <tr>
              <th className="px-2 py-2.5 text-center w-10">#</th>
              {v.date && <th className="px-3 py-2.5 whitespace-nowrap">Date</th>}
              {v.business && <th className="px-3 py-2.5">Business</th>}
              {v.client && <th className="px-3 py-2.5">Client</th>}
              {v.country && <th className="px-3 py-2.5">Country</th>}
              {v.platform && <th className="px-3 py-2.5">Platform</th>}
              {v.industry && <th className="px-3 py-2.5">Industry</th>}
              {v.contact && <th className="px-3 py-2.5">Contact</th>}
              {v.status && <th className="px-3 py-2.5">Status</th>}
              {v.pipeline && <>
                <th className="px-1 py-2.5 text-center" title="Contacted">📞</th>
                <th className="px-1 py-2.5 text-center" title="Replied">💬</th>
                <th className="px-1 py-2.5 text-center" title="Demo Sent">🎬</th>
                <th className="px-1 py-2.5 text-center" title="Interested">⭐</th>
              </>}
              {v.followUp && <th className="px-3 py-2.5">Follow-up</th>}
              {v.package && <th className="px-3 py-2.5">Package</th>}
              {v.type && <th className="px-3 py-2.5">Type</th>}
              {v.scope && <th className="px-3 py-2.5">Scope</th>}
              {v.final && <th className="px-3 py-2.5 text-right">Final</th>}
              {v.lkr && <th className="px-3 py-2.5 text-right">LKR</th>}
              {v.method && <th className="px-3 py-2.5">Method</th>}
              {v.advance && <th className="px-1 py-2.5 text-center">Adv</th>}
              {v.proof && <th className="px-3 py-2.5">Proof</th>}
              {v.balance && <th className="px-1 py-2.5 text-center">Bal</th>}
              {v.balAmt && <th className="px-3 py-2.5 text-right">Bal Amt</th>}
              {v.expenses && <th className="px-3 py-2.5 text-right">Expenses</th>}
              {v.netProfit && <th className="px-3 py-2.5 text-right">Net Profit</th>}
              {v.expected && <th className="px-3 py-2.5">Expected</th>}
              {v.actual && <th className="px-3 py-2.5">Actual</th>}
              {v.completed && <th className="px-1 py-2.5 text-center">✅</th>}
              {v.domain && <th className="px-3 py-2.5">Domain</th>}
              {v.domainProvider && <th className="px-3 py-2.5">D. Provider</th>}
              {v.hostingProvider && <th className="px-3 py-2.5">H. Provider</th>}
              {v.domainRenewal && <th className="px-3 py-2.5">D. Renewal</th>}
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
                <tr key={lead.id} className={`hover:bg-secondary/50 transition-colors border-b border-border group ${getRowClass(lead)}`}>
                  <td className="px-2 py-2.5 text-center text-xs font-bold text-muted-foreground">{displayIndex + 1}</td>
                  {v.date && <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground text-xs">{lead.date}</td>}
                  {v.business && <td className="px-3 py-2.5 font-medium text-xs">{lead.businessName}</td>}
                  {v.client && <td className="px-3 py-2.5 text-muted-foreground text-xs">{lead.clientName || '-'}</td>}
                  {v.country && <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.country || '-'}</td>}
                  {v.platform && <td className="px-3 py-2.5 text-xs"><span className="bg-secondary border border-border px-1.5 py-0.5 rounded text-[10px]">{lead.platform || '-'}</span></td>}
                  {v.industry && <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.industry || '-'}</td>}
                  {v.contact && <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.contactInfo || '-'}</td>}
                  {v.status && <td className="px-3 py-2.5"><StatusDropdown lead={lead} onStatusChange={onStatusChange} /></td>}
                  {v.pipeline && <>
                    <td className="px-1 py-2.5 text-center"><PipelineToggle checked={lead.contacted} onClick={() => onTogglePipelineField(lead.id, 'contacted', !lead.contacted)} label="Contacted" /></td>
                    <td className="px-1 py-2.5 text-center"><PipelineToggle checked={lead.replied} onClick={() => onTogglePipelineField(lead.id, 'replied', !lead.replied)} label="Replied" /></td>
                    <td className="px-1 py-2.5 text-center"><PipelineToggle checked={lead.demoSent} onClick={() => onTogglePipelineField(lead.id, 'demoSent', !lead.demoSent)} label="Demo Sent" /></td>
                    <td className="px-1 py-2.5 text-center"><PipelineToggle checked={lead.interested} onClick={() => onTogglePipelineField(lead.id, 'interested', !lead.interested)} label="Interested" /></td>
                  </>}
                  {v.followUp && <td className="px-3 py-2.5 text-xs text-muted-foreground"><div className="flex items-center gap-1 whitespace-nowrap">{lead.nextFollowUp || '-'}{isFollowUpDue(lead) && <Bell className="w-3 h-3 text-amber-500 animate-pulse" />}</div></td>}
                  {v.package && <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.packageType || '-'}</td>}
                  {v.type && <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.projectType || '-'}</td>}
                  {v.scope && <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.projectScope || '-'}</td>}
                  {v.final && <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">{lead.finalValue ? `${lead.currency || ''} ${lead.finalValue.toLocaleString()}` : '-'}</td>}
                  {v.lkr && <td className="px-3 py-2.5 font-medium text-emerald-400 text-right text-xs">{lkrValue > 0 ? lkrValue.toLocaleString() : '-'}</td>}
                  {v.method && <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.paymentMethod || '-'}</td>}
                  {v.advance && <td className="px-1 py-2.5 text-center">
                    <button onClick={() => onTogglePayment(lead.id, 'advancePaid')} className="focus:outline-none transition-transform active:scale-95 p-0.5 rounded hover:bg-secondary">
                      {lead.advancePaid ? <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" /> : <Circle className="w-4 h-4 text-muted-foreground hover:text-emerald-400" />}
                    </button>
                  </td>}
                  {v.proof && <td className="px-3 py-2.5 text-center">{lead.advanceProof ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <Minus className="w-3 h-3 text-muted-foreground/40 mx-auto" />}</td>}
                  {v.balance && <td className="px-1 py-2.5 text-center">
                    <button onClick={() => onTogglePayment(lead.id, 'balancePaid')} className="focus:outline-none transition-transform active:scale-95 p-0.5 rounded hover:bg-secondary">
                      {lead.balancePaid ? <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)]" /> : <Circle className="w-4 h-4 text-muted-foreground hover:text-emerald-400" />}
                    </button>
                  </td>}
                  {v.balAmt && <td className="px-3 py-2.5 text-right text-xs text-muted-foreground">{lead.balanceAmount ? `Rs. ${lead.balanceAmount.toLocaleString()}` : '-'}</td>}
                  {v.expenses && <td className="px-3 py-2.5 text-right text-xs text-red-400">{expenses > 0 ? `Rs. ${expenses.toLocaleString()}` : '-'}</td>}
                  {v.netProfit && <td className={`px-3 py-2.5 text-right text-xs font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{lkrValue > 0 ? `Rs. ${netProfit.toLocaleString()}` : '-'}</td>}
                  {v.expected && <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{lead.expectedDelivery || '-'}</td>}
                  {v.actual && <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{lead.actualDelivery || '-'}</td>}
                  {v.completed && <td className="px-1 py-2.5 text-center">{lead.projectCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.6)] mx-auto" /> : <Minus className="w-3 h-3 text-muted-foreground/40 mx-auto" />}</td>}
                  {v.domain && <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.domainName || '-'}</td>}
                  {v.domainProvider && <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.domainProvider || '-'}</td>}
                  {v.hostingProvider && <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.hostingProvider || '-'}</td>}
                  {v.domainRenewal && <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{lead.domainRenewal || '-'}</td>}
                  <td className="px-3 py-2.5 text-center sticky right-0 bg-card group-hover:bg-secondary border-l border-border shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.5)] transition-colors">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" className={`h-7 w-7 ${lead.projectCompleted ? 'bg-emerald-600 text-white' : 'bg-secondary text-muted-foreground hover:text-emerald-400'}`} onClick={() => onToggleCompletion(lead.id)} title="Toggle Completion"><CheckCircle className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-600/50" onClick={() => onGenerateDoc(lead.id)} title="Generate Receipt/Quote"><Printer className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-600/50" onClick={() => onEdit(actualIndex)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/50" onClick={() => onDelete(lead.id)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
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
    </div>
  );
}
