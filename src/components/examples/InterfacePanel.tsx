import { InterfacePanel } from "../InterfacePanel";

// todo: remove mock functionality
const mockMessages = [
  {
    id: "MSG-001",
    source: "dispatcher" as const,
    destination: "responder" as const,
    content: "Unit Alpha-7, proceed to sector 4B for welfare check.",
    timestamp: "14:32:18",
    priority: "high" as const,
  },
  {
    id: "MSG-002",
    source: "dispatcher" as const,
    content: "All units standby for system update at 15:00.",
    timestamp: "14:28:05",
    priority: "low" as const,
  },
];

export default function InterfacePanelExample() {
  return (
    <div className="h-[500px] w-[400px] p-4 bg-background">
      <InterfacePanel
        type="dispatcher"
        messages={mockMessages}
        activeCount={2}
      />
    </div>
  );
}
