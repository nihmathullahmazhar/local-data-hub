import { useState, useRef } from 'react';
import { Lead, LeadStatus } from '@/types/lead';
import { Pencil, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanBoardProps {
  leads: Lead[];
  onEdit: (index: number) => void;
  onStatusChange: (id: number, status: LeadStatus) => void;
  allLeads: Lead[];
}

const COLUMNS: { id: LeadStatus; color: string; emoji: string }[] = [
  { id: 'New', color: 'blue', emoji: '🆕' },
  { id: 'Contacted', color: 'orange', emoji: '📞' },
  { id: 'Demo Sent', color: 'purple', emoji: '🎬' },
  { id: 'Negotiating', color: 'amber', emoji: '🤝' },
  { id: 'Closed-Won', color: 'emerald', emoji: '🏆' },
  { id: 'Closed-Lost', color: 'red', emoji: '❌' },
];

export function KanbanBoard({ leads, onEdit, onStatusChange, allLeads }: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<LeadStatus | null>(null);

  // Touch drag state
  const touchStartRef = useRef<{ id: number; startX: number; startY: number } | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData('leadId', leadId.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(leadId);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(status);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    const leadId = parseInt(e.dataTransfer.getData('leadId'));
    if (!isNaN(leadId)) {
      onStatusChange(leadId, status);
    }
    setDraggedId(null);
    setDropTarget(null);
  };

  // Touch handling for mobile drag-drop
  const handleTouchStart = (e: React.TouchEvent, leadId: number) => {
    const touch = e.touches[0];
    touchStartRef.current = { id: leadId, startX: touch.clientX, startY: touch.clientY };
    setDraggedId(leadId);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const column = element?.closest('[data-status]');
    if (column) {
      const status = column.getAttribute('data-status') as LeadStatus;
      if (status) {
        onStatusChange(touchStartRef.current.id, status);
      }
    }
    touchStartRef.current = null;
    setDraggedId(null);
    setDropTarget(null);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { dot: string; border: string; dropBg: string }> = {
      blue: { dot: 'bg-blue-500', border: 'hover:border-blue-500/50', dropBg: 'bg-blue-500/10 border-blue-500/50' },
      orange: { dot: 'bg-orange-500', border: 'hover:border-orange-500/50', dropBg: 'bg-orange-500/10 border-orange-500/50' },
      purple: { dot: 'bg-purple-500', border: 'hover:border-purple-500/50', dropBg: 'bg-purple-500/10 border-purple-500/50' },
      amber: { dot: 'bg-amber-500', border: 'hover:border-amber-500/50', dropBg: 'bg-amber-500/10 border-amber-500/50' },
      emerald: { dot: 'bg-emerald-500', border: 'hover:border-emerald-500/50', dropBg: 'bg-emerald-500/10 border-emerald-500/50' },
      red: { dot: 'bg-red-500', border: 'hover:border-red-500/50', dropBg: 'bg-red-500/10 border-red-500/50' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
      {COLUMNS.map(col => {
        const colLeads = leads.filter(l => l.leadStatus === col.id);
        const colorClasses = getColorClasses(col.color);
        const isDropping = dropTarget === col.id;

        return (
          <div 
            key={col.id}
            data-status={col.id}
            className={`kanban-column w-64 md:w-72 flex-shrink-0 snap-center flex flex-col bg-secondary/50 rounded-xl border transition-all duration-200 h-[500px] md:h-[600px] ${
              isDropping ? colorClasses.dropBg : 'border-border'
            }`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-border flex justify-between items-center bg-secondary/90 backdrop-blur-md rounded-t-xl">
              <h3 className="font-bold text-xs flex items-center gap-2">
                <span>{col.emoji}</span>
                <span className="hidden md:inline">{col.id}</span>
                <span className="md:hidden text-[10px]">{col.id.split('-')[0]}</span>
              </h3>
              <span className="text-xs font-bold bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                {colLeads.length}
              </span>
            </div>

            {/* Cards */}
            <div className="p-2 flex-1 overflow-y-auto space-y-2">
              {colLeads.map(lead => {
                const actualIndex = allLeads.findIndex(l => l.id === lead.id);
                const isDragging = draggedId === lead.id;
                const lkrValue = lead.amountInLKR || lead.finalValue || 0;
                
                return (
                  <div
                    key={lead.id}
                    className={`kanban-card bg-card p-3 rounded-lg shadow-sm border border-border ${colorClasses.border} relative group transition-all ${
                      isDragging ? 'opacity-50 scale-95 border-dashed border-primary' : ''
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, lead.id)}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <GripVertical className="w-3 h-3 text-muted-foreground/50 flex-shrink-0 cursor-grab" />
                        <h4 className="font-bold text-xs truncate">{lead.businessName}</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => onEdit(actualIndex)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2 pl-4">
                      {lead.clientName || 'No Contact'}
                    </p>
                    <div className="flex justify-between items-center text-[10px] pl-4">
                      <span className="text-emerald-400 font-medium">
                        Rs. {lkrValue.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(lead.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {colLeads.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-xs border-2 border-dashed border-border rounded-lg">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
