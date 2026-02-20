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
  { value: 'all', label: 'All' },
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Demo Sent', label: 'Demo' },
  { value: 'Negotiating', label: 'Negotiating' },
  { value: 'Closed-Won', label: 'Won' },
  { value: 'Closed-Lost', label: 'Lost' },
  { value: 'Follow-up Later', label: 'Follow-up' },
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
    <div className="bg-card/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/10 p-3 mb-4 flex flex-col md:flex-row gap-3 items-center justify-between animate-fade-in">
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {/* View Toggle */}
        <div className="flex bg-secondary p-0.5 rounded-lg border border-border">
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 h-7 text-xs ${view === 'list' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'}`}
            onClick={() => onViewChange('list')}
          >
            <List className="w-3.5 h-3.5 mr-1" />
            List
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 h-7 text-xs ${view === 'kanban' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground'}`}
            onClick={() => onViewChange('kanban')}
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-1" />
            Board
          </Button>
        </div>

        <Select value={statusFilter || 'all'} onValueChange={(v) => onStatusChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[130px] h-8 bg-secondary border-border text-xs">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 bg-secondary border-border text-xs"
          />
        </div>
      </div>

      <div className="text-xs text-muted-foreground font-medium whitespace-nowrap">
        {recordCount} Records
      </div>
    </div>
  );
}
