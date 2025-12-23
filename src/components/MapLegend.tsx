import { cn } from "@/lib/utils";
import { Shield, User, Phone, PhoneCall, PhoneOff, Eye, EyeOff, CheckCircle } from "lucide-react";

interface MapLegendProps {
  className?: string;
}

export function MapLegend({ className }: MapLegendProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)} data-testid="map-legend">
      <span className="text-xs font-semibold uppercase tracking-wider text-mrsg-cyan">
        Legend
      </span>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Markers
          </span>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-mrsg-cyan/20 border border-mrsg-cyan flex items-center justify-center">
              <Shield className="h-2 w-2 text-mrsg-cyan" />
            </div>
            <span className="text-xs text-foreground">Responder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-escalating/20 border border-escalating flex items-center justify-center">
              <User className="h-2 w-2 text-escalating" />
            </div>
            <span className="text-xs text-foreground">Citizen</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Call Status
          </span>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-escalating" />
            <span className="text-xs text-foreground">Incoming</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneCall className="h-3 w-3 text-mrsg-cyan" />
            <span className="text-xs text-foreground">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <PhoneOff className="h-3 w-3 text-danger" />
            <span className="text-xs text-foreground">Unresolved</span>
          </div>
        </div>

        <div className="col-span-2 pt-2 border-t border-border/50">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Privacy Status
          </span>
          <div className="flex items-center gap-4 mt-1.5">
            <div className="flex items-center gap-1.5">
              <EyeOff className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-foreground">Anonymous</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-3 w-3 text-mrsg-cyan" />
              <span className="text-xs text-foreground">Opted-in</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3 w-3 text-stable" />
              <span className="text-xs text-foreground">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
