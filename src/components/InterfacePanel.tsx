import { cn } from "@/lib/utils";
import { StatusIndicator } from "./StatusIndicator";
import { MessageCard } from "./MessageCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio, Users, Shield } from "lucide-react";

type InterfaceType = "dispatcher" | "responder" | "citizen";

interface Message {
  id: string;
  source: "dispatcher" | "responder" | "citizen";
  destination?: "dispatcher" | "responder" | "citizen";
  content: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  isOptedIn?: boolean;
}

interface InterfacePanelProps {
  type: InterfaceType;
  messages: Message[];
  activeCount: number;
  selectedMessageId?: string;
  onMessageSelect?: (message: Message) => void;
  className?: string;
}

const interfaceConfig: Record<InterfaceType, { 
  label: string; 
  icon: typeof Radio; 
  description: string;
}> = {
  dispatcher: {
    label: "Dispatcher",
    icon: Radio,
    description: "Command & Control",
  },
  responder: {
    label: "Responder",
    icon: Shield,
    description: "Field Operations",
  },
  citizen: {
    label: "Citizen",
    icon: Users,
    description: "Public Interface",
  },
};

export function InterfacePanel({ 
  type, 
  messages, 
  activeCount, 
  selectedMessageId,
  onMessageSelect,
  className 
}: InterfacePanelProps) {
  const config = interfaceConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col h-full rounded-lg border border-mrsg-cyan/10 bg-card/40",
        className
      )}
      data-testid={`panel-${type}`}
    >
      <div className="flex items-center justify-between gap-4 p-4 border-b border-mrsg-cyan/10">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-mrsg-cyan" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-mrsg-cyan uppercase tracking-wide">
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">{config.description}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-muted/50 border border-border/50">
            <span className="text-xs font-mono text-foreground">{activeCount}</span>
            <span className="text-xs text-muted-foreground">active</span>
          </div>
          <StatusIndicator status={activeCount > 0 ? "active" : "offline"} showPulse={activeCount > 0} />
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                  <Icon className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <span className="text-sm text-muted-foreground">No active messages</span>
                <span className="text-xs text-muted-foreground/70 mt-1">Waiting for incoming data...</span>
              </div>
            ) : (
              messages.map((message) => (
                <MessageCard 
                  key={message.id} 
                  {...message} 
                  isSelected={selectedMessageId === message.id}
                  onClick={() => onMessageSelect?.(message)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="px-4 py-3 border-t border-mrsg-cyan/10 bg-muted/20">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-wider text-mrsg-cyan">Channel Status</span>
          <span className="font-mono text-muted-foreground">{messages.length} queued</span>
        </div>
      </div>
    </div>
  );
}
