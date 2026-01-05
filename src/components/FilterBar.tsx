import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, List, LayoutGrid } from 'lucide-react';

interface FilterBarProps {
  statusFilter: string;
  searchText: string;
  view: 'list' | 'kanban';
  recordCount: number;
  onStatusChange: (status: string) => void;
  onSearchChange: (text: string) => void;
  onViewChange: (view: 'list' | 'kanban') => void;
}

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Replied', label: 'Replied' },
  { value: 'Demo Sent', label: 'Demo Sent' },
  { value: 'Negotiating', label: 'Negotiating' },
  { value: 'Closed-Won', label: 'Closed-Won' },
  { value: 'Closed-Lost', label: 'Closed-Lost' },
  { value: 'Follow-up Later', label: 'Follow-up Later' },
];

export function FilterBar({
  statusFilter,
  searchText,
  view,
  recordCount,
  onStatusChange,
  onSearchChange,
  onViewChange,
}: FilterBarProps) {
  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/10 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between animate-fade-in">
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* View Toggle */}
        <div className="flex bg-secondary p-1 rounded-lg border border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 ${view === 'list' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'}`}
            onClick={() => onViewChange('list')}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`px-3 ${view === 'kanban' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'}`}
            onClick={() => onViewChange('kanban')}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Kanban
          </Button>
        </div>

        {/* Status Filter */}
        <Select value={statusFilter || 'all'} onValueChange={(v) => onStatusChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px] bg-secondary border-border">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search business or client..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-secondary border-border"
          />
        </div>
      </div>

      {/* Record Count */}
      <div className="text-sm text-muted-foreground font-medium">
        {recordCount} Records
      </div>
    </div>
  );
}
