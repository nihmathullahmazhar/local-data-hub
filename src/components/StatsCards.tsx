import { DollarSign, Users, Hourglass, Trophy, TrendingUp, CheckCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalLeads: number;
    contactedCount: number;
    interestedCount: number;
    closedWonCount: number;
    completedProjects: number;
    totalRevenue: number;
    pendingBalance: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return `Rs. ${value.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
      {/* Total Revenue */}
      <div className="stat-card group">
        <div className="stat-card-indicator stat-card-indicator-emerald" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</h3>
          </div>
          <div className="icon-container icon-container-emerald">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />
          <span>Confirmed deals</span>
        </div>
      </div>

      {/* Active Pipeline */}
      <div className="stat-card group">
        <div className="stat-card-indicator stat-card-indicator-blue" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Active Pipeline</p>
            <h3 className="text-2xl font-bold">{stats.totalLeads}</h3>
          </div>
          <div className="icon-container icon-container-blue">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs">
          <span className="bg-orange-500/10 text-orange-300 border border-orange-500/20 px-2 py-0.5 rounded-full font-medium">
            {stats.contactedCount} Contacted
          </span>
          <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium">
            {stats.interestedCount} Interested
          </span>
        </div>
      </div>

      {/* Pending Balance */}
      <div className="stat-card group">
        <div className="stat-card-indicator stat-card-indicator-amber" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Pending Balance</p>
            <h3 className="text-2xl font-bold">{formatCurrency(stats.pendingBalance)}</h3>
          </div>
          <div className="icon-container icon-container-amber">
            <Hourglass className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs">
          <span className="text-amber-500 font-medium animate-pulse">Action Required</span>
        </div>
      </div>

      {/* Closed Won */}
      <div className="stat-card group">
        <div className="stat-card-indicator stat-card-indicator-primary" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Closed Won</p>
            <h3 className="text-2xl font-bold">{stats.closedWonCount}</h3>
          </div>
          <div className="icon-container icon-container-primary">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <CheckCircle className="w-3 h-3 mr-1 text-primary" />
          <span>{stats.completedProjects} Projects Delivered</span>
        </div>
      </div>
    </div>
  );
}
