import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Clock, Filter } from "lucide-react";

type PromiseStatus = "kept" | "unkept" | "pending";

interface Promise {
  id: string;
  description: string;
  dueTime: string;
  status: PromiseStatus;
  locationId?: string;
}

interface PromisesModuleProps {
  promises: Promise[];
  onFilterChange?: (status: PromiseStatus | null) => void;
  onPromiseSelect?: (promise: Promise) => void;
  selectedId?: string;
  className?: string;
}

const statusConfig: Record<PromiseStatus, { icon: typeof Check; color: string; bg: string; label: string }> = {
  kept: { icon: Check, color: "text-stable", bg: "bg-stable/10", label: "Kept" },
  unkept: { icon: X, color: "text-danger", bg: "bg-danger/10", label: "Unkept" },
  pending: { icon: Clock, color: "text-escalating", bg: "bg-escalating/10", label: "Pending" },
};

export function PromisesModule({
  promises,
  onFilterChange,
  onPromiseSelect,
  selectedId,
  className,
}: PromisesModuleProps) {
  const [activeFilter, setActiveFilter] = useState<PromiseStatus | null>(null);

  const handleFilterClick = (status: PromiseStatus) => {
    const newFilter = activeFilter === status ? null : status;
    setActiveFilter(newFilter);
    onFilterChange?.(newFilter);
  };

  const filteredPromises = activeFilter
    ? promises.filter((p) => p.status === activeFilter)
    : promises;

  const counts = {
    kept: promises.filter((p) => p.status === "kept").length,
    unkept: promises.filter((p) => p.status === "unkept").length,
    pending: promises.filter((p) => p.status === "pending").length,
  };

  return (
    <div className={cn("flex flex-col", className)} data-testid="promises-module">
      <div className="flex items-center justify-between pb-2 border-b border-mrsg-cyan/20">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-mrsg-cyan" />
          <span className="text-sm font-semibold text-mrsg-cyan uppercase tracking-wider">
            48-Hour Promises
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {promises.length} total
        </span>
      </div>

      <div className="flex items-center gap-1.5 py-2">
        {(["kept", "unkept", "pending"] as PromiseStatus[]).map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const isActive = activeFilter === status;

          return (
            <button
              key={status}
              onClick={() => handleFilterClick(status)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all",
                "border",
                isActive
                  ? cn(config.bg, config.color, "border-current")
                  : "border-border/50 text-muted-foreground hover:border-mrsg-cyan/30 hover:text-foreground"
              )}
              data-testid={`button-filter-${status}`}
            >
              <Icon className="h-2.5 w-2.5" />
              <span>{counts[status]}</span>
            </button>
          );
        })}

        {activeFilter && (
          <button
            onClick={() => {
              setActiveFilter(null);
              onFilterChange?.(null);
            }}
            className="ml-1 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-clear-filter"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <ScrollArea className="flex-1 max-h-48">
        <div className="space-y-1 py-1">
          {filteredPromises.length === 0 ? (
            <div className="text-xs text-muted-foreground/70 py-4 text-center">
              No promises match filter
            </div>
          ) : (
            filteredPromises.map((promise) => {
              const config = statusConfig[promise.status];
              const Icon = config.icon;
              const isSelected = selectedId === promise.id;

              return (
                <button
                  key={promise.id}
                  onClick={() => onPromiseSelect?.(promise)}
                  className={cn(
                    "w-full flex items-start gap-2 p-2 rounded text-left transition-all",
                    "border",
                    isSelected
                      ? "border-mrsg-cyan bg-mrsg-cyan/5"
                      : "border-transparent hover:bg-muted/30"
                  )}
                  data-testid={`promise-item-${promise.id}`}
                >
                  <div className={cn("p-1 rounded", config.bg)}>
                    <Icon className={cn("h-2.5 w-2.5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground line-clamp-1">
                      {promise.description}
                    </p>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Due: {promise.dueTime}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
