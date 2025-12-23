import { AlertTriangle, Phone, Info } from "lucide-react";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { cn } from "@/lib/utils";

interface SafetyBannerProps {
  variant?: "full" | "compact" | "emergency";
  className?: string;
}

export function SafetyBanner({ variant = "compact", className }: SafetyBannerProps) {
  const { isEnabled: isDemoMode } = useDemoMode();

  if (variant === "emergency") {
    return (
      <div className={cn(
        "bg-amber-500/10 border border-amber-500/30 rounded-md p-4 text-center",
        className
      )} data-testid="safety-banner-emergency">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Phone className="h-5 w-5 text-amber-500" />
          <span className="font-semibold text-amber-500">If you are in immediate danger, call 911 now.</span>
        </div>
        <p className="text-sm text-muted-foreground">
          This system provides support coordination - it does not replace emergency services.
        </p>
      </div>
    );
  }

  if (variant === "full") {
    return (
      <div className={cn(
        "bg-card border border-border rounded-md p-4",
        className
      )} data-testid="safety-banner-full">
        {isDemoMode && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-mrsg-cyan/10 border border-mrsg-cyan/30 rounded-md">
            <Info className="h-4 w-4 text-mrsg-cyan shrink-0" />
            <span className="text-xs text-mrsg-cyan font-medium">
              DEMONSTRATION MODE - Simulated data only. Not connected to real emergency services.
            </span>
          </div>
        )}
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Important Notice</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>This is an informational support system - not emergency dispatch.</li>
              <li>For life-threatening emergencies, always call 911 first.</li>
              <li>This system helps coordinate community support resources.</li>
              <li>Reports are handled with care but may not trigger immediate response.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-center gap-2 px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/30 text-xs",
      className
    )} data-testid="safety-banner-compact">
      {isDemoMode && (
        <>
          <span className="px-1.5 py-0.5 bg-mrsg-cyan/20 text-mrsg-cyan font-medium rounded text-[10px] uppercase tracking-wider">
            Demo Mode
          </span>
          <span className="text-muted-foreground">|</span>
        </>
      )}
      <AlertTriangle className="h-3 w-3 text-amber-500" />
      <span className="text-amber-600 dark:text-amber-400">
        This is a support system, not 911. For emergencies, call 911.
      </span>
    </div>
  );
}

export function EmergencyCallout({ className }: { className?: string }) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 rounded-r-md",
      className
    )} data-testid="emergency-callout">
      <Phone className="h-5 w-5 text-amber-500 shrink-0" />
      <div>
        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
          In immediate danger? Call 911 now.
        </p>
        <p className="text-xs text-muted-foreground">
          Take a breath. Help is available.
        </p>
      </div>
    </div>
  );
}

export function DemoModeIndicator({ className }: { className?: string }) {
  const { isEnabled: isDemoMode, activeScenario } = useDemoMode();

  if (!isDemoMode) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-mrsg-cyan/90 text-background rounded-md shadow-lg",
      className
    )} data-testid="demo-mode-indicator-fixed">
      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      <span className="text-xs font-semibold uppercase tracking-wider">
        Demo Mode {activeScenario ? "- Simulation Active" : ""}
      </span>
    </div>
  );
}
