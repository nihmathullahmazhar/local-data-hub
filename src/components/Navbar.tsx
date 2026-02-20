import { 
  Rocket, 
  FileSpreadsheet, 
  HardDrive, 
  Plus, 
  Bell, 
  Database,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Lead, Reminder } from '@/types/lead';
import { useState } from 'react';
import { DatabaseConfigModal } from './DatabaseConfig';

interface NavbarProps {
  onAddLead: () => void;
  leads: Lead[];
  reminders: Reminder[];
  onExport: () => void;
  onBackup: () => void;
}

export function Navbar({ onAddLead, leads, reminders, onExport, onBackup }: NavbarProps) {
  const [reminderOpen, setReminderOpen] = useState(false);
  const [dbConfigOpen, setDbConfigOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        return reminder.daysOverdue === 0 ? 'Follow-up due TODAY' : `Follow-up ${reminder.daysOverdue} days overdue`;
      case 'domain': return `Domain expires in ${reminder.daysUntil} days`;
      case 'hosting': return `Hosting expires in ${reminder.daysUntil} days`;
      case 'balance': return 'Balance payment pending';
      default: return 'Reminder';
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
      <div className="max-w-[98%] mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg shadow-[var(--shadow-glow-primary)]">
              <Rocket className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-bold">
                NWS<span className="hidden md:inline text-primary"> CRM</span>
              </h1>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExport}>
              <FileSpreadsheet className="w-4 h-4 mr-1" />Export
            </Button>
            <Button variant="outline" size="sm" onClick={onBackup}>
              <HardDrive className="w-4 h-4 mr-1" />Backup
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDbConfigOpen(true)}>
              <Database className="w-4 h-4 mr-1" />DB
            </Button>
            <Button onClick={onAddLead} className="bg-primary hover:bg-primary/90 btn-glow-primary">
              <Plus className="w-4 h-4 mr-1" />New Lead
            </Button>
            
            {/* Reminders */}
            <DropdownMenu open={reminderOpen} onOpenChange={setReminderOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="w-4 h-4" />
                  {reminders.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-[9px] animate-pulse">
                      {reminders.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto bg-card border-border">
                <div className="p-3 border-b border-border bg-secondary">
                  <h3 className="font-bold text-sm flex items-center gap-2"><Bell className="w-3 h-3 text-amber-500" />Reminders</h3>
                </div>
                <div className="p-2 space-y-1">
                  {reminders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4 text-sm">No pending reminders 🎉</p>
                  ) : (
                    reminders.map((reminder, idx) => (
                      <div key={idx} className={`p-2 rounded-lg border text-xs ${getPriorityColor(reminder.priority)}`}>
                        <div className="flex items-start gap-2">
                          <span>{getReminderIcon(reminder.type)}</span>
                          <div className="flex-1">
                            <p className="font-medium">{reminder.lead.businessName}</p>
                            <p className="opacity-80">{getReminderText(reminder)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <Button onClick={onAddLead} size="sm" className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
            </Button>
            
            {/* Mobile reminder bell */}
            <DropdownMenu open={reminderOpen} onOpenChange={setReminderOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative h-8 w-8">
                  <Bell className="w-3.5 h-3.5" />
                  {reminders.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-[9px]">
                      {reminders.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 max-h-[300px] overflow-y-auto bg-card border-border">
                <div className="p-2 space-y-1">
                  {reminders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-3 text-xs">No reminders 🎉</p>
                  ) : (
                    reminders.map((reminder, idx) => (
                      <div key={idx} className={`p-2 rounded border text-xs ${getPriorityColor(reminder.priority)}`}>
                        <span>{getReminderIcon(reminder.type)}</span> {reminder.lead.businessName}: {getReminderText(reminder)}
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-3 flex flex-col gap-2 border-t border-border pt-3 animate-fade-in">
            <Button variant="outline" size="sm" onClick={() => { onExport(); setMobileMenuOpen(false); }} className="justify-start">
              <FileSpreadsheet className="w-4 h-4 mr-2" />Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => { onBackup(); setMobileMenuOpen(false); }} className="justify-start">
              <HardDrive className="w-4 h-4 mr-2" />Backup JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setDbConfigOpen(true); setMobileMenuOpen(false); }} className="justify-start">
              <Database className="w-4 h-4 mr-2" />Database Config
            </Button>
          </div>
        )}
      </div>

      <DatabaseConfigModal open={dbConfigOpen} onClose={() => setDbConfigOpen(false)} />
    </nav>
  );
}
