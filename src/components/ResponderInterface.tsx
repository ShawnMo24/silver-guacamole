import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { StatusIndicator } from "./StatusIndicator";
import { UniversalMap, MapMarker } from "./UniversalMap";
import { IncidentCard } from "./IncidentCard";
import { useDemoMode, type AlertStatus } from "@/contexts/DemoModeContext";
import {
  Shield,
  MapPin,
  Phone,
  PhoneCall,
  PhoneOff,
  Navigation,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  CircleCheck,
  Eye,
  Clock,
  Radio,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  ChevronUp,
  ChevronDown,
  User,
  MessageSquare,
  Bell,
  BellOff,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";

type ResponderStatus = "available" | "busy" | "offline";
type AlertPriority = "critical" | "high" | "medium" | "low";

interface ActiveAlert {
  id: string;
  title: string;
  location: string;
  priority: AlertPriority;
  timestamp: Date;
  distance: string;
  citizenId?: string;
  description: string;
}


const priorityConfig: Record<AlertPriority, { color: string; bgColor: string; label: string }> = {
  critical: { color: "text-danger", bgColor: "bg-danger/20 border-danger", label: "CRITICAL" },
  high: { color: "text-escalating", bgColor: "bg-escalating/20 border-escalating", label: "HIGH" },
  medium: { color: "text-mrsg-cyan", bgColor: "bg-mrsg-cyan/20 border-mrsg-cyan", label: "MEDIUM" },
  low: { color: "text-stable", bgColor: "bg-stable/20 border-stable", label: "LOW" },
};

const statusConfig: Record<ResponderStatus, { color: string; label: string }> = {
  available: { color: "text-stable", label: "Available" },
  busy: { color: "text-escalating", label: "On Call" },
  offline: { color: "text-muted-foreground", label: "Offline" },
};

const mockAlerts: ActiveAlert[] = [
  {
    id: "alert-1",
    title: "Wellness Check Request",
    location: "1247 Oak Street, Apt 3B",
    priority: "high",
    timestamp: new Date(Date.now() - 120000),
    distance: "0.3 mi",
    citizenId: "C-4521",
    description: "Elderly resident not responding to family calls for 6 hours",
  },
  {
    id: "alert-2",
    title: "Community Dispute",
    location: "Central Park - East Pavilion",
    priority: "medium",
    timestamp: new Date(Date.now() - 300000),
    distance: "0.8 mi",
    description: "Noise complaint requiring mediation between neighbors",
  },
  {
    id: "alert-3",
    title: "Youth Outreach",
    location: "Jefferson High School",
    priority: "low",
    timestamp: new Date(Date.now() - 600000),
    distance: "1.2 mi",
    description: "Scheduled after-school program check-in",
  },
];

const mockMapMarkers: MapMarker[] = [
  { id: "self", type: "self", x: 50, y: 50, label: "You" },
  { id: "alert-1", type: "citizen", x: 35, y: 30, label: "1247 Oak St", priority: "high" },
  { id: "alert-2", type: "citizen", x: 65, y: 60, label: "Central Park", priority: "medium" },
  { id: "safe-1", type: "safehouse", x: 25, y: 70, label: "Safe House A", isOpen: true },
  { id: "safe-2", type: "safehouse", x: 80, y: 25, label: "Safe House B", isOpen: true },
];

export function ResponderInterface() {
  const [status, setStatus] = useState<ResponderStatus>("available");
  const [isMicOn, setIsMicOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isAlertsExpanded, setIsAlertsExpanded] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isEnabled: isDemoMode, incidents: demoIncidents, updateIncidentStatus, canTransitionTo, activityLog } = useDemoMode();

  const activeIncidents = isDemoMode 
    ? demoIncidents.filter(i => i.status !== "resolved")
    : [];

  useEffect(() => {
    if (isDemoMode && activeIncidents.length > 0 && !activeIncidents.find(i => i.id === selectedAlert)) {
      setSelectedAlert(activeIncidents[0].id);
    } else if (!isDemoMode && mockAlerts.length > 0 && !mockAlerts.find(a => a.id === selectedAlert)) {
      setSelectedAlert(mockAlerts[0].id);
    }
  }, [isDemoMode, activeIncidents.length, selectedAlert]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 500);
    }, 5000);
    return () => clearInterval(refreshInterval);
  }, []);

  const formatTime = (date: Date) => {
    const diff = Math.floor((currentTime.getTime() - date.getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  const cycleStatus = () => {
    const statuses: ResponderStatus[] = ["available", "busy", "offline"];
    const currentIndex = statuses.indexOf(status);
    setStatus(statuses[(currentIndex + 1) % statuses.length]);
  };

  const handleStatusChange = (incidentId: string, newStatus: AlertStatus) => {
    updateIncidentStatus(incidentId, newStatus, "responder");
  };

  const selectedDemoIncident = activeIncidents.find((i) => i.id === selectedAlert);
  const selectedAlertData = !isDemoMode ? mockAlerts.find((a) => a.id === selectedAlert) : null;

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="responder-interface">
      <header className="h-14 border-b border-mrsg-cyan/20 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-5 w-5 text-mrsg-cyan" />
              <span className="text-base font-semibold tracking-tight text-foreground">LPM V2</span>
            </div>
          </Link>
          <div className="h-4 w-px bg-mrsg-cyan/30" />
          <span className="text-xs font-semibold uppercase tracking-wider text-mrsg-cyan">
            Responder
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={cycleStatus}
            className="h-8 gap-2"
            data-testid="button-status-toggle"
          >
            <div className={cn("h-2 w-2 rounded-full", {
              "bg-stable": status === "available",
              "bg-escalating": status === "busy",
              "bg-muted-foreground": status === "offline",
            })} />
            <span className={cn("text-xs font-medium", statusConfig[status].color)}>
              {statusConfig[status].label}
            </span>
          </Button>
          <div className="h-4 w-px bg-border/50" />
          <ThemeToggle />
          <div className="h-4 w-px bg-border/50" />
          <span className="text-sm font-mono tabular-nums text-foreground" data-testid="text-time">
            {currentTime.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 relative min-h-0">
          <UniversalMap
            markers={mockMapMarkers}
            mode="responder"
            selectedId={selectedAlert ?? undefined}
            showHeader={false}
            showLegend={true}
            autoRefresh={true}
            refreshInterval={5000}
            onMarkerClick={(marker) => marker.type !== "self" && setSelectedAlert(marker.id)}
            onRefresh={() => setIsRefreshing(true)}
          />

          <div className="absolute top-4 left-4 z-10">
            <Card className="p-3 bg-card/90 backdrop-blur-sm border-mrsg-cyan/20">
              <div className="flex items-center gap-2">
                <StatusIndicator status="online" />
                <span className="text-xs font-medium">GPS Active</span>
              </div>
            </Card>
          </div>
        </div>

        <div className="shrink-0 border-t border-mrsg-cyan/20 bg-card/95 backdrop-blur-sm">
          <div
            className="flex items-center justify-between px-4 py-2 cursor-pointer"
            onClick={() => setIsAlertsExpanded(!isAlertsExpanded)}
            data-testid="button-toggle-alerts"
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-mrsg-cyan" />
              <span className="text-sm font-semibold text-mrsg-cyan uppercase tracking-wider">
                Active Alerts
              </span>
              <Badge variant="secondary" className="text-xs">
                {isDemoMode && activeIncidents.length > 0 ? activeIncidents.length : mockAlerts.length}
              </Badge>
              {isDemoMode && activeIncidents.length > 0 && (
                <Badge variant="outline" className="text-[10px] text-mrsg-cyan border-mrsg-cyan/50">
                  DEMO
                </Badge>
              )}
            </div>
            {isAlertsExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {isAlertsExpanded && (
            <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
              {isDemoMode && activeIncidents.length > 0 ? (
                activeIncidents.map((incident) => (
                  <div key={incident.id} onClick={() => setSelectedAlert(incident.id)}>
                    <IncidentCard
                      id={incident.id}
                      title={incident.title}
                      location={incident.location}
                      timestamp={incident.timestamp}
                      status={incident.status}
                      acknowledgedBy={incident.acknowledgedBy}
                      acknowledgedAt={incident.acknowledgedAt}
                      resolvedBy={incident.resolvedBy}
                      resolvedAt={incident.resolvedAt}
                      userRole="responder"
                      onStatusChange={(newStatus) => handleStatusChange(incident.id, newStatus)}
                      canTransition={(newStatus) => canTransitionTo(incident.status, newStatus, "responder")}
                      isPinned={selectedAlert === incident.id}
                      sourceType={incident.sourceType || "911_call"}
                      zone={incident.zone}
                      className={cn(
                        "cursor-pointer",
                        selectedAlert === incident.id && "ring-2 ring-mrsg-cyan ring-offset-2 ring-offset-background"
                      )}
                    />
                  </div>
                ))
              ) : (
                mockAlerts.map((alert) => {
                  const config = priorityConfig[alert.priority];
                  const isActive = selectedAlert === alert.id;
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        "p-3 rounded-lg border transition-all cursor-pointer",
                        isActive ? config.bgColor : "bg-card border-border/50",
                        isActive && "ring-1 ring-offset-1 ring-offset-background",
                        alert.priority === "critical" && isActive && "ring-danger",
                        alert.priority === "high" && isActive && "ring-escalating",
                        alert.priority === "medium" && isActive && "ring-mrsg-cyan",
                        alert.priority === "low" && isActive && "ring-stable"
                      )}
                      onClick={() => setSelectedAlert(alert.id)}
                      data-testid={`alert-card-${alert.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={cn("text-[10px] px-1.5 py-0 h-5", config.color)}
                            >
                              {config.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(alert.timestamp)}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium truncate">{alert.title}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{alert.location}</span>
                            <span className="text-mrsg-cyan ml-1">{alert.distance}</span>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={isActive ? "default" : "ghost"}
                          className="shrink-0"
                          data-testid={`button-navigate-${alert.id}`}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Go
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {(selectedAlertData || selectedDemoIncident) && (
          <div className="shrink-0 border-t border-mrsg-cyan/20 bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {selectedDemoIncident ? (
                  selectedDemoIncident.status === "resolved" ? (
                    <CircleCheck className="h-4 w-4 text-stable" />
                  ) : selectedDemoIncident.status === "monitoring" ? (
                    <Eye className="h-4 w-4 text-mrsg-cyan" />
                  ) : selectedDemoIncident.status === "acknowledged" ? (
                    <CheckCircle2 className="h-4 w-4 text-escalating" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-danger" />
                  )
                ) : (
                  <AlertTriangle className={cn("h-4 w-4", priorityConfig[selectedAlertData!.priority].color)} />
                )}
                <span className="text-sm font-semibold">
                  {selectedDemoIncident?.title || selectedAlertData?.title}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {selectedDemoIncident?.id || selectedAlertData?.citizenId}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {selectedDemoIncident 
                ? `Location: ${selectedDemoIncident.location}` 
                : selectedAlertData?.description}
            </p>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant={isMicOn ? "default" : "outline"}
                onClick={() => setIsMicOn(!isMicOn)}
                className={cn(isMicOn && "bg-mrsg-cyan hover:bg-mrsg-cyan/90")}
                data-testid="button-mic-toggle"
              >
                {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant={isAudioOn ? "outline" : "secondary"}
                onClick={() => setIsAudioOn(!isAudioOn)}
                data-testid="button-audio-toggle"
              >
                {isAudioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="outline" data-testid="button-call">
                <Phone className="h-4 w-4" />
              </Button>
              <div className="flex-1" />
              <Button variant="outline" className="gap-2" data-testid="button-message">
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
              {selectedDemoIncident && (selectedDemoIncident.status === "acknowledged" || selectedDemoIncident.status === "monitoring") && (
                <Button 
                  className="gap-2 bg-stable"
                  onClick={() => handleStatusChange(selectedDemoIncident.id, "resolved")}
                  data-testid="button-resolve-selected"
                >
                  <CircleCheck className="h-4 w-4" />
                  Resolve
                </Button>
              )}
              {!selectedDemoIncident && (
                <Button className="gap-2 bg-stable" data-testid="button-accept">
                  <Zap className="h-4 w-4" />
                  Accept
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="shrink-0 border-t border-mrsg-cyan/20 bg-card/80 p-2 flex items-center justify-around">
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2 gap-1" data-testid="button-nav-map">
            <MapPin className="h-5 w-5 text-mrsg-cyan" />
            <span className="text-[10px]">Map</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2 gap-1" data-testid="button-nav-alerts">
            <Bell className="h-5 w-5" />
            <span className="text-[10px]">Alerts</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2 gap-1" data-testid="button-nav-radio">
            <Radio className="h-5 w-5" />
            <span className="text-[10px]">Radio</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2 gap-1" data-testid="button-nav-profile">
            <User className="h-5 w-5" />
            <span className="text-[10px]">Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
