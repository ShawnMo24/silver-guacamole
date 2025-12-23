import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock } from "lucide-react";

interface DangerBannerProps {
  isActive: boolean;
  incidentId: string;
  incidentTitle: string;
  startTime: Date;
  className?: string;
}

export function DangerBanner({ isActive, incidentId, incidentTitle, startTime, className }: DangerBannerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    
    const updateElapsed = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsed(diff);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  if (!isActive) return null;

  const criticalWindow = 5 * 60;
  const remaining = Math.max(0, criticalWindow - elapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = (remaining / criticalWindow) * 100;

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b-2 border-danger bg-danger/10 transition-all duration-500",
        className
      )}
      data-testid="danger-banner"
    >
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-danger/20">
            <AlertTriangle className="h-4 w-4 text-danger" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-danger">
              Priority Response
            </span>
            <span className="text-sm font-medium text-foreground">
              {incidentTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-xs font-mono text-muted-foreground">
            ID: {incidentId}
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-danger" />
              <span className="text-xs font-semibold uppercase tracking-wider text-danger">
                Response Window
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-danger transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-mono font-semibold text-danger tabular-nums min-w-[4rem]">
                {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
