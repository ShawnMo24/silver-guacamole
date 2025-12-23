import { useState } from "react";
import { PromisesModule } from "../PromisesModule";

// todo: remove mock functionality
const mockPromises = [
  { id: "P1", description: "Follow-up call to Mrs. Johnson regarding noise complaint", dueTime: "16:00", status: "pending" as const, locationId: "C1" },
  { id: "P2", description: "Unit deployment to sector 4B confirmed", dueTime: "14:30", status: "kept" as const, locationId: "R1" },
  { id: "P3", description: "Traffic signal repair notification", dueTime: "12:00", status: "unkept" as const, locationId: "C3" },
  { id: "P4", description: "Welfare check scheduled for Oak Street", dueTime: "18:00", status: "pending" as const, locationId: "C2" },
  { id: "P5", description: "Response time guarantee for priority call", dueTime: "15:45", status: "kept" as const },
];

export default function PromisesModuleExample() {
  const [selectedId, setSelectedId] = useState<string | undefined>();

  return (
    <div className="h-72 w-80 p-4 bg-background">
      <PromisesModule
        promises={mockPromises}
        selectedId={selectedId}
        onPromiseSelect={(p) => {
          setSelectedId(p.id);
          console.log("Promise selected:", p);
        }}
        onFilterChange={(status) => console.log("Filter changed:", status)}
      />
    </div>
  );
}
