import { PrivacyBadge } from "../PrivacyBadge";

export default function PrivacyBadgeExample() {
  return (
    <div className="flex gap-4 p-6 bg-background">
      <PrivacyBadge isOptedIn={true} />
      <PrivacyBadge isOptedIn={false} />
    </div>
  );
}
