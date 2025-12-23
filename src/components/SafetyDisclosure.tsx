import { Shield, Heart, Info, Phone, Lock, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SafetyDisclosureProps {
  variant?: "inline" | "modal";
  className?: string;
}

export function SafetyDisclosure({ variant = "modal", className }: SafetyDisclosureProps) {
  const content = (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Heart className="h-4 w-4 text-stable" />
          How This Preserves Life
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-stable shrink-0">1.</span>
            <span>We connect people in distress with appropriate support resources quickly and compassionately.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-stable shrink-0">2.</span>
            <span>Our system uses trauma-informed approaches to reduce stress during difficult moments.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-stable shrink-0">3.</span>
            <span>We prioritize de-escalation and community care over punitive responses.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-stable shrink-0">4.</span>
            <span>Coordinators receive real-time information to provide appropriate support.</span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Lock className="h-4 w-4 text-mrsg-cyan" />
          Your Privacy
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-mrsg-cyan shrink-0">-</span>
            <span>We collect only the minimum information needed to provide support.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-mrsg-cyan shrink-0">-</span>
            <span>Sensitive details are not logged or stored beyond immediate need.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-mrsg-cyan shrink-0">-</span>
            <span>Your data is handled with care and respect for your dignity.</span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Phone className="h-4 w-4 text-amber-500" />
          Important Limitations
        </h3>
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md">
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-2">
            This is NOT a replacement for 911.
          </p>
          <p className="text-xs text-muted-foreground">
            For life-threatening emergencies, always call 911 first. This system provides community support coordination but does not dispatch emergency services.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Who Sees Your Information
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="shrink-0">-</span>
            <span>Trained support coordinators who can help connect you with resources.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0">-</span>
            <span>Community responders you request to assist you.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0">-</span>
            <span>Information is shared on a need-to-know basis only.</span>
          </li>
        </ul>
      </section>
    </div>
  );

  if (variant === "inline") {
    return (
      <Card className={cn("p-4", className)} data-testid="safety-disclosure-inline">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-mrsg-cyan" />
          <h2 className="font-semibold">About This System</h2>
        </div>
        {content}
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-2", className)} data-testid="button-safety-disclosure">
          <Info className="h-4 w-4" />
          <span>About Safety</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto" data-testid="dialog-safety-disclosure">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-mrsg-cyan" />
            About This System
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
