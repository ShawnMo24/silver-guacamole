import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, ArrowLeftRight } from "lucide-react";

interface RoutingPath {
  id: string;
  from: "dispatcher" | "responder" | "citizen";
  to: "dispatcher" | "responder" | "citizen";
  active: boolean;
}

interface RoutingVisualizerProps {
  paths: RoutingPath[];
  className?: string;
}

const columnLabels = {
  dispatcher: "D",
  responder: "R",
  citizen: "C",
};

export function RoutingVisualizer({ paths, className }: RoutingVisualizerProps) {
  const getPathIcon = (from: string, to: string) => {
    const fromIndex = ["dispatcher", "responder", "citizen"].indexOf(from);
    const toIndex = ["dispatcher", "responder", "citizen"].indexOf(to);
    
    if (fromIndex < toIndex) return ArrowRight;
    if (fromIndex > toIndex) return ArrowLeft;
    return ArrowLeftRight;
  };

  return (
    <div className={cn("flex flex-col gap-2", className)} data-testid="routing-visualizer">
      <div className="text-xs font-semibold uppercase tracking-wider text-mrsg-cyan mb-2">
        Active Routes
      </div>
      
      {paths.length === 0 ? (
        <div className="text-xs text-muted-foreground/70 py-4 text-center">
          No active routing paths
        </div>
      ) : (
        <div className="space-y-2">
          {paths.map((path) => {
            const Icon = getPathIcon(path.from, path.to);
            return (
              <div
                key={path.id}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md border transition-all duration-300",
                  path.active
                    ? "border-mrsg-cyan/30 bg-mrsg-cyan/5"
                    : "border-border/30 bg-muted/20"
                )}
              >
                <span className={cn(
                  "text-xs font-mono font-semibold px-1.5 py-0.5 rounded",
                  path.active ? "bg-mrsg-cyan/20 text-mrsg-cyan" : "bg-muted text-muted-foreground"
                )}>
                  {columnLabels[path.from]}
                </span>
                
                <div className="flex-1 flex items-center justify-center">
                  <div className={cn(
                    "flex-1 h-px",
                    path.active ? "bg-gradient-to-r from-mrsg-cyan/50 to-transparent" : "bg-border/50"
                  )} />
                  <Icon className={cn(
                    "h-3 w-3 mx-1",
                    path.active ? "text-mrsg-cyan" : "text-muted-foreground/50"
                  )} />
                  <div className={cn(
                    "flex-1 h-px",
                    path.active ? "bg-gradient-to-l from-mrsg-cyan/50 to-transparent" : "bg-border/50"
                  )} />
                </div>
                
                <span className={cn(
                  "text-xs font-mono font-semibold px-1.5 py-0.5 rounded",
                  path.active ? "bg-mrsg-cyan/20 text-mrsg-cyan" : "bg-muted text-muted-foreground"
                )}>
                  {columnLabels[path.to]}
                </span>
                
                {path.active && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mrsg-cyan opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-mrsg-cyan" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
