import { Activity } from '@/types/lead';
import { Activity as ActivityIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ActivityLogProps {
  activities: Activity[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'plus-circle': LucideIcons.PlusCircle,
      'pencil': LucideIcons.Pencil,
      'trash-2': LucideIcons.Trash2,
      'arrow-right-circle': LucideIcons.ArrowRightCircle,
      'dollar-sign': LucideIcons.DollarSign,
      'check-circle': LucideIcons.CheckCircle,
      'circle': LucideIcons.Circle,
    };
    const Icon = iconMap[iconName] || LucideIcons.Circle;
    return Icon;
  };

  return (
    <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/5 relative flex flex-col h-[340px]">
      <h3 className="text-muted-foreground text-xs font-bold mb-4 uppercase tracking-wider flex items-center gap-2">
        <ActivityIcon className="w-4 h-4 text-emerald-500" />
        Recent Activity
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center mt-10">
            No recent activity.
          </p>
        ) : (
          activities.map((act, idx) => {
            const Icon = getIcon(act.icon);
            const date = new Date(act.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString();

            return (
              <div 
                key={idx}
                className="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <div className="mt-1">
                  <Icon className={`w-4 h-4 ${act.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{act.action}</p>
                  <p className="text-xs text-muted-foreground">{act.details}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {dateStr} at {timeStr}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
