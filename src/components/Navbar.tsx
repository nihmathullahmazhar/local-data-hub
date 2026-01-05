import { 
  Rocket, 
  FileSpreadsheet, 
  HardDrive, 
  Plus, 
  Bell, 
  ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { storage } from '@/lib/storage';
import { Lead, Reminder } from '@/types/lead';
import { useState } from 'react';

interface NavbarProps {
  onAddLead: () => void;
  leads: Lead[];
  reminders: Reminder[];
  onExport: () => void;
  onBackup: () => void;
}

export function Navbar({ onAddLead, leads, reminders, onExport, onBackup }: NavbarProps) {
  const [reminderOpen, setReminderOpen] = useState(false);

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'followup': return '📞';
      case 'domain': return '🌐';
      case 'hosting': return '🖥️';
      case 'balance': return '💰';
      default: return '🔔';
    }
  };

  const getReminderText = (reminder: Reminder) => {
    switch (reminder.type) {
      case 'followup':
        return reminder.daysOverdue === 0 
          ? 'Follow-up due TODAY' 
          : `Follow-up ${reminder.daysOverdue} days overdue`;
      case 'domain':
        return `Domain expires in ${reminder.daysUntil} days`;
      case 'hosting':
        return `Hosting expires in ${reminder.daysUntil} days`;
      case 'balance':
        return 'Balance payment pending';
      default:
        return 'Reminder';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'medium': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      default: return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel">
      <div className="max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg shadow-[var(--shadow-glow-primary)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Rocket className="w-5 h-5 text-primary-foreground relative z-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Gododal<span className="text-primary">CRM</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                Command Center
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={onExport}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={onBackup}
            >
              <HardDrive className="w-4 h-4 mr-2" />
              Backup
            </Button>

            <Button
              onClick={onAddLead}
              className="bg-primary hover:bg-primary/90 btn-glow-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New Lead</span>
            </Button>

            {/* Reminders */}
            <DropdownMenu open={reminderOpen} onOpenChange={setReminderOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="w-4 h-4" />
                  {reminders.length > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-[10px] animate-pulse"
                    >
                      {reminders.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 max-h-[500px] overflow-y-auto bg-card border-border">
                <div className="p-4 border-b border-border flex justify-between items-center bg-secondary">
                  <h3 className="font-bold flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    Reminders
                  </h3>
                </div>
                <div className="p-3 space-y-2">
                  {reminders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No pending reminders 🎉
                    </p>
                  ) : (
                    reminders.map((reminder, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg border ${getPriorityColor(reminder.priority)}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{getReminderIcon(reminder.type)}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{reminder.lead.businessName}</p>
                            <p className="text-xs opacity-80">{getReminderText(reminder)}</p>
                          </div>
                          {reminder.priority === 'high' && (
                            <Badge variant="destructive" className="text-[10px]">URGENT</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
