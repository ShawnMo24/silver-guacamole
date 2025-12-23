import { LiveMap } from "../LiveMap";

// todo: remove mock functionality
const mockMarkers = [
  { id: "R1", type: "responder" as const, x: 25, y: 30, label: "Unit Alpha-7", isOptedIn: true },
  { id: "R2", type: "responder" as const, x: 60, y: 45, label: "Unit Beta-3", isOptedIn: true },
  { id: "R3", type: "responder" as const, x: 80, y: 70, label: "Unit Delta-1", isOptedIn: true },
  { id: "C1", type: "citizen" as const, x: 30, y: 55, label: "Caller #1042", status: "incoming" as const, isOptedIn: false },
  { id: "C2", type: "citizen" as const, x: 55, y: 35, label: "Caller #1041", status: "active" as const, isOptedIn: true },
  { id: "C3", type: "citizen" as const, x: 70, y: 60, label: "Case #1039", status: "unresolved" as const, isOptedIn: false },
];

export default function LiveMapExample() {
  return (
    <div className="h-[400px] w-[500px] p-4 bg-background">
      <LiveMap markers={mockMarkers} highlightedIds={["C1", "R1"]} />
    </div>
  );
}
