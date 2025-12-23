import { ActivityLog } from "../ActivityLog";

// todo: remove mock functionality
const mockActivities = [
  { id: "1", type: "incoming" as const, message: "New dispatch request received from Central", timestamp: "14:32:18", channel: "dispatch" },
  { id: "2", type: "outgoing" as const, message: "Route confirmation sent to Unit Alpha-7", timestamp: "14:31:45", channel: "responder" },
  { id: "3", type: "system" as const, message: "Channel synchronization complete", timestamp: "14:30:00" },
  { id: "4", type: "incoming" as const, message: "Citizen report submitted via portal", timestamp: "14:28:12", channel: "citizen" },
  { id: "5", type: "outgoing" as const, message: "Status update broadcast to all units", timestamp: "14:25:30", channel: "all" },
];

export default function ActivityLogExample() {
  return (
    <div className="h-64 w-80 p-4 bg-background">
      <ActivityLog activities={mockActivities} />
    </div>
  );
}
