import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface PipelineChartProps {
  data: {
    labels: string[];
    data: number[];
  };
}

const COLORS = [
  'hsl(217, 91%, 60%)',  // Blue - New
  'hsl(25, 95%, 53%)',   // Orange - Contacted
  'hsl(270, 76%, 60%)',  // Purple - Demo Sent
  'hsl(38, 92%, 50%)',   // Amber - Negotiating
  'hsl(160, 84%, 39%)',  // Emerald - Closed-Won
  'hsl(0, 72%, 51%)',    // Red - Closed-Lost
];

export function PipelineChart({ data }: PipelineChartProps) {
  const chartData = data.labels.map((label, idx) => ({
    name: label,
    value: data.data[idx],
    color: COLORS[idx],
  }));

  return (
    <div className="lg:col-span-2 bg-card/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/5 relative">
      <h3 className="text-muted-foreground text-xs font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        Pipeline Health
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(222, 47%, 8%)',
                border: '1px solid hsl(217, 33%, 17%)',
                borderRadius: '8px',
                color: '#fff',
              }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
