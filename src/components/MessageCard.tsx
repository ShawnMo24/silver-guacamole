import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { PrivacyBadge } from "./PrivacyBadge";

type Priority = "high" | "medium" | "low";
type Source = "dispatcher" | "responder" | "citizen";

interface MessageCardProps {
  id: string;
  source: Source;
  destination?: Source;
  content: string;
  timestamp: string;
  priority?: Priority;
  isOptedIn?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const priorityConfig: Record<Priority, { border: string; badge: string; label: string }> = {
  high: { border: "border-l-danger", badge: "bg-danger/10 text-danger", label: "Urgent" },
  medium: { border: "border-l-escalating", badge: "bg-escalating/10 text-escalating", label: "Escalating" },
  low: { border: "border-l-stable", badge: "bg-stable/10 text-stable", label: "Stable" },
};

const sourceLabels: Record<Source, string> = {
  dispatcher: "DISPATCH",
  responder: "RESPONSE",
  citizen: "CITIZEN",
};

export function MessageCard({
  id,
  source,
  destination,
  content,
  timestamp,
  priority = "low",
  isOptedIn,
  isSelected,
  onClick,
  className,
}: MessageCardProps) {
  const config = priorityConfig[priority];

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-lg border bg-card/60 p-4 transition-all duration-200",
        "border-l-2",
        config.border,
        isSelected
          ? "border-mrsg-cyan ring-1 ring-mrsg-cyan/50 bg-mrsg-cyan/5"
          : "border-card-border hover:border-mrsg-cyan/30",
        onClick && "cursor-pointer",
        className
      )}
      data-testid={`message-card-${id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-mrsg-cyan">
            {sourceLabels[source]}
          </span>
          {destination && (
            <>
              <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {sourceLabels[destination]}
              </span>
            </>
          )}
          {source === "citizen" && isOptedIn !== undefined && (
            <PrivacyBadge isOptedIn={isOptedIn} />
          )}
        </div>
        <span className="text-xs font-mono text-muted-foreground shrink-0">
          {timestamp}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-card-foreground line-clamp-2">
        {content}
      </p>

      <div className="flex items-center justify-between mt-3 gap-2">
        <span className="text-xs font-mono text-muted-foreground/70">
          ID: {id}
        </span>
        <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold uppercase", config.badge)}>
          {config.label}
        </span>
      </div>
    </div>
  );
}
