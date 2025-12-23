import { RoutingVisualizer } from "../RoutingVisualizer";

// todo: remove mock functionality
const mockPaths = [
  { id: "1", from: "dispatcher" as const, to: "responder" as const, active: true },
  { id: "2", from: "citizen" as const, to: "dispatcher" as const, active: true },
  { id: "3", from: "responder" as const, to: "citizen" as const, active: false },
];

export default function RoutingVisualizerExample() {
  return (
    <div className="p-6 bg-background w-80">
      <RoutingVisualizer paths={mockPaths} />
    </div>
  );
}
