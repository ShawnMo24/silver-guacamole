import { StatusIndicator } from "../StatusIndicator";

export default function StatusIndicatorExample() {
  return (
    <div className="flex flex-col gap-4 p-6 bg-background">
      <StatusIndicator status="online" label="System Online" />
      <StatusIndicator status="active" label="Active" />
      <StatusIndicator status="pending" label="Pending" />
      <StatusIndicator status="warning" label="Warning" />
      <StatusIndicator status="offline" label="Offline" />
    </div>
  );
}
