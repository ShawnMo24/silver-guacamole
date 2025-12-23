import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface PrivacyBadgeProps {
  isOptedIn: boolean;
  className?: string;
}

export function PrivacyBadge({ isOptedIn, className }: PrivacyBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide",
        isOptedIn
          ? "bg-mrsg-cyan/10 text-mrsg-cyan border border-mrsg-cyan/20"
          : "bg-muted text-muted-foreground border border-border/50",
        className
      )}
      data-testid={`privacy-badge-${isOptedIn ? "opted-in" : "anonymous"}`}
    >
      {isOptedIn ? (
        <>
          <Eye className="h-2.5 w-2.5" />
          <span>Live</span>
        </>
      ) : (
        <>
          <EyeOff className="h-2.5 w-2.5" />
          <span>Anon</span>
        </>
      )}
    </div>
  );
}
