import { DollarSign, Users, Hourglass, Trophy, TrendingUp, CheckCircle, TrendingDown, PieChart, Target, Receipt } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalLeads: number;
    contactedCount: number;
    interestedCount: number;
    closedWonCount: number;
    closedLostCount: number;
    completedProjects: number;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    pendingBalance: number;
    conversionRate: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (value: number) => `Rs. ${value.toLocaleString()}`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 animate-fade-in">
      {/* Total Revenue */}
      <div className="stat-card group">
        <div className="stat-card-indicator stat-card-indicator-emerald" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-1">Revenue</p>
            <h3 className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</h3>
          </div>
          <div className="icon-container icon-container-emerald !p-2">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Expenses */}
      <div className="stat-card group">
        <div className="stat-card-indicator" style={{ background: 'hsl(0, 72%, 51%)' }} />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-1">Expenses</p>
            <h3 className="text-lg font-bold text-red-400">{formatCurrency(stats.totalExpenses)}</h3>
          </div>
          <div className="icon-container !p-2" style={{ background: 'hsl(0, 72%, 51%, 0.1)', color: 'hsl(0, 72%, 60%)' }}>
            <Receipt className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Net Profit */}
      <div className="stat-card group">
        <div className="stat-card-indicator stat-card-indicator-emerald" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-1">Net Profit</p>
            <h3 className={`text-lg font-bold ${stats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(stats.netProfit)}
            </h3>
          </div>
          <div className="icon-container icon-container-emerald !p-2">
            {stats.netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Pending Balance */}
      <div className="stat-card group">
        <div className="stat-card-indicator stat-card-indicator-amber" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-1">Pending</p>
            <h3 className="text-lg font-bold">{formatCurrency(stats.pendingBalance)}</h3>
          </div>
          <div className="icon-container icon-container-amber !p-2">
            <Hourglass className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="stat-card group">
        <div className="stat-card-indicator stat-card-indicator-blue" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-1">Pipeline</p>
            <h3 className="text-lg font-bold">{stats.totalLeads}</h3>
          </div>
          <div className="icon-container icon-container-blue !p-2">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px]">
          <span className="text-emerald-400">{stats.closedWonCount}W</span>
          <span className="text-red-400">{stats.closedLostCount}L</span>
          <span className="text-muted-foreground">{stats.conversionRate}%</span>
        </div>
      </div>

      {/* Completed */}
      <div className="stat-card group">
        <div className="stat-card-indicator stat-card-indicator-primary" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground mb-1">Delivered</p>
            <h3 className="text-lg font-bold">{stats.completedProjects}</h3>
          </div>
          <div className="icon-container icon-container-primary !p-2">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
