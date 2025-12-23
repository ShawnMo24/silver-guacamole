import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  PhoneCall,
  PhoneOff,
  Shield,
  User,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  Navigation,
  Home,
  Users,
  Building,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Layers,
  Target,
} from "lucide-react";

export type CallStatus = "incoming" | "active" | "unresolved";
export type PrivacyStatus = "anonymous" | "opted-in" | "verified";
export type MarkerType = "responder" | "citizen" | "safehouse" | "incident" | "self";
export type MapMode = "operations" | "dispatcher" | "responder" | "citizen" | "console";

export interface MapMarker {
  id: string;
  type: MarkerType;
  x: number;
  y: number;
  label: string;
  status?: CallStatus;
  privacy?: PrivacyStatus;
  priority?: "critical" | "high" | "medium" | "low";
  isOpen?: boolean;
  services?: string[];
}

interface UniversalMapProps {
  markers: MapMarker[];
  mode: MapMode;
  highlightedIds?: string[];
  dangerFocusId?: string;
  selectedId?: string;
  selfPosition?: { x: number; y: number };
  className?: string;
  showHeader?: boolean;
  showLegend?: boolean;
  showControls?: boolean;
  showStats?: boolean;
  compactMode?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onMarkerClick?: (marker: MapMarker) => void;
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

const priorityColors: Record<string, string> = {
  critical: "border-danger bg-danger/20 ring-danger/50",
  high: "border-escalating bg-escalating/20 ring-escalating/50",
  medium: "border-mrsg-cyan bg-mrsg-cyan/20 ring-mrsg-cyan/50",
  low: "border-stable bg-stable/20 ring-stable/50",
};

export function UniversalMap({
  markers,
  mode,
  highlightedIds = [],
  dangerFocusId,
  selectedId,
  selfPosition,
  className,
  showHeader = true,
  showLegend = false,
  showControls = true,
  showStats = true,
  compactMode = false,
  autoRefresh = true,
  refreshInterval = 5000,
  onMarkerClick,
  onRefresh,
}: UniversalMapProps) {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setLastRefresh(new Date());
      onRefresh?.();
      setTimeout(() => setIsRefreshing(false), 500);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [onRefresh]);

  const responders = markers.filter((m) => m.type === "responder");
  const incomingCalls = markers.filter((m) => m.status === "incoming").length;
  const activeCalls = markers.filter((m) => m.status === "active").length;
  const unresolvedCalls = markers.filter((m) => m.status === "unresolved").length;
  const safehouses = markers.filter((m) => m.type === "safehouse").length;

  const gridId = `map-grid-${mode}`;

  const renderMarker = (marker: MapMarker) => {
    const isHighlighted = highlightedIds.includes(marker.id);
    const isDangerFocus = marker.id === dangerFocusId;
    const isSelected = marker.id === selectedId;
    const StatusIcon = marker.status && statusConfig[marker.status as CallStatus] ? statusConfig[marker.status as CallStatus].icon : null;
    const statusColor = marker.status && statusConfig[marker.status as CallStatus] ? statusConfig[marker.status as CallStatus].color : "";
    const PrivacyIcon = marker.privacy ? privacyIcons[marker.privacy] : null;

    const markerSize = compactMode ? "small" : "normal";
    const sizes = {
      normal: { responder: "h-7 w-7", citizen: "h-6 w-6", safehouse: "h-6 w-6", self: "h-10 w-10", incident: "h-6 w-6" },
      small: { responder: "h-5 w-5", citizen: "h-5 w-5", safehouse: "h-5 w-5", self: "h-8 w-8", incident: "h-5 w-5" },
    };

    const iconSizes = {
      normal: { responder: "h-3.5 w-3.5", citizen: "h-3 w-3", safehouse: "h-3 w-3", self: "h-5 w-5", incident: "h-3 w-3" },
      small: { responder: "h-2.5 w-2.5", citizen: "h-2.5 w-2.5", safehouse: "h-2.5 w-2.5", self: "h-4 w-4", incident: "h-2.5 w-2.5" },
    };

    return (
      <div
        key={marker.id}
        className={cn(
          "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer",
          (isHighlighted || isDangerFocus || isSelected) && "z-20"
        )}
        style={{ 
          left: `${marker.x}%`, 
          top: `${marker.y}%`,
        }}
        onClick={() => onMarkerClick?.(marker)}
        data-testid={`map-marker-${marker.id}`}
      >
        <div className="relative flex items-center justify-center">
          {marker.type === "self" && (
            <div className={cn(
              sizes[markerSize].self,
              "rounded-full bg-mrsg-cyan/30 border-2 border-mrsg-cyan flex items-center justify-center ring-4 ring-mrsg-cyan/20",
              isDangerFocus && "ring-4 ring-danger/50 border-danger bg-danger/20"
            )}>
              <Shield className={cn(iconSizes[markerSize].self, isDangerFocus ? "text-danger" : "text-mrsg-cyan")} />
            </div>
          )}

          {marker.type === "responder" && (
            <div
              className={cn(
                sizes[markerSize].responder,
                "rounded-full flex items-center justify-center transition-all duration-300",
                "bg-mrsg-cyan/20 border-2 border-mrsg-cyan",
                isDangerFocus && "ring-4 ring-danger/50 border-danger bg-danger/20",
                (isHighlighted || isSelected) && !isDangerFocus && "ring-2 ring-mrsg-cyan/50"
              )}
            >
              <Shield className={cn(iconSizes[markerSize].responder, isDangerFocus ? "text-danger" : "text-mrsg-cyan")} />
            </div>
          )}

          {marker.type === "citizen" && (
            <div
              className={cn(
                sizes[markerSize].citizen,
                "rounded-full flex items-center justify-center transition-all duration-300 border-2",
                marker.priority ? priorityColors[marker.priority] : "bg-escalating/20 border-escalating",
                isDangerFocus && "ring-4 ring-danger/50 border-danger bg-danger/20",
                (isHighlighted || isSelected) && !isDangerFocus && "ring-2 ring-escalating/50"
              )}
            >
              <User className={cn(iconSizes[markerSize].citizen, isDangerFocus ? "text-danger" : "text-escalating")} />
            </div>
          )}

          {marker.type === "safehouse" && (
            <div
              className={cn(
                sizes[markerSize].safehouse,
                "rounded-lg flex items-center justify-center border-2 transition-all",
                marker.isOpen !== false ? "bg-stable/30 border-stable" : "bg-muted/30 border-muted-foreground",
                isSelected && "ring-2 ring-stable/50"
              )}
            >
              <Home className={cn(iconSizes[markerSize].safehouse, marker.isOpen !== false ? "text-stable" : "text-muted-foreground")} />
            </div>
          )}

          {marker.type === "incident" && (
            <div
              className={cn(
                sizes[markerSize].incident,
                "rounded-full flex items-center justify-center border-2 transition-all",
                marker.priority ? priorityColors[marker.priority] : "bg-danger/20 border-danger",
                isDangerFocus && "ring-4 ring-danger/50",
                isSelected && "ring-2 ring-danger/50"
              )}
            >
              <AlertTriangle className={cn(iconSizes[markerSize].incident, "text-danger")} />
            </div>
          )}

          {StatusIcon && !compactMode && (
            <div className={cn("absolute -top-1 -right-1 h-3.5 w-3.5", statusColor)}>
              <StatusIcon className="h-3.5 w-3.5" />
            </div>
          )}

          {PrivacyIcon && marker.type === "citizen" && !compactMode && (
            <div className="absolute -bottom-1 -right-1">
              <PrivacyIcon className={cn(
                "h-3 w-3",
                marker.privacy === "verified" ? "text-stable" : 
                marker.privacy === "opted-in" ? "text-mrsg-cyan" : "text-muted-foreground"
              )} />
            </div>
          )}

          {(isHighlighted || isDangerFocus || isSelected || marker.type === "self") && !compactMode && (
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
  };

  const renderStats = () => {
    if (!showStats) return null;

    if (mode === "citizen") {
      const openPlaces = markers.filter((m) => m.type === "safehouse" && m.isOpen !== false).length;
      return (
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Home className="h-3 w-3 text-stable" />
            <span className="text-muted-foreground">{openPlaces} open</span>
          </div>
        </div>
      );
    }

    if (mode === "responder") {
      return (
        <div className="flex gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-escalating" />
            <span className="text-muted-foreground">{markers.filter(m => m.type === "citizen").length} alerts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Home className="h-3 w-3 text-stable" />
            <span className="text-muted-foreground">{safehouses}</span>
          </div>
        </div>
      );
    }

    return (
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
    );
  };

  const renderLegend = () => {
    if (!showLegend) return null;

    const legendItems = [];
    
    if (mode !== "citizen") {
      legendItems.push(
        { icon: Shield, color: "text-mrsg-cyan", label: "Responder" },
        { icon: User, color: "text-escalating", label: "Citizen" }
      );
    }

    if (mode === "citizen" || mode === "responder") {
      legendItems.push({ icon: Home, color: "text-stable", label: "Safe Place" });
    }

    if (mode === "operations" || mode === "dispatcher") {
      legendItems.push(
        { icon: Phone, color: "text-escalating", label: "Incoming" },
        { icon: PhoneCall, color: "text-mrsg-cyan", label: "Active" },
        { icon: PhoneOff, color: "text-danger", label: "Unresolved" }
      );
    }

    return (
      <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg p-2 space-y-1">
        {legendItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <item.icon className={cn("h-3 w-3", item.color)} />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)} data-testid={`universal-map-${mode}`}>
      {showHeader && (
        <div className="flex items-center justify-between pb-3 border-b border-mrsg-cyan/20">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-mrsg-cyan" />
            <span className="text-sm font-semibold text-mrsg-cyan uppercase tracking-wider">
              {mode === "citizen" ? "Area Map" : mode === "responder" ? "Field Map" : "Live Map"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {renderStats()}
            <div className="flex items-center gap-2">
              <RefreshCw
                className={cn(
                  "h-3 w-3 text-muted-foreground transition-transform cursor-pointer",
                  isRefreshing && "animate-spin text-mrsg-cyan"
                )}
                onClick={handleRefresh}
              />
              <span className="text-[10px] font-mono text-muted-foreground">
                {lastRefresh.toLocaleTimeString("en-US", { hour12: false })}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className={cn("flex-1 relative min-h-0", showHeader && "mt-3")}>
        <div className="absolute inset-0 rounded-lg border border-mrsg-cyan/10 bg-card/50 overflow-hidden">
          <div className="absolute inset-0 opacity-15">
            <svg width="100%" height="100%" className="text-mrsg-cyan/40">
              <defs>
                <pattern id={gridId} width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${gridId})`} />
            </svg>
          </div>

          {dangerFocusId && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-danger/5 transition-opacity duration-500" />
            </div>
          )}

          {selfPosition && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
              style={{ left: `${selfPosition.x}%`, top: `${selfPosition.y}%` }}
            >
              <div className="h-10 w-10 rounded-full bg-mrsg-cyan/30 border-3 border-mrsg-cyan flex items-center justify-center ring-4 ring-mrsg-cyan/20">
                <Target className="h-5 w-5 text-mrsg-cyan" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-mrsg-cyan/20 text-mrsg-cyan border border-mrsg-cyan/30">
                  You
                </span>
              </div>
            </div>
          )}

          {markers.map(renderMarker)}

          {renderLegend()}
        </div>

        {showControls && (
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {mode === "responder" && (
              <Button 
                size="icon" 
                variant="outline" 
                className="bg-card/80 backdrop-blur-sm"
                data-testid="button-center-map"
              >
                <Navigation className="h-4 w-4" />
              </Button>
            )}
            <Button 
              size="icon" 
              variant="outline" 
              className="bg-card/80 backdrop-blur-sm"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className="bg-card/80 backdrop-blur-sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              className={cn("bg-card/80 backdrop-blur-sm", isRefreshing && "animate-pulse")}
              onClick={handleRefresh}
              data-testid="button-refresh-map"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin text-mrsg-cyan")} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function MapLegendPanel() {
  return (
    <div className="space-y-3 p-3 bg-card/50 rounded-lg border border-border/50">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-mrsg-cyan flex items-center gap-2">
        <Layers className="h-3 w-3" />
        Legend
      </h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-mrsg-cyan/20 border-2 border-mrsg-cyan flex items-center justify-center">
            <Shield className="h-2.5 w-2.5 text-mrsg-cyan" />
          </div>
          <span className="text-xs text-muted-foreground">Responder</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-escalating/20 border-2 border-escalating flex items-center justify-center">
            <User className="h-2.5 w-2.5 text-escalating" />
          </div>
          <span className="text-xs text-muted-foreground">Citizen Call</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-lg bg-stable/30 border-2 border-stable flex items-center justify-center">
            <Home className="h-2.5 w-2.5 text-stable" />
          </div>
          <span className="text-xs text-muted-foreground">Safe Place</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-danger/20 border-2 border-danger flex items-center justify-center">
            <AlertTriangle className="h-2.5 w-2.5 text-danger" />
          </div>
          <span className="text-xs text-muted-foreground">Incident</span>
        </div>
      </div>
      <div className="border-t border-border/50 pt-3 space-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Call Status</span>
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3 text-escalating" />
          <span className="text-xs text-muted-foreground">Incoming</span>
        </div>
        <div className="flex items-center gap-2">
          <PhoneCall className="h-3 w-3 text-mrsg-cyan" />
          <span className="text-xs text-muted-foreground">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <PhoneOff className="h-3 w-3 text-danger" />
          <span className="text-xs text-muted-foreground">Unresolved</span>
        </div>
      </div>
      <div className="border-t border-border/50 pt-3 space-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Privacy</span>
        <div className="flex items-center gap-2">
          <EyeOff className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Anonymous</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="h-3 w-3 text-mrsg-cyan" />
          <span className="text-xs text-muted-foreground">Opted-In</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-3 w-3 text-stable" />
          <span className="text-xs text-muted-foreground">Verified</span>
        </div>
      </div>
    </div>
  );
}
