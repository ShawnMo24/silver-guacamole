import { DangerBanner } from "../DangerBanner";

export default function DangerBannerExample() {
  return (
    <div className="w-full bg-background">
      <DangerBanner
        isActive={true}
        incidentId="INC-2847"
        incidentTitle="Urgent Safety Response - 445 Main Street"
        startTime={new Date(Date.now() - 120000)}
      />
    </div>
  );
}
