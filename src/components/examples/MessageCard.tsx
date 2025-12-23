import { MessageCard } from "../MessageCard";

export default function MessageCardExample() {
  return (
    <div className="flex flex-col gap-4 p-6 bg-background max-w-md">
      <MessageCard
        id="MSG-001"
        source="dispatcher"
        destination="responder"
        content="Unit Alpha-7, proceed to sector 4B for welfare check. Civilian reported unusual activity near the intersection."
        timestamp="14:32:18"
        priority="high"
      />
      <MessageCard
        id="MSG-002"
        source="citizen"
        content="Requesting assistance with traffic signal malfunction at Main St and 5th Ave."
        timestamp="14:28:05"
        priority="medium"
      />
      <MessageCard
        id="MSG-003"
        source="responder"
        destination="dispatcher"
        content="Unit Beta-3 arriving on scene. Situation under control."
        timestamp="14:25:42"
        priority="low"
      />
    </div>
  );
}
