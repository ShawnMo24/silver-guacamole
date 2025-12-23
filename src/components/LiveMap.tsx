import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MapLegend } from "./MapLegend";
import { MapPin, Phone, PhoneCall, PhoneOff, Shield, User, RefreshCw, Eye, EyeOff, CheckCircle } from "lucide-react";

type CallStatus = "incoming" | "active" | "unresolved";
type PrivacyStatus = "anonymous" | "opted-in" | "verified";

interface MapMarker {
  id: string;
  type: "responder" | "citizen";
  x: number;
  y: number;
  label: string;
  status?: CallStatus;
  privacy?: PrivacyStatus;
  isDangerFocus?: boolean;
}

interface LiveMapProps {
  markers: MapMarker[];
  highlightedIds?: string[];
  dangerFocusId?: string;
  className?: string;
  onRefresh?: () => void;
}

const statusConfig: Record<CallStatus, { color: string; icon: typeof Phone }> = {
  incoming: { color: "text-escalating", icon: Phone },
  active: { color: "text-mrsg-cyan", icon: PhoneCall },
  unresolved: { color: "text-danger", icon: PhoneOff },
};

const privacyIcons: Record<PrivacyStatus, typeof Eye> = {
  anonymous: EyeOff,
  "opted-in": Eye,
  verified: CheckCircle,
};

export function LiveMap({ markers, highlightedIds = [], dangerFocusId, className, onRefresh }: LiveMapProps) {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setLastRefresh(new Date());
      onRefresh?.();
      setTimeout(() => setIsRefreshing(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  const responders = markers.filter((m) => m.type === "responder");
  const incomingCalls = markers.filter((m) => m.status === "incoming").length;
  const activeCalls = markers.filter((m) => m.status === "active").length;
  const unresolvedCalls = markers.filter((m) => m.status === "unresolved").length;

  return (
    <div className={cn("flex flex-col h-full", className)} data-testid="live-map">
      <div className="flex items-center justify-between pb-3 border-b border-mrsg-cyan/20">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-mrsg-cyan" />
          <span className="text-sm font-semibold text-mrsg-cyan uppercase tracking-wider">
            Live Map
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-mrsg-cyan" />
              <span className="text-muted-foreground">{responders.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-escalating" />
              <span className="text-muted-foreground">{incomingCalls}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PhoneCall className="h-3 w-3 text-mrsg-cyan" />
              <span className="text-muted-foreground">{activeCalls}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PhoneOff className="h-3 w-3 text-danger" />
              <span className="text-muted-foreground">{unresolvedCalls}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw
              className={cn(
                "h-3 w-3 text-muted-foreground transition-transform",
                isRefreshing && "animate-spin text-mrsg-cyan"
              )}
            />
            <span className="text-[10px] font-mono text-muted-foreground">
              {lastRefresh.toLocaleTimeString("en-US", { hour12: false })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-4 mt-3 min-h-0">
        <div className="flex-1 relative rounded-lg border border-mrsg-cyan/10 bg-card/50 overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <svg width="100%" height="100%" className="text-mrsg-cyan/40">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {dangerFocusId && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-danger/5 transition-opacity duration-500" />
            </div>
          )}

          {markers.map((marker) => {
            const isHighlighted = highlightedIds.includes(marker.id);
            const isDangerFocus = marker.id === dangerFocusId;
            const StatusIcon = marker.status ? statusConfig[marker.status].icon : null;
            const statusColor = marker.status ? statusConfig[marker.status].color : "";
            const PrivacyIcon = marker.privacy ? privacyIcons[marker.privacy] : null;

            return (
              <div
                key={marker.id}
                className={cn(
                  "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500",
                  (isHighlighted || isDangerFocus) && "z-10 scale-110"
                )}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              >
                <div className="relative flex items-center justify-center">
                  {marker.type === "responder" ? (
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-mrsg-cyan/20 border-2 border-mrsg-cyan",
                        isDangerFocus && "ring-4 ring-danger/50 border-danger bg-danger/20",
                        isHighlighted && !isDangerFocus && "ring-2 ring-mrsg-cyan/50"
                      )}
                    >
                      <Shield className={cn("h-3.5 w-3.5", isDangerFocus ? "text-danger" : "text-mrsg-cyan")} />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-escalating/20 border-2 border-escalating",
                        isDangerFocus && "ring-4 ring-danger/50 border-danger bg-danger/20",
                        isHighlighted && !isDangerFocus && "ring-2 ring-escalating/50"
                      )}
                    >
                      <User className={cn("h-3 w-3", isDangerFocus ? "text-danger" : "text-escalating")} />
                    </div>
                  )}

                  {StatusIcon && (
                    <div className={cn("absolute -top-1 -right-1 h-3.5 w-3.5", statusColor)}>
                      <StatusIcon className="h-3.5 w-3.5" />
                    </div>
                  )}

                  {PrivacyIcon && marker.type === "citizen" && (
                    <div className="absolute -bottom-1 -right-1">
                      <PrivacyIcon className={cn(
                        "h-3 w-3",
                        marker.privacy === "verified" ? "text-stable" : 
                        marker.privacy === "opted-in" ? "text-mrsg-cyan" : "text-muted-foreground"
                      )} />
                    </div>
                  )}

                  {(isHighlighted || isDangerFocus) && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className={cn(
                        "text-[9px] font-mono px-1.5 py-0.5 rounded",
                        isDangerFocus ? "bg-danger/80 text-white" : "bg-card/90 text-foreground border border-border/50"
                      )}>
                        {marker.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-48 shrink-0">
          <MapLegend />
        </div>
      </div>
    </div>
  );
}
