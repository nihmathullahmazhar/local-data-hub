import { useState, useMemo } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { useReminders } from '@/hooks/useReminders';
import { Navbar } from '@/components/Navbar';
import { StatsCards } from '@/components/StatsCards';
import { PipelineChart } from '@/components/PipelineChart';
import { ActivityLog } from '@/components/ActivityLog';
import { FilterBar } from '@/components/FilterBar';
import { LeadsTable } from '@/components/LeadsTable';
import { KanbanBoard } from '@/components/KanbanBoard';
import { LeadModal } from '@/components/LeadModal';
import { DocModal } from '@/components/DocModal';
import { storage } from '@/lib/storage';
import { Lead, LeadStatus } from '@/types/lead';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const Index = () => {
  const {
    leads,
    activities,
    stats,
    pipelineData,
    addLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    togglePayment,
    toggleCompletion,
    togglePipelineField,
    getFilteredLeads,
  } = useLeads();

  const { reminders } = useReminders(leads);

  // UI State
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docLeadId, setDocLeadId] = useState<number | null>(null);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return getFilteredLeads(statusFilter, searchText);
  }, [getFilteredLeads, statusFilter, searchText]);

  // Trigger confetti
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() - 0.2 },
      });
    }, 250);
  };

  // Handlers
  const handleAddLead = () => {
    setEditingIndex(null);
    setModalOpen(true);
  };

  const handleEditLead = (index: number) => {
    setEditingIndex(index);
    setModalOpen(true);
  };

  const handleSaveLead = (leadData: Omit<Lead, 'id'>) => {
    addLead(leadData);
    toast.success('Lead added successfully!');
  };

  const handleUpdateLead = (id: number, updates: Partial<Lead>) => {
    updateLead(id, updates);
    toast.success('Lead updated successfully!');
  };

  const handleDeleteLead = (id: number) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteLead(id);
      toast.success('Lead deleted successfully');
    }
  };

  const handleTogglePayment = (id: number, field: 'advancePaid' | 'balancePaid') => {
    togglePayment(id, field);
    const lead = leads.find(l => l.id === id);
    if (lead) {
      const newValue = !lead[field];
      if (newValue) {
        triggerConfetti();
        toast.success(`💰 ${field === 'advancePaid' ? 'Advance' : 'Balance'} marked as Paid!`);
      }
    }
  };

  const handleToggleCompletion = (id: number) => {
    const success = toggleCompletion(id);
    if (!success) {
      toast.error('Cannot complete: Balance Unpaid!');
    } else {
      const lead = leads.find(l => l.id === id);
      if (lead && !lead.projectCompleted) {
        triggerConfetti();
        toast.success('🎉 Project Completed!');
      }
    }
  };

  const handleStatusChange = (id: number, status: LeadStatus) => {
    updateLeadStatus(id, status);
    if (status === 'Closed-Won') {
      triggerConfetti();
      toast.success('🎉 Deal Won!');
    } else {
      toast.success(`Moved to ${status}`);
    }
  };

  const handleGenerateDoc = (id: number) => {
    setDocLeadId(id);
    setDocModalOpen(true);
  };

  const handleExport = () => {
    if (leads.length === 0) {
      toast.error('No data to export');
      return;
    }
    storage.exportToCSV(leads);
    toast.success('CSV Exported!');
  };

  const handleBackup = () => {
    storage.exportToJSON(leads);
    toast.success('Backup downloaded!');
  };

  const editingLead = editingIndex !== null ? leads[editingIndex] : null;
  const docLead = docLeadId !== null ? leads.find(l => l.id === docLeadId) : null;

  return (
    <div className="min-h-screen">
      <Navbar
        onAddLead={handleAddLead}
        leads={leads}
        reminders={reminders}
        onExport={handleExport}
        onBackup={handleBackup}
      />

      <main className="max-w-[98%] mx-auto px-2 sm:px-6 py-8">
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <PipelineChart data={pipelineData} />
          <ActivityLog activities={activities} />
        </div>

        {/* Filter Bar */}
        <FilterBar
          statusFilter={statusFilter}
          searchText={searchText}
          view={view}
          recordCount={filteredLeads.length}
          onStatusChange={setStatusFilter}
          onSearchChange={setSearchText}
          onViewChange={setView}
        />

        {/* Table or Kanban View */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {view === 'list' ? (
            <LeadsTable
              leads={filteredLeads}
              allLeads={leads}
              onEdit={handleEditLead}
              onDelete={handleDeleteLead}
              onTogglePayment={handleTogglePayment}
              onToggleCompletion={handleToggleCompletion}
              onTogglePipelineField={togglePipelineField}
              onGenerateDoc={handleGenerateDoc}
            />
          ) : (
            <KanbanBoard
              leads={leads}
              allLeads={leads}
              onEdit={handleEditLead}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 py-6 text-center border-t border-border">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} <span className="font-bold">Nihmathullah</span> Web Services • 
            <span className="ml-2">Built with ❤️ for Freelancers & Agencies</span>
          </p>
        </footer>
      </main>

      {/* Lead Modal */}
      <LeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveLead}
        onUpdate={handleUpdateLead}
        editingLead={editingLead}
      />

      {/* Document Modal */}
      <DocModal
        open={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        lead={docLead || null}
      />
    </div>
  );
};

export default Index;
