import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  ArrowRightLeft, 
  Upload, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Database,
  RefreshCw,
  FileText
} from "lucide-react";

type TransferStatus = "pending" | "in-progress" | "completed" | "failed";
type TransferDirection = "upload" | "download" | "sync";

interface DataTransferItem {
  id: string;
  name: string;
  direction: TransferDirection;
  status: TransferStatus;
  recordCount: number;
  timestamp: string;
  source: string;
  destination: string;
}

const mockTransfers: DataTransferItem[] = [
  { id: "TRF-001", name: "Incident Reports Sync", direction: "sync", status: "completed", recordCount: 47, timestamp: "14:25:00", source: "Dispatch Board", destination: "Central Database" },
  { id: "TRF-002", name: "Responder Locations", direction: "upload", status: "in-progress", recordCount: 12, timestamp: "14:30:15", source: "Field Units", destination: "LPM Cerebral Console" },
  { id: "TRF-003", name: "Citizen Reports Export", direction: "download", status: "pending", recordCount: 156, timestamp: "14:32:00", source: "Citizen Portal", destination: "Archive System" },
  { id: "TRF-004", name: "Shift Schedule Update", direction: "sync", status: "failed", recordCount: 8, timestamp: "14:15:30", source: "HR System", destination: "Dispatch Board" },
];

const statusConfig: Record<TransferStatus, { color: string; bgColor: string; icon: typeof CheckCircle }> = {
  pending: { color: "text-muted-foreground", bgColor: "bg-muted/30", icon: Clock },
  "in-progress": { color: "text-mrsg-cyan", bgColor: "bg-mrsg-cyan/20", icon: RefreshCw },
  completed: { color: "text-stable", bgColor: "bg-stable/20", icon: CheckCircle },
  failed: { color: "text-danger", bgColor: "bg-danger/20", icon: AlertCircle },
};

const directionConfig: Record<TransferDirection, { color: string; icon: typeof Upload }> = {
  upload: { color: "text-mrsg-cyan", icon: Upload },
  download: { color: "text-escalating", icon: Download },
  sync: { color: "text-stable", icon: ArrowRightLeft },
};

interface DataTransferProps {
  className?: string;
  onTransferAction?: (id: string, action: "retry" | "cancel" | "view") => void;
}

export function DataTransfer({ className, onTransferAction }: DataTransferProps) {
  const [transfers] = useState<DataTransferItem[]>(mockTransfers);

  const pendingCount = transfers.filter(t => t.status === "pending").length;
  const inProgressCount = transfers.filter(t => t.status === "in-progress").length;
  const totalRecords = transfers.reduce((sum, t) => sum + t.recordCount, 0);

  return (
    <div className={cn("flex flex-col rounded-lg border border-mrsg-cyan/10 bg-card/40", className)} data-testid="panel-data-transfer">
      <div className="flex items-center justify-between gap-4 p-4 border-b border-mrsg-cyan/10">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-mrsg-cyan" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-mrsg-cyan uppercase tracking-wide">
              Data Transfer
            </span>
            <span className="text-xs text-muted-foreground">System Synchronization</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {inProgressCount > 0 && (
            <Badge variant="secondary" className="font-mono text-xs bg-mrsg-cyan/20 text-mrsg-cyan border-mrsg-cyan/30">
              {inProgressCount} active
            </Badge>
          )}
          <Badge variant="secondary" className="font-mono text-xs">
            {totalRecords} records
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {pendingCount} pending
          </span>
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3 text-mrsg-cyan" />
            {inProgressCount} syncing
          </span>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-6 px-2 text-xs"
          data-testid="button-refresh-transfers"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {transfers.map((transfer) => {
            const statusCfg = statusConfig[transfer.status];
            const dirCfg = directionConfig[transfer.direction];
            const StatusIcon = statusCfg.icon;
            const DirIcon = dirCfg.icon;

            return (
              <div
                key={transfer.id}
                className={cn(
                  "p-3 rounded-md border transition-all",
                  statusCfg.bgColor,
                  "border-border/50"
                )}
                data-testid={`transfer-${transfer.id}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <DirIcon className={cn("h-4 w-4", dirCfg.color)} />
                    <span className="text-sm font-medium text-foreground">{transfer.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusIcon className={cn("h-3 w-3", statusCfg.color, transfer.status === "in-progress" && "animate-spin")} />
                    <Badge variant="outline" className={cn("text-[10px] font-mono capitalize", statusCfg.color)}>
                      {transfer.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="font-mono">{transfer.id}</span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {transfer.recordCount} records
                  </span>
                </div>

                <div className="text-xs text-muted-foreground mb-2">
                  <span className="text-foreground/70">{transfer.source}</span>
                  <ArrowRightLeft className="h-3 w-3 inline mx-1" />
                  <span className="text-foreground/70">{transfer.destination}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {transfer.timestamp}
                  </span>
                  <div className="flex items-center gap-1">
                    {transfer.status === "failed" && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-5 px-2 text-[10px] text-danger"
                        onClick={() => onTransferAction?.(transfer.id, "retry")}
                        data-testid={`button-retry-${transfer.id}`}
                      >
                        Retry
                      </Button>
                    )}
                    {transfer.status === "in-progress" && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-5 px-2 text-[10px]"
                        onClick={() => onTransferAction?.(transfer.id, "cancel")}
                        data-testid={`button-cancel-${transfer.id}`}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-5 px-2 text-[10px]"
                      onClick={() => onTransferAction?.(transfer.id, "view")}
                      data-testid={`button-view-${transfer.id}`}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-mrsg-cyan/10">
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            className="flex-1 h-8"
            data-testid="button-new-transfer"
          >
            <Upload className="h-3 w-3 mr-1" />
            New Transfer
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1 h-8"
            data-testid="button-sync-all"
          >
            <ArrowRightLeft className="h-3 w-3 mr-1" />
            Sync All
          </Button>
        </div>
      </div>
    </div>
  );
}
