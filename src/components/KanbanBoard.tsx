import { Lead, LeadStatus } from '@/types/lead';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanBoardProps {
  leads: Lead[];
  onEdit: (index: number) => void;
  onStatusChange: (id: number, status: LeadStatus) => void;
  allLeads: Lead[];
}

const COLUMNS: { id: LeadStatus; color: string }[] = [
  { id: 'New', color: 'blue' },
  { id: 'Contacted', color: 'orange' },
  { id: 'Demo Sent', color: 'purple' },
  { id: 'Negotiating', color: 'amber' },
  { id: 'Closed-Won', color: 'emerald' },
  { id: 'Closed-Lost', color: 'red' },
];

export function KanbanBoard({ leads, onEdit, onStatusChange, allLeads }: KanbanBoardProps) {
  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData('leadId', leadId.toString());
    (e.target as HTMLElement).classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    const leadId = parseInt(e.dataTransfer.getData('leadId'));
    onStatusChange(leadId, status);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { dot: string; border: string }> = {
      blue: { dot: 'bg-blue-500', border: 'hover:border-blue-500/50' },
      orange: { dot: 'bg-orange-500', border: 'hover:border-orange-500/50' },
      purple: { dot: 'bg-purple-500', border: 'hover:border-purple-500/50' },
      amber: { dot: 'bg-amber-500', border: 'hover:border-amber-500/50' },
      emerald: { dot: 'bg-emerald-500', border: 'hover:border-emerald-500/50' },
      red: { dot: 'bg-red-500', border: 'hover:border-red-500/50' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map(col => {
        const colLeads = leads.filter(l => l.leadStatus === col.id);
        const colorClasses = getColorClasses(col.color);

        return (
          <div 
            key={col.id}
            className="kanban-column w-72 flex-shrink-0 flex flex-col bg-secondary/50 rounded-xl border border-border h-[600px]"
          >
            {/* Column Header */}
            <div className="p-3 border-b border-border flex justify-between items-center sticky top-0 bg-secondary/90 backdrop-blur-md rounded-t-xl z-10">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colorClasses.dot}`} />
                {col.id}
              </h3>
              <span className="text-xs font-medium bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                {colLeads.length}
              </span>
            </div>

            {/* Cards Container */}
            <div 
              className="p-3 flex-1 overflow-y-auto space-y-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {colLeads.map(lead => {
                const actualIndex = allLeads.findIndex(l => l.id === lead.id);
                
                return (
                  <div
                    key={lead.id}
                    className={`kanban-card bg-card p-3 rounded-lg shadow-sm border border-border ${colorClasses.border} relative group`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm truncate pr-2">{lead.businessName}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onEdit(actualIndex)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {lead.clientName || 'No Contact'}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-emerald-400 font-medium">
                        Rs. {(lead.finalValue || 0).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(lead.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {colLeads.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
