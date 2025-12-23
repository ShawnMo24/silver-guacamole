import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type ScenarioType = 
  | "armed_robbery"
  | "traffic_accident"
  | "missing_person"
  | "welfare_check"
  | "crowd_control";

export interface Scenario {
  id: ScenarioType;
  name: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  estimatedDuration: string;
}

export type AlertStatus = "active" | "acknowledged" | "monitoring" | "resolved";

export type SourceType = "911_call" | "citizen_report" | "sensor" | "community_tip" | "system";

export interface SimulatedIncident {
  id: string;
  title: string;
  location: string;
  status: AlertStatus;
  priority: "high" | "medium" | "low";
  timestamp: string;
  scenario: ScenarioType;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  sourceType?: SourceType;
  zone?: string;
}

export interface SimulatedResponder {
  id: string;
  unitId: string;
  x: number;
  y: number;
  status: "available" | "en_route" | "on_scene" | "busy";
  assignedIncidentId?: string;
}

export interface SimulatedCitizenReport {
  id: string;
  content: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  isOptedIn: boolean;
  location: string;
}

interface DemoModeState {
  isEnabled: boolean;
  activeScenario: ScenarioType | null;
  isPlaying: boolean;
  playbackSpeed: number;
  elapsedTime: number;
  incidents: SimulatedIncident[];
  responders: SimulatedResponder[];
  citizenReports: SimulatedCitizenReport[];
  activityLog: Array<{
    id: string;
    type: "incoming" | "outgoing" | "system";
    message: string;
    timestamp: string;
    channel?: string;
  }>;
}

export type UserRole = "dispatcher" | "responder" | "citizen";

interface DemoModeContextType extends DemoModeState {
  toggleDemoMode: () => void;
  startScenario: (scenario: ScenarioType) => void;
  stopScenario: () => void;
  togglePlayback: () => void;
  setPlaybackSpeed: (speed: number) => void;
  resetDemo: () => void;
  getAvailableScenarios: () => Scenario[];
  updateIncidentStatus: (incidentId: string, newStatus: AlertStatus, role: UserRole) => boolean;
  canTransitionTo: (currentStatus: AlertStatus, newStatus: AlertStatus, role: UserRole) => boolean;
}

const SCENARIOS: Scenario[] = [
  {
    id: "armed_robbery",
    name: "Urgent Safety Response",
    description: "Priority response scenario with multiple responders and citizen coordination",
    severity: "critical",
    estimatedDuration: "15 min",
  },
  {
    id: "traffic_accident",
    name: "Traffic Incident",
    description: "Multi-vehicle collision requiring medical support and traffic coordination",
    severity: "high",
    estimatedDuration: "20 min",
  },
  {
    id: "missing_person",
    name: "Person Locate",
    description: "Community coordination to locate and support an individual",
    severity: "medium",
    estimatedDuration: "45 min",
  },
  {
    id: "welfare_check",
    name: "Wellness Check",
    description: "Wellness check with supportive response based on findings",
    severity: "low",
    estimatedDuration: "10 min",
  },
  {
    id: "crowd_control",
    name: "Community Event Support",
    description: "Large public event requiring coordinated presence and monitoring",
    severity: "medium",
    estimatedDuration: "2 hours",
  },
];

const INITIAL_STATE: DemoModeState = {
  isEnabled: false,
  activeScenario: null,
  isPlaying: false,
  playbackSpeed: 1,
  elapsedTime: 0,
  incidents: [],
  responders: [
    { id: "R1", unitId: "Alpha-7", x: 45, y: 35, status: "available" },
    { id: "R2", unitId: "Beta-3", x: 25, y: 55, status: "available" },
    { id: "R3", unitId: "Delta-1", x: 75, y: 65, status: "available" },
    { id: "R4", unitId: "Echo-2", x: 60, y: 25, status: "available" },
  ],
  citizenReports: [],
  activityLog: [],
};

const DemoModeContext = createContext<DemoModeContextType | null>(null);

function generateTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function generateScenarioData(scenario: ScenarioType): Partial<DemoModeState> {
  const timestamp = generateTimestamp();
  
  switch (scenario) {
    case "armed_robbery":
      return {
        incidents: [
          {
            id: "INC-2847",
            title: "Urgent Safety Response",
            location: "445 Main Street",
            status: "active",
            priority: "high",
            timestamp,
            scenario,
            sourceType: "911_call",
            zone: "Downtown Core",
          },
        ],
        citizenReports: [
          {
            id: "CTZ-001",
            content: "Safety concern at 445 Main Street. Multiple individuals, immediate response requested.",
            timestamp,
            priority: "high",
            isOptedIn: true,
            location: "445 Main Street",
          },
        ],
        activityLog: [
          { id: "1", type: "incoming", message: "PRIORITY: Urgent response needed 445 Main Street", timestamp, channel: "dispatch" },
          { id: "2", type: "system", message: "Response window timer started - 4 minute target", timestamp },
        ],
      };
    
    case "traffic_accident":
      return {
        incidents: [
          {
            id: "INC-2848",
            title: "Multi-Vehicle Collision",
            location: "Highway 101 @ Exit 23",
            status: "active",
            priority: "high",
            timestamp,
            scenario,
            sourceType: "citizen_report",
            zone: "Highway Corridor",
          },
        ],
        citizenReports: [
          {
            id: "CTZ-002",
            content: "Three car pileup on Highway 101. At least one person injured.",
            timestamp,
            priority: "high",
            isOptedIn: true,
            location: "Highway 101",
          },
          {
            id: "CTZ-003",
            content: "Traffic backing up for miles. Need traffic control ASAP.",
            timestamp,
            priority: "medium",
            isOptedIn: false,
            location: "Highway 101",
          },
        ],
        activityLog: [
          { id: "1", type: "incoming", message: "Traffic incident reported - Highway 101 @ Exit 23", timestamp, channel: "dispatch" },
          { id: "2", type: "system", message: "EMS and traffic units notified", timestamp },
        ],
      };
    
    case "missing_person":
      return {
        incidents: [
          {
            id: "INC-2849",
            title: "Person Locate - Child",
            location: "Central Park Area",
            status: "active",
            priority: "high",
            timestamp,
            scenario,
            sourceType: "citizen_report",
            zone: "Central District",
          },
        ],
        citizenReports: [
          {
            id: "CTZ-004",
            content: "Family seeking help locating 8-year-old from Central Park. Last seen wearing blue jacket.",
            timestamp,
            priority: "high",
            isOptedIn: true,
            location: "Central Park",
          },
        ],
        activityLog: [
          { id: "1", type: "incoming", message: "Person locate request - Child, Age 8", timestamp, channel: "citizen" },
          { id: "2", type: "system", message: "Community coordination activated", timestamp },
          { id: "3", type: "outgoing", message: "All units in sector 7 requested to assist", timestamp, channel: "responder" },
        ],
      };
    
    case "welfare_check":
      return {
        incidents: [
          {
            id: "INC-2850",
            title: "Wellness Check Request",
            location: "123 Oak Street, Apt 4B",
            status: "active",
            priority: "medium",
            timestamp,
            scenario,
            sourceType: "community_tip",
            zone: "Residential East",
          },
        ],
        citizenReports: [
          {
            id: "CTZ-005",
            content: "Concerned neighbor checking on elderly resident not seen in 3 days.",
            timestamp,
            priority: "medium",
            isOptedIn: true,
            location: "123 Oak Street",
          },
        ],
        activityLog: [
          { id: "1", type: "incoming", message: "Wellness check requested - 123 Oak Street", timestamp, channel: "citizen" },
          { id: "2", type: "system", message: "Unit dispatched for wellness check", timestamp },
        ],
      };
    
    case "crowd_control":
      return {
        incidents: [
          {
            id: "INC-2851",
            title: "Community Event Support",
            location: "City Stadium Complex",
            status: "active",
            priority: "medium",
            timestamp,
            scenario,
            sourceType: "system",
            zone: "Entertainment District",
          },
        ],
        citizenReports: [],
        activityLog: [
          { id: "1", type: "system", message: "Event support activated - City Stadium", timestamp },
          { id: "2", type: "outgoing", message: "All support units check in", timestamp, channel: "responder" },
        ],
      };
    
    default:
      return {};
  }
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoModeState>(INITIAL_STATE);

  const toggleDemoMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isEnabled: !prev.isEnabled,
      activeScenario: prev.isEnabled ? null : prev.activeScenario,
      isPlaying: prev.isEnabled ? false : prev.isPlaying,
    }));
  }, []);

  const startScenario = useCallback((scenario: ScenarioType) => {
    const scenarioData = generateScenarioData(scenario);
    setState((prev) => ({
      ...prev,
      activeScenario: scenario,
      isPlaying: true,
      elapsedTime: 0,
      ...scenarioData,
      responders: prev.responders.map((r, i) => ({
        ...r,
        status: i === 0 ? "en_route" : "available",
        assignedIncidentId: i === 0 ? scenarioData.incidents?.[0]?.id : undefined,
      })),
    }));
  }, []);

  const stopScenario = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeScenario: null,
      isPlaying: false,
      elapsedTime: 0,
      incidents: [],
      citizenReports: [],
      activityLog: [],
      responders: INITIAL_STATE.responders,
    }));
  }, []);

  const togglePlayback = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, playbackSpeed: speed }));
  }, []);

  const resetDemo = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const getAvailableScenarios = useCallback(() => SCENARIOS, []);

  const canTransitionTo = useCallback((currentStatus: AlertStatus, newStatus: AlertStatus, role: UserRole): boolean => {
    const validTransitions: Record<AlertStatus, AlertStatus[]> = {
      active: ["acknowledged"],
      acknowledged: ["monitoring", "resolved"],
      monitoring: ["resolved"],
      resolved: [],
    };
    
    if (!validTransitions[currentStatus].includes(newStatus)) {
      return false;
    }
    
    if (newStatus === "acknowledged" && role !== "dispatcher") {
      return false;
    }
    
    if (newStatus === "resolved" && role !== "responder" && role !== "citizen") {
      return false;
    }
    
    return true;
  }, []);

  const updateIncidentStatus = useCallback((incidentId: string, newStatus: AlertStatus, role: UserRole): boolean => {
    const incident = state.incidents.find(i => i.id === incidentId);
    if (!incident) return false;
    
    if (!canTransitionTo(incident.status, newStatus, role)) {
      return false;
    }
    
    const timestamp = generateTimestamp();
    const roleLabel = role === "dispatcher" ? "Dispatch" : role === "responder" ? "Responder" : "Citizen";
    
    setState(prev => ({
      ...prev,
      incidents: prev.incidents.map(i => {
        if (i.id !== incidentId) return i;
        return {
          ...i,
          status: newStatus,
          ...(newStatus === "acknowledged" && { acknowledgedBy: roleLabel, acknowledgedAt: timestamp }),
          ...(newStatus === "resolved" && { resolvedBy: roleLabel, resolvedAt: timestamp }),
        };
      }),
      activityLog: [
        ...prev.activityLog,
        {
          id: `status-${Date.now()}`,
          type: "system" as const,
          message: `Alert ${incidentId} ${newStatus.toUpperCase()} by ${roleLabel}`,
          timestamp,
        },
      ],
    }));
    
    return true;
  }, [state.incidents, canTransitionTo]);

  useEffect(() => {
    if (!state.isEnabled || !state.isPlaying || !state.activeScenario) return;

    const interval = setInterval(() => {
      setState((prev) => {
        const newElapsed = prev.elapsedTime + 1;
        const timestamp = generateTimestamp();
        
        let updates: Partial<DemoModeState> = { elapsedTime: newElapsed };

        if (newElapsed === 5) {
          updates.activityLog = [
            ...prev.activityLog,
            { id: `log-${newElapsed}`, type: "outgoing", message: "Unit Alpha-7 responding", timestamp, channel: "responder" },
          ];
          updates.responders = prev.responders.map((r) =>
            r.id === "R1" ? { ...r, status: "en_route" as const } : r
          );
        }
        
        if (newElapsed === 15) {
          updates.activityLog = [
            ...prev.activityLog,
            { id: `log-${newElapsed}`, type: "system", message: "Unit Alpha-7 on scene", timestamp },
          ];
          updates.responders = prev.responders.map((r) =>
            r.id === "R1" ? { ...r, status: "on_scene" as const, x: 50, y: 40 } : r
          );
          updates.incidents = prev.incidents.map((i) => ({ ...i, status: "acknowledged" as const, acknowledgedBy: "Unit Alpha-7", acknowledgedAt: timestamp }));
        }
        
        if (newElapsed === 30) {
          updates.activityLog = [
            ...prev.activityLog,
            { id: `log-${newElapsed}`, type: "incoming", message: "Backup unit requested", timestamp, channel: "responder" },
          ];
          updates.responders = prev.responders.map((r) =>
            r.id === "R2" ? { ...r, status: "en_route" as const, assignedIncidentId: prev.incidents[0]?.id } : r
          );
        }
        
        if (newElapsed === 45) {
          updates.activityLog = [
            ...prev.activityLog,
            { id: `log-${newElapsed}`, type: "system", message: "Situation stabilized - Monitoring", timestamp },
          ];
          updates.incidents = prev.incidents.map((i) => ({ ...i, status: "monitoring" as const }));
        }

        if (newElapsed >= 60) {
          updates.activityLog = [
            ...prev.activityLog,
            { id: `log-${newElapsed}`, type: "system", message: "Incident resolved - Scene secure", timestamp },
          ];
          updates.incidents = prev.incidents.map((i) => ({ ...i, status: "resolved" as const }));
          updates.isPlaying = false;
        }

        return { ...prev, ...updates };
      });
    }, 1000 / state.playbackSpeed);

    return () => clearInterval(interval);
  }, [state.isEnabled, state.isPlaying, state.activeScenario, state.playbackSpeed]);

  return (
    <DemoModeContext.Provider
      value={{
        ...state,
        toggleDemoMode,
        startScenario,
        stopScenario,
        togglePlayback,
        setPlaybackSpeed,
        resetDemo,
        getAvailableScenarios,
        updateIncidentStatus,
        canTransitionTo,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error("useDemoMode must be used within DemoModeProvider");
  }
  return context;
}
