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

  const getRowClass = (lead: Lead) => {
    if (lead.leadStatus === 'Closed-Lost') return 'bg-red-950/30 border-red-900/30';
    if (lead.leadStatus === 'Closed-Won') return 'bg-emerald-950/30 border-emerald-900/30';
    if (lead.projectCompleted) return 'opacity-60 bg-card/30';
    return '';
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

  const getTotalExpenses = (lead: Lead) => {
    return (lead.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  };

  const getNetProfit = (lead: Lead) => {
    const revenue = lead.amountInLKR || lead.finalValue || 0;
    return revenue - getTotalExpenses(lead);
  };

  return (
    <div className="table-wrapper">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-secondary/80 text-muted-foreground">
          <tr>
            <th className="px-3 py-3 text-center w-12">#</th>
            <th className="px-4 py-3 whitespace-nowrap">Date</th>
            <th className="px-4 py-3">Business</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Platform</th>
            <th className="px-4 py-3 text-right">Value (LKR)</th>
            <th className="px-4 py-3 text-right">Expenses</th>
            <th className="px-4 py-3 text-right">Net Profit</th>
            <th className="px-2 py-3 text-center">Adv</th>
            <th className="px-2 py-3 text-center">Bal</th>
            <th className="px-2 py-3 text-center">✅</th>
            <th className="px-4 py-3">Follow-up</th>
            <th className="px-4 py-3 text-center sticky right-0 bg-secondary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, displayIndex) => {
            const actualIndex = allLeads.findIndex(l => l.id === lead.id);
            const originalIndex = lead.id; // Use ID-based numbering
            const lkrValue = lead.amountInLKR || lead.finalValue || 0;
            const expenses = getTotalExpenses(lead);
            const netProfit = getNetProfit(lead);

            return (
              <tr 
                key={lead.id}
                className={`hover:bg-secondary/50 transition-colors border-b border-border group ${getRowClass(lead)}`}
              >
                <td className="px-3 py-3 text-center text-xs font-bold text-muted-foreground">
                  {displayIndex + 1}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">{lead.date}</td>
                <td className="px-4 py-3 font-medium">{lead.businessName}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.clientName || '-'}</td>
                
                <td className="px-4 py-3">
                  <span className={`status-badge ${getStatusClass(lead.leadStatus)}`}>
                    {lead.leadStatus}
                  </span>
                </td>

                <td className="px-4 py-3 text-xs">
                  <span className="bg-secondary border border-border px-2 py-1 rounded">
                    {lead.platform || '-'}
                  </span>
                </td>

                <td className="px-4 py-3 font-medium text-emerald-400 text-right text-xs">
                  Rs. {lkrValue.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-xs text-red-400">
                  {expenses > 0 ? `Rs. ${expenses.toLocaleString()}` : '-'}
                </td>
                <td className={`px-4 py-3 text-right text-xs font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  Rs. {netProfit.toLocaleString()}
                </td>
                
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

                <td className="px-2 py-3 text-center"><CheckIcon checked={lead.projectCompleted} /></td>

                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    {lead.nextFollowUp || '-'}
                    {isFollowUpDue(lead) && (
                      <Bell className="w-3 h-3 text-amber-500 animate-pulse" />
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 text-center sticky right-0 bg-card group-hover:bg-secondary border-l border-border shadow-[-10px_0_15px_-5px_rgba(0,0,0,0.5)] transition-colors">
                  <div className="flex items-center justify-center gap-1">
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
