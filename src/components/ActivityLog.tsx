import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, Circle } from "lucide-react";

type ActivityType = "incoming" | "outgoing" | "system";

interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: string;
  channel?: string;
}

interface ActivityLogProps {
  activities: Activity[];
  className?: string;
}

const typeConfig: Record<ActivityType, { icon: typeof Circle; color: string }> = {
  incoming: { icon: ArrowDownLeft, color: "text-stable" },
  outgoing: { icon: ArrowUpRight, color: "text-mrsg-cyan" },
  system: { icon: Circle, color: "text-muted-foreground" },
};

export function ActivityLog({ activities, className }: ActivityLogProps) {
  return (
    <div className={cn("flex flex-col h-full", className)} data-testid="activity-log">
      <div className="flex items-center justify-between pb-3 border-b border-mrsg-cyan/20">
        <span className="text-xs font-semibold uppercase tracking-wider text-mrsg-cyan">
          Activity Log
        </span>
        <span className="text-xs font-mono text-muted-foreground/70">
          {activities.length} events
        </span>
      </div>

      <ScrollArea className="flex-1 mt-3">
        <div className="space-y-1">
          {activities.map((activity) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-2 py-2 px-1 rounded transition-colors duration-150"
              >
                <Icon className={cn("h-3 w-3 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-card-foreground/90 line-clamp-1">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground/60">
                      {activity.timestamp}
                    </span>
                    {activity.channel && (
                      <>
                        <span className="text-[10px] text-muted-foreground/40">|</span>
                        <span className="text-[10px] font-mono uppercase text-mrsg-cyan/60">
                          {activity.channel}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
