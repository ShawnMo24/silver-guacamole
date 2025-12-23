import { IncidentCard } from "../IncidentCard";

export default function IncidentCardExample() {
  return (
    <div className="flex gap-4 p-4 bg-background">
      <IncidentCard
        id="INC-2847"
        title="Urgent Safety Response"
        location="445 Main Street"
        timestamp="14:32:18"
        assignedResponder="Unit Alpha-7"
        isPinned={true}
      />
      <IncidentCard
        id="INC-2846"
        title="Traffic Incident"
        location="Oak St & 5th Ave"
        timestamp="14:15:42"
        assignedResponder="Unit Beta-3"
        isPinned={false}
      />
    </div>
  );
}
