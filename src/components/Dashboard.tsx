import { useState, useCallback, useMemo } from "react";
import { TopBar } from "./TopBar";
import { InterfacePanel } from "./InterfacePanel";
import { UniversalMap, MapLegendPanel } from "./UniversalMap";
import { PromisesModule } from "./PromisesModule";
import { ActivityLog } from "./ActivityLog";
import { DangerBanner } from "./DangerBanner";
import { IncidentCard } from "./IncidentCard";
import { DataTransfer } from "./DataTransfer";
import { DemoModePanel } from "./DemoModePanel";
import { ZoneIntelligence } from "./ZoneIntelligence";
import { useDemoMode } from "@/contexts/DemoModeContext";

// todo: remove mock functionality
const mockDispatcherMessages = [
  {
    id: "DSP-001",
    source: "dispatcher" as const,
    destination: "responder" as const,
    content: "Unit Alpha-7, proceed to 445 Main Street. Armed robbery in progress.",
    timestamp: "14:32:18",
    priority: "high" as const,
  },
  {
    id: "DSP-002",
    source: "dispatcher" as const,
    content: "All units standby for shift change briefing at 15:00 hours.",
    timestamp: "14:28:05",
    priority: "low" as const,
  },
];

const mockResponderMessages = [
  {
    id: "RSP-001",
    source: "responder" as const,
    destination: "dispatcher" as const,
    content: "Unit Beta-3 on scene at Oak St. Situation stable, awaiting further instructions.",
    timestamp: "14:30:42",
    priority: "medium" as const,
  },
];

const mockCitizenMessages = [
  {
    id: "CTZ-001",
    source: "citizen" as const,
    content: "Armed robbery at 445 Main Street. Two suspects, one firearm visible.",
    timestamp: "14:31:45",
    priority: "high" as const,
    isOptedIn: true,
  },
  {
    id: "CTZ-002",
    source: "citizen" as const,
    content: "Noise complaint for 123 Oak Street. Ongoing construction outside permitted hours.",
    timestamp: "14:18:33",
    priority: "low" as const,
    isOptedIn: false,
  },
];

const mockMapMarkers = [
  { id: "R1", type: "responder" as const, x: 45, y: 35, label: "Unit Alpha-7", privacy: "verified" as const },
  { id: "R2", type: "responder" as const, x: 25, y: 55, label: "Unit Beta-3", privacy: "verified" as const },
  { id: "R3", type: "responder" as const, x: 75, y: 65, label: "Unit Delta-1", privacy: "verified" as const },
  { id: "C1", type: "citizen" as const, x: 50, y: 40, label: "Caller - Main St", status: "active" as const, privacy: "opted-in" as const },
  { id: "C2", type: "citizen" as const, x: 30, y: 60, label: "Caller #1041", status: "incoming" as const, privacy: "anonymous" as const },
  { id: "C3", type: "citizen" as const, x: 70, y: 50, label: "Case #1039", status: "unresolved" as const, privacy: "opted-in" as const },
];

const mockPromises = [
  { id: "P1", description: "Follow-up call to Mrs. Johnson regarding noise complaint", dueTime: "16:00", status: "pending" as const, locationId: "C2" },
  { id: "P2", description: "Unit deployment to sector 4B confirmed", dueTime: "14:30", status: "kept" as const, locationId: "R1" },
  { id: "P3", description: "Traffic signal repair notification", dueTime: "12:00", status: "unkept" as const, locationId: "C3" },
  { id: "P4", description: "Welfare check scheduled for Oak Street", dueTime: "18:00", status: "pending" as const, locationId: "R2" },
];

const mockActivities = [
  { id: "1", type: "incoming" as const, message: "DANGER NOW: Armed robbery 445 Main Street", timestamp: "14:32:18", channel: "dispatch" },
  { id: "2", type: "outgoing" as const, message: "Unit Alpha-7 dispatched to Main Street", timestamp: "14:32:25", channel: "responder" },
  { id: "3", type: "system" as const, message: "Critical window timer started", timestamp: "14:32:30" },
  { id: "4", type: "incoming" as const, message: "Citizen report submitted via portal", timestamp: "14:28:12", channel: "citizen" },
  { id: "5", type: "outgoing" as const, message: "Status update broadcast to all units", timestamp: "14:25:30", channel: "all" },
];

export function Dashboard() {
  const [selectedMessageId, setSelectedMessageId] = useState<string | undefined>();
  const [selectedPromiseId, setSelectedPromiseId] = useState<string | undefined>();
  const [highlightedMapIds, setHighlightedMapIds] = useState<string[]>([]);
  
  const { 
    isEnabled: demoEnabled, 
    activeScenario,
    incidents: demoIncidents,
    responders: demoResponders,
    citizenReports: demoCitizenReports,
    activityLog: demoActivityLog,
  } = useDemoMode();

  const dangerActive = demoEnabled && activeScenario 
    ? demoIncidents.some(i => (i.status === "active" || i.status === "acknowledged") && i.priority === "high")
    : true;
  const dangerStartTime = new Date(Date.now() - 120000);

  const currentIncident = demoEnabled && activeScenario 
    ? demoIncidents.find(i => i.status === "active" || i.status === "acknowledged" || i.status === "monitoring")
    : null;

  const mapMarkers = useMemo(() => {
    if (demoEnabled && activeScenario) {
      const responderMarkers = demoResponders.map(r => ({
        id: r.id,
        type: "responder" as const,
        x: r.x,
        y: r.y,
        label: `Unit ${r.unitId}`,
        privacy: "verified" as const,
      }));
      
      const citizenMarkers = demoCitizenReports.map((c, i) => ({
        id: `C${i + 1}`,
        type: "citizen" as const,
        x: 50 + (i * 10),
        y: 40 + (i * 5),
        label: c.location,
        status: "active" as const,
        privacy: c.isOptedIn ? "opted-in" as const : "anonymous" as const,
      }));
      
      return [...responderMarkers, ...citizenMarkers];
    }
    return mockMapMarkers;
  }, [demoEnabled, activeScenario, demoResponders, demoCitizenReports]);

  const citizenMessages = useMemo(() => {
    if (demoEnabled && activeScenario && demoCitizenReports.length > 0) {
      return demoCitizenReports.map(r => ({
        id: r.id,
        source: "citizen" as const,
        content: r.content,
        timestamp: r.timestamp,
        priority: r.priority,
        isOptedIn: r.isOptedIn,
      }));
    }
    return mockCitizenMessages;
  }, [demoEnabled, activeScenario, demoCitizenReports]);

  const activities = useMemo(() => {
    if (demoEnabled && activeScenario && demoActivityLog.length > 0) {
      return demoActivityLog;
    }
    return mockActivities;
  }, [demoEnabled, activeScenario, demoActivityLog]);

  const handlePromiseSelect = useCallback((promise: { id: string; locationId?: string }) => {
    setSelectedPromiseId(promise.id);
    if (promise.locationId) {
      setHighlightedMapIds([promise.locationId]);
    }
  }, []);

  const handlePromiseFilterChange = useCallback((status: string | null) => {
    if (status) {
      const filtered = mockPromises
        .filter((p) => p.status === status && p.locationId)
        .map((p) => p.locationId as string);
      setHighlightedMapIds(filtered);
    } else {
      setHighlightedMapIds([]);
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="dashboard">
      <DangerBanner
        isActive={dangerActive}
        incidentId={currentIncident?.id || "INC-2847"}
        incidentTitle={currentIncident ? `${currentIncident.title} - ${currentIncident.location}` : "Urgent Safety Response - 445 Main Street"}
        startTime={dangerStartTime}
      />
      <TopBar boardType="operations" />

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col p-4 gap-4 min-h-0">
          <div className="h-48 grid grid-cols-3 gap-4">
            <InterfacePanel
              type="dispatcher"
              messages={mockDispatcherMessages}
              activeCount={mockDispatcherMessages.length}
              selectedMessageId={selectedMessageId}
              onMessageSelect={(m) => setSelectedMessageId(m.id)}
            />
            <InterfacePanel
              type="responder"
              messages={mockResponderMessages}
              activeCount={mockResponderMessages.length}
              selectedMessageId={selectedMessageId}
              onMessageSelect={(m) => setSelectedMessageId(m.id)}
            />
            <InterfacePanel
              type="citizen"
              messages={citizenMessages}
              activeCount={citizenMessages.length}
              selectedMessageId={selectedMessageId}
              onMessageSelect={(m) => setSelectedMessageId(m.id)}
            />
          </div>

          <div className="flex-1 rounded-lg border border-mrsg-cyan/10 bg-card/40 p-4 min-h-0 flex gap-4">
            <div className="flex-1">
              <UniversalMap
                markers={mapMarkers}
                mode="operations"
                highlightedIds={highlightedMapIds}
                dangerFocusId={dangerActive ? "C1" : undefined}
                showLegend={false}
                onRefresh={() => console.log("Map refreshed")}
              />
            </div>
            <div className="w-48 shrink-0">
              <MapLegendPanel />
            </div>
          </div>
        </div>

        <aside className="w-80 border-l border-mrsg-cyan/10 bg-card/20 p-4 flex flex-col gap-4 overflow-y-auto">
          <DemoModePanel compact />
          
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
              resolvedBy={currentIncident.resolvedBy}
              resolvedAt={currentIncident.resolvedAt}
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
              sourceType="911_call"
              zone="Downtown Core"
            />
          )}
          <PromisesModule
            promises={mockPromises}
            selectedId={selectedPromiseId}
            onPromiseSelect={handlePromiseSelect}
            onFilterChange={handlePromiseFilterChange}
          />
          <ZoneIntelligence compact />
          <DataTransfer 
            className="h-56"
            onTransferAction={(id, action) => console.log(`Transfer ${id}: ${action}`)}
          />
          <div className="flex-1 min-h-0">
            <ActivityLog activities={activities} />
          </div>
        </aside>
      </div>
    </div>
  );
}
