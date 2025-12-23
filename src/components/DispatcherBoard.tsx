import { useState, useCallback } from "react";
import { TopBar } from "./TopBar";
import { DangerBanner } from "./DangerBanner";
import { IncidentCard } from "./IncidentCard";
import { ActivityLog } from "./ActivityLog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDemoMode, type AlertStatus } from "@/contexts/DemoModeContext";
import { 
  AlertTriangle, 
  Radio, 
  Shield, 
  Clock, 
  MapPin,
  CheckCircle,
  XCircle,
  ArrowRight,
  Send,
  MessageSquare,
  User,
  Phone,
  Zap,
  AlertCircle
} from "lucide-react";

type AlertPriority = "critical" | "high" | "medium" | "low";
type DispatchStatus = "pending" | "assigned" | "en-route" | "on-scene";
type ResponderStatus = "available" | "busy" | "offline" | "en-route";

interface IncomingAlert {
  id: string;
  type: string;
  location: string;
  priority: AlertPriority;
  timestamp: string;
  description: string;
  callerId?: string;
}

interface ActiveDispatch {
  id: string;
  alertId: string;
  responderId: string;
  responderName: string;
  location: string;
  status: DispatchStatus;
  assignedAt: string;
  eta?: string;
}

interface UnresolvedCase {
  id: string;
  type: string;
  location: string;
  openedAt: string;
  lastUpdate: string;
  escalationLevel: number;
  assignedTo?: string;
}

interface Responder {
  id: string;
  name: string;
  unit: string;
  status: ResponderStatus;
  currentLocation?: string;
  lastCheckIn: string;
}

const mockIncomingAlerts: IncomingAlert[] = [
  { id: "ALT-001", type: "Urgent Safety Response", location: "445 Main Street", priority: "critical", timestamp: "14:32:18", description: "Multiple individuals, immediate response needed", callerId: "CTZ-1047" },
  { id: "ALT-002", type: "Traffic Incident", location: "Oak St & 5th Ave", priority: "high", timestamp: "14:28:45", description: "Multi-vehicle collision, medical support needed" },
  { id: "ALT-003", type: "Community Concern", location: "123 Elm Street", priority: "low", timestamp: "14:15:22", description: "Noise disturbance outside permitted hours" },
  { id: "ALT-004", type: "Wellness Check", location: "Park Avenue Plaza", priority: "medium", timestamp: "14:10:05", description: "Community member requesting assistance" },
];

const mockActiveDispatches: ActiveDispatch[] = [
  { id: "DSP-001", alertId: "ALT-001", responderId: "R1", responderName: "Unit Alpha-7", location: "445 Main Street", status: "en-route", assignedAt: "14:32:25", eta: "2 min" },
  { id: "DSP-002", alertId: "ALT-002", responderId: "R2", responderName: "Unit Beta-3", location: "Oak St & 5th Ave", status: "on-scene", assignedAt: "14:29:10" },
];

const mockUnresolvedCases: UnresolvedCase[] = [
  { id: "CASE-1039", type: "Property Concern", location: "Central Park", openedAt: "2024-12-12 10:30", lastUpdate: "12:45:00", escalationLevel: 2, assignedTo: "Unit Delta-1" },
  { id: "CASE-1036", type: "Person Locate", location: "Downtown District", openedAt: "2024-12-11 18:00", lastUpdate: "08:30:00", escalationLevel: 3 },
];

const mockResponders: Responder[] = [
  { id: "R1", name: "Unit Alpha-7", unit: "Patrol", status: "en-route", currentLocation: "En route to Main St", lastCheckIn: "14:32:30" },
  { id: "R2", name: "Unit Beta-3", unit: "Patrol", status: "busy", currentLocation: "Oak St & 5th Ave", lastCheckIn: "14:30:15" },
  { id: "R3", name: "Unit Delta-1", unit: "Investigation", status: "busy", currentLocation: "Central Park", lastCheckIn: "14:25:00" },
  { id: "R4", name: "Unit Echo-2", unit: "Patrol", status: "available", lastCheckIn: "14:20:45" },
  { id: "R5", name: "Unit Foxtrot-9", unit: "Tactical", status: "available", lastCheckIn: "14:18:30" },
  { id: "R6", name: "Unit Golf-4", unit: "Patrol", status: "offline", lastCheckIn: "12:00:00" },
];

const mockActivities = [
  { id: "1", type: "incoming" as const, message: "PRIORITY: Urgent response needed 445 Main Street", timestamp: "14:32:18", channel: "alerts" },
  { id: "2", type: "outgoing" as const, message: "Unit Alpha-7 dispatched to Main Street", timestamp: "14:32:25", channel: "dispatch" },
  { id: "3", type: "system" as const, message: "Response window timer started", timestamp: "14:32:30" },
  { id: "4", type: "incoming" as const, message: "Unit Beta-3 arrived at Oak St scene", timestamp: "14:30:42", channel: "responder" },
  { id: "5", type: "outgoing" as const, message: "Additional support requested for Case #1036", timestamp: "14:28:00", channel: "dispatch" },
];

const priorityConfig: Record<AlertPriority, { color: string; bgColor: string; label: string }> = {
  critical: { color: "text-danger", bgColor: "bg-danger/20 border-danger/50", label: "URGENT" },
  high: { color: "text-escalating", bgColor: "bg-escalating/20 border-escalating/50", label: "PRIORITY" },
  medium: { color: "text-mrsg-cyan", bgColor: "bg-mrsg-cyan/20 border-mrsg-cyan/50", label: "STANDARD" },
  low: { color: "text-muted-foreground", bgColor: "bg-muted/30 border-border", label: "ROUTINE" },
};

const statusConfig: Record<DispatchStatus, { color: string; label: string }> = {
  pending: { color: "text-escalating", label: "Pending" },
  assigned: { color: "text-mrsg-cyan", label: "Assigned" },
  "en-route": { color: "text-mrsg-cyan", label: "En Route" },
  "on-scene": { color: "text-stable", label: "On Scene" },
};

const responderStatusConfig: Record<ResponderStatus, { color: string; bgColor: string }> = {
  available: { color: "text-stable", bgColor: "bg-stable/20" },
  busy: { color: "text-escalating", bgColor: "bg-escalating/20" },
  "en-route": { color: "text-mrsg-cyan", bgColor: "bg-mrsg-cyan/20" },
  offline: { color: "text-muted-foreground", bgColor: "bg-muted/30" },
};

export function DispatcherBoard() {
  const [selectedAlertId, setSelectedAlertId] = useState<string | undefined>();
  const [selectedResponderId, setSelectedResponderId] = useState<string | undefined>();
  const dangerStartTime = new Date(Date.now() - 120000);

  const { 
    isEnabled: demoEnabled, 
    activeScenario,
    incidents: demoIncidents,
    activityLog: demoActivityLog,
    updateIncidentStatus,
    canTransitionTo,
  } = useDemoMode();

  const currentIncident = demoEnabled && activeScenario 
    ? demoIncidents.find(i => i.status === "active" || i.status === "acknowledged" || i.status === "monitoring")
    : null;

  const dangerActive = demoEnabled && activeScenario 
    ? demoIncidents.some(i => (i.status === "active" || i.status === "acknowledged") && i.priority === "high")
    : true;

  const handleDispatch = useCallback((alertId: string, responderId: string) => {
    console.log(`Dispatching ${responderId} to alert ${alertId}`);
  }, []);

  const handleStatusChange = useCallback((incidentId: string, newStatus: AlertStatus) => {
    updateIncidentStatus(incidentId, newStatus, "dispatcher");
  }, [updateIncidentStatus]);

  const availableResponders = mockResponders.filter(r => r.status === "available");
  const activities = demoEnabled && activeScenario && demoActivityLog.length > 0 ? demoActivityLog : mockActivities;

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="dispatcher-board">
      <DangerBanner
        isActive={dangerActive}
        incidentId="INC-2847"
        incidentTitle="Urgent Safety Response - 445 Main Street"
        startTime={dangerStartTime}
      />
      <TopBar boardType="dispatcher" />

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col p-4 gap-4 min-h-0">
          <div className="grid grid-cols-2 gap-4 h-1/2">
            <IncomingAlertsPanel
              alerts={mockIncomingAlerts}
              selectedId={selectedAlertId}
              onSelect={setSelectedAlertId}
              onDispatch={(alertId) => {
                if (selectedResponderId) {
                  handleDispatch(alertId, selectedResponderId);
                }
              }}
              hasSelectedResponder={!!selectedResponderId}
            />
            <ActiveDispatchPanel dispatches={mockActiveDispatches} />
          </div>

          <div className="grid grid-cols-2 gap-4 h-1/2">
            <UnresolvedPanel cases={mockUnresolvedCases} />
            <ResponderRosterPanel
              responders={mockResponders}
              selectedId={selectedResponderId}
              onSelect={setSelectedResponderId}
            />
          </div>
        </div>

        <aside className="w-80 border-l border-mrsg-cyan/10 bg-card/20 p-4 flex flex-col gap-4">
          {currentIncident && (
            <IncidentCard
              id={currentIncident.id}
              title={currentIncident.title}
              location={currentIncident.location}
              timestamp={currentIncident.timestamp}
              assignedResponder="Unit Alpha-7"
              isPinned={currentIncident.status === "active"}
              status={currentIncident.status}
              acknowledgedBy={currentIncident.acknowledgedBy}
              acknowledgedAt={currentIncident.acknowledgedAt}
              userRole="dispatcher"
              onStatusChange={(newStatus) => handleStatusChange(currentIncident.id, newStatus)}
              canTransition={(newStatus) => canTransitionTo(currentIncident.status, newStatus, "dispatcher")}
              sourceType={currentIncident.sourceType || "911_call"}
              zone={currentIncident.zone}
            />
          )}
          {!currentIncident && dangerActive && (
            <IncidentCard
              id="INC-2847"
              title="Urgent Safety Response"
              location="445 Main Street"
              timestamp="14:32:18"
              assignedResponder="Unit Alpha-7"
              isPinned={true}
              status="active"
              userRole="dispatcher"
              sourceType="911_call"
              zone="Downtown Core"
            />
          )}
          
          <QuickDispatchPanel
            selectedAlert={mockIncomingAlerts.find(a => a.id === selectedAlertId)}
            selectedResponder={mockResponders.find(r => r.id === selectedResponderId)}
            availableResponders={availableResponders}
            onDispatch={handleDispatch}
            onSelectResponder={setSelectedResponderId}
          />

          <div className="flex-1 min-h-0">
            <ActivityLog activities={activities} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function IncomingAlertsPanel({
  alerts,
  selectedId,
  onSelect,
  onDispatch,
  hasSelectedResponder
}: {
  alerts: IncomingAlert[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onDispatch: (alertId: string) => void;
  hasSelectedResponder: boolean;
}) {
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="flex flex-col rounded-lg border border-mrsg-cyan/10 bg-card/40" data-testid="panel-incoming-alerts">
      <div className="flex items-center justify-between gap-4 p-4 border-b border-mrsg-cyan/10">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-escalating" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-escalating uppercase tracking-wide">
              Incoming Alerts
            </span>
            <span className="text-xs text-muted-foreground">Priority Queue</span>
          </div>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          {alerts.length} pending
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {sortedAlerts.map((alert) => {
            const config = priorityConfig[alert.priority];
            const isSelected = selectedId === alert.id;
            return (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-md border cursor-pointer transition-all",
                  config.bgColor,
                  isSelected && "ring-2 ring-mrsg-cyan"
                )}
                onClick={() => onSelect(alert.id)}
                data-testid={`alert-${alert.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[10px] font-mono", config.color)}>
                      {config.label}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">{alert.id}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{alert.timestamp}</span>
                </div>
                <div className="text-sm font-medium text-foreground mb-1">{alert.type}</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span>{alert.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate max-w-[60%]">{alert.description}</span>
                  {hasSelectedResponder && isSelected && (
                    <Button 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDispatch(alert.id);
                      }}
                      data-testid={`button-dispatch-${alert.id}`}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Dispatch
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function ActiveDispatchPanel({ dispatches }: { dispatches: ActiveDispatch[] }) {
  return (
    <div className="flex flex-col rounded-lg border border-mrsg-cyan/10 bg-card/40" data-testid="panel-active-dispatch">
      <div className="flex items-center justify-between gap-4 p-4 border-b border-mrsg-cyan/10">
        <div className="flex items-center gap-3">
          <Radio className="h-5 w-5 text-mrsg-cyan" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-mrsg-cyan uppercase tracking-wide">
              Active Dispatch
            </span>
            <span className="text-xs text-muted-foreground">In-Progress Assignments</span>
          </div>
        </div>
        <Badge variant="secondary" className="font-mono text-xs bg-mrsg-cyan/20 text-mrsg-cyan border-mrsg-cyan/30">
          {dispatches.length} active
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {dispatches.map((dispatch) => {
            const config = statusConfig[dispatch.status];
            return (
              <div
                key={dispatch.id}
                className="p-3 rounded-md border border-mrsg-cyan/20 bg-mrsg-cyan/5"
                data-testid={`dispatch-${dispatch.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-mrsg-cyan" />
                    <span className="text-sm font-medium text-foreground">{dispatch.responderName}</span>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] font-mono", config.color)}>
                    {config.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span>{dispatch.location}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Assigned: {dispatch.assignedAt}
                  </span>
                  {dispatch.eta && (
                    <div className="flex items-center gap-1 text-mrsg-cyan">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono">ETA {dispatch.eta}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-mrsg-cyan/10">
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs flex-1">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs flex-1">
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function UnresolvedPanel({ cases }: { cases: UnresolvedCase[] }) {
  return (
    <div className="flex flex-col rounded-lg border border-mrsg-cyan/10 bg-card/40" data-testid="panel-unresolved">
      <div className="flex items-center justify-between gap-4 p-4 border-b border-mrsg-cyan/10">
        <div className="flex items-center gap-3">
          <XCircle className="h-5 w-5 text-danger" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-danger uppercase tracking-wide">
              Unresolved Cases
            </span>
            <span className="text-xs text-muted-foreground">Requires Follow-up</span>
          </div>
        </div>
        <Badge variant="secondary" className="font-mono text-xs bg-danger/20 text-danger border-danger/30">
          {cases.length} open
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {cases.map((caseItem) => {
            const escalationColor = caseItem.escalationLevel >= 3 ? "text-danger" : 
                                   caseItem.escalationLevel >= 2 ? "text-escalating" : "text-mrsg-cyan";
            return (
              <div
                key={caseItem.id}
                className="p-3 rounded-md border border-danger/20 bg-danger/5"
                data-testid={`case-${caseItem.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{caseItem.id}</span>
                    <span className="text-sm font-medium text-foreground">{caseItem.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: caseItem.escalationLevel }).map((_, i) => (
                      <AlertCircle key={i} className={cn("h-3 w-3", escalationColor)} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <MapPin className="h-3 w-3" />
                  <span>{caseItem.location}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last update: {caseItem.lastUpdate}</span>
                  {caseItem.assignedTo && (
                    <span className="text-mrsg-cyan">{caseItem.assignedTo}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-danger/10">
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs flex-1">
                    <Zap className="h-3 w-3 mr-1" />
                    Escalate
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs flex-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolve
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function ResponderRosterPanel({
  responders,
  selectedId,
  onSelect
}: {
  responders: Responder[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const available = responders.filter(r => r.status === "available").length;
  const busy = responders.filter(r => r.status === "busy" || r.status === "en-route").length;

  return (
    <div className="flex flex-col rounded-lg border border-mrsg-cyan/10 bg-card/40" data-testid="panel-responder-roster">
      <div className="flex items-center justify-between gap-4 p-4 border-b border-mrsg-cyan/10">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-stable" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-stable uppercase tracking-wide">
              Responder Roster
            </span>
            <span className="text-xs text-muted-foreground">Unit Status Overview</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs bg-stable/20 text-stable border-stable/30">
            {available} ready
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs bg-escalating/20 text-escalating border-escalating/30">
            {busy} busy
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {responders.map((responder) => {
            const config = responderStatusConfig[responder.status];
            const isSelected = selectedId === responder.id;
            const isAvailable = responder.status === "available";
            return (
              <div
                key={responder.id}
                className={cn(
                  "p-3 rounded-md border transition-all",
                  config.bgColor,
                  "border-border/50",
                  isAvailable && "cursor-pointer",
                  isSelected && "ring-2 ring-mrsg-cyan"
                )}
                onClick={() => isAvailable && onSelect(responder.id)}
                data-testid={`responder-${responder.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", config.bgColor.replace("/20", ""))} />
                    <span className="text-sm font-medium text-foreground">{responder.name}</span>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] font-mono capitalize", config.color)}>
                    {responder.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{responder.unit}</span>
                  <span className="font-mono">{responder.lastCheckIn}</span>
                </div>
                {responder.currentLocation && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{responder.currentLocation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function QuickDispatchPanel({
  selectedAlert,
  selectedResponder,
  availableResponders,
  onDispatch,
  onSelectResponder
}: {
  selectedAlert?: IncomingAlert;
  selectedResponder?: Responder;
  availableResponders: Responder[];
  onDispatch: (alertId: string, responderId: string) => void;
  onSelectResponder: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-mrsg-cyan/10 bg-card/40 p-4" data-testid="panel-quick-dispatch">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-mrsg-cyan" />
        <span className="text-sm font-semibold text-mrsg-cyan uppercase tracking-wide">
          Quick Dispatch
        </span>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-md bg-muted/30 border border-border/50">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Selected Alert</div>
          {selectedAlert ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-[10px]", priorityConfig[selectedAlert.priority].color)}>
                {selectedAlert.priority}
              </Badge>
              <span className="text-sm text-foreground truncate">{selectedAlert.type}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Click an alert to select</span>
          )}
        </div>

        <ArrowRight className="h-4 w-4 text-mrsg-cyan mx-auto" />

        <div className="p-3 rounded-md bg-muted/30 border border-border/50">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Assign Responder</div>
          {selectedResponder ? (
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 text-stable" />
              <span className="text-sm text-foreground">{selectedResponder.name}</span>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Click to assign:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {availableResponders.slice(0, 3).map((r) => (
                  <Badge
                    key={r.id}
                    variant="outline"
                    className="text-[10px] cursor-pointer text-stable border-stable/30"
                    onClick={() => onSelectResponder(r.id)}
                  >
                    {r.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          className="w-full"
          disabled={!selectedAlert || !selectedResponder}
          onClick={() => {
            if (selectedAlert && selectedResponder) {
              onDispatch(selectedAlert.id, selectedResponder.id);
            }
          }}
          data-testid="button-confirm-dispatch"
        >
          <Send className="h-4 w-4 mr-2" />
          Confirm Dispatch
        </Button>
      </div>
    </div>
  );
}
