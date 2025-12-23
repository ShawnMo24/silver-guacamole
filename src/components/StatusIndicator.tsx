import { cn } from "@/lib/utils";

type StatusType = "online" | "active" | "pending" | "warning" | "offline";

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showPulse?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, { color: string; bg: string; pulseColor: string }> = {
  online: {
    color: "bg-stable",
    bg: "bg-stable/10",
    pulseColor: "bg-stable/50",
  },
  active: {
    color: "bg-mrsg-cyan",
    bg: "bg-mrsg-cyan/10",
    pulseColor: "bg-mrsg-cyan/50",
  },
  pending: {
    color: "bg-escalating",
    bg: "bg-escalating/10",
    pulseColor: "bg-escalating/50",
  },
  warning: {
    color: "bg-escalating",
    bg: "bg-escalating/10",
    pulseColor: "bg-escalating/50",
  },
  offline: {
    color: "bg-muted-foreground/50",
    bg: "bg-muted/30",
    pulseColor: "bg-muted-foreground/30",
  },
};

export function StatusIndicator({ status, label, showPulse = true, className }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)} data-testid={`status-indicator-${status}`}>
      <div className="relative flex items-center justify-center">
        <span className={cn("h-2 w-2 rounded-full", config.color)} />
        {showPulse && status !== "offline" && (
          <span className={cn("absolute h-2 w-2 rounded-full animate-ping opacity-75", config.pulseColor)} />
        )}
      </div>
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
