import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Zap, 
  AlertTriangle,
  Car,
  Search,
  Heart,
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
  Activity
} from "lucide-react";
import { useDemoMode, type ScenarioType, type Scenario } from "@/contexts/DemoModeContext";
import { cn } from "@/lib/utils";

interface DemoModePanelProps {
  className?: string;
  compact?: boolean;
}

const scenarioIcons: Record<ScenarioType, typeof Zap> = {
  armed_robbery: Zap,
  traffic_accident: Car,
  missing_person: Search,
  welfare_check: Heart,
  crowd_control: Users,
};

const severityColors: Record<Scenario["severity"], string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

export function DemoModePanel({ className, compact = false }: DemoModePanelProps) {
  const {
    isEnabled,
    activeScenario,
    isPlaying,
    playbackSpeed,
    elapsedTime,
    incidents,
    responders,
    activityLog,
    toggleDemoMode,
    startScenario,
    stopScenario,
    togglePlayback,
    setPlaybackSpeed,
    resetDemo,
    getAvailableScenarios,
  } = useDemoMode();

  const [expanded, setExpanded] = useState(!compact);
  const scenarios = getAvailableScenarios();

  const formatElapsedTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (compact && !expanded) {
    return (
      <Card className={cn("border-mrsg-cyan/20", className)}>
        <CardHeader className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-mrsg-cyan" />
              <CardTitle className="text-sm">Demo Mode</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isEnabled}
                onCheckedChange={toggleDemoMode}
                data-testid="switch-demo-mode"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setExpanded(true)}
                data-testid="button-expand-demo"
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {isEnabled && activeScenario && (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-xs bg-mrsg-cyan/10 border-mrsg-cyan/30 text-mrsg-cyan">
                  {scenarios.find((s) => s.id === activeScenario)?.name}
                </Badge>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-mrsg-cyan font-mono" data-testid="text-elapsed-time">{formatElapsedTime(elapsedTime)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant={isPlaying ? "default" : "outline"}
                    className="h-6 w-6"
                    onClick={togglePlayback}
                    data-testid="button-playback-toggle"
                  >
                    {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-6 w-6"
                    onClick={stopScenario}
                    data-testid="button-stop-scenario"
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                </div>
                <Badge variant="outline" className={cn(
                  "text-[10px]",
                  isPlaying ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                )} data-testid="badge-status">
                  {isPlaying ? "Running" : "Paused"}
                </Badge>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("border-mrsg-cyan/20", className)}>
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-mrsg-cyan" />
            <CardTitle className="text-sm">Demo Mode</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={toggleDemoMode}
              data-testid="switch-demo-mode"
            />
            {compact && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => setExpanded(false)}
                data-testid="button-collapse-demo"
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-3">
        {!isEnabled ? (
          <div className="text-xs text-muted-foreground text-center py-4">
            Enable demo mode to simulate emergency scenarios
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Select Scenario</Label>
              <ScrollArea className="h-32">
                <div className="space-y-1 pr-2">
                  {scenarios.map((scenario) => {
                    const Icon = scenarioIcons[scenario.id];
                    const isActive = activeScenario === scenario.id;
                    
                    return (
                      <button
                        key={scenario.id}
                        onClick={() => !isActive && startScenario(scenario.id)}
                        disabled={isActive && isPlaying}
                        className={cn(
                          "w-full flex items-start gap-2 p-2 rounded-md text-left transition-colors",
                          isActive
                            ? "bg-mrsg-cyan/20 border border-mrsg-cyan/40"
                            : "hover-elevate border border-transparent"
                        )}
                        data-testid={`button-scenario-${scenario.id}`}
                      >
                        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", isActive ? "text-mrsg-cyan" : "text-muted-foreground")} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className={cn("text-xs font-medium truncate", isActive && "text-mrsg-cyan")}>
                              {scenario.name}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={cn("text-[10px] px-1 py-0 shrink-0", severityColors[scenario.severity])}
                            >
                              {scenario.severity}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground line-clamp-1">
                            {scenario.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {activeScenario && (
              <>
                <div className="h-px bg-border" />
                
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant={isPlaying ? "default" : "outline"}
                      className="h-7 w-7"
                      onClick={togglePlayback}
                      data-testid="button-playback-toggle"
                    >
                      {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={stopScenario}
                      data-testid="button-stop-scenario"
                    >
                      <Square className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={resetDemo}
                      data-testid="button-reset-demo"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-mono text-mrsg-cyan">{formatElapsedTime(elapsedTime)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Speed</Label>
                    <span className="text-xs font-mono text-muted-foreground">{playbackSpeed}x</span>
                  </div>
                  <Slider
                    value={[playbackSpeed]}
                    onValueChange={([v]) => setPlaybackSpeed(v)}
                    min={0.5}
                    max={4}
                    step={0.5}
                    className="w-full"
                    data-testid="slider-playback-speed"
                  />
                </div>

                <div className="h-px bg-border" />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      isPlaying ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    )}>
                      {isPlaying ? "Running" : "Paused"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-md bg-card/60 border border-border/50">
                      <div className="text-lg font-bold text-mrsg-cyan">{incidents.length}</div>
                      <div className="text-[10px] text-muted-foreground">Incidents</div>
                    </div>
                    <div className="p-2 rounded-md bg-card/60 border border-border/50">
                      <div className="text-lg font-bold text-mrsg-cyan">
                        {responders.filter((r) => r.status !== "available").length}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Responding</div>
                    </div>
                    <div className="p-2 rounded-md bg-card/60 border border-border/50">
                      <div className="text-lg font-bold text-mrsg-cyan">{activityLog.length}</div>
                      <div className="text-[10px] text-muted-foreground">Events</div>
                    </div>
                  </div>
                </div>

                {activityLog.length > 0 && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Recent Activity</Label>
                      <ScrollArea className="h-20">
                        <div className="space-y-1 pr-2">
                          {activityLog.slice(-5).reverse().map((log) => (
                            <div 
                              key={log.id} 
                              className="flex items-start gap-2 text-[10px]"
                            >
                              <span className="text-muted-foreground font-mono shrink-0">{log.timestamp}</span>
                              <span className={cn(
                                log.type === "incoming" && "text-green-400",
                                log.type === "outgoing" && "text-blue-400",
                                log.type === "system" && "text-yellow-400"
                              )}>
                                {log.message}
                              </span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function DemoModeToggle() {
  const { isEnabled, activeScenario, isPlaying, toggleDemoMode, getAvailableScenarios } = useDemoMode();
  const scenarios = getAvailableScenarios();
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <Activity className={cn("h-3 w-3", isEnabled ? "text-mrsg-cyan" : "text-muted-foreground")} />
        <span className="text-xs text-muted-foreground">Demo</span>
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={toggleDemoMode}
        data-testid="switch-demo-toggle-topbar"
      />
      {isEnabled && activeScenario && (
        <Badge 
          variant="outline" 
          className={cn(
            "text-[10px] px-1.5",
            isPlaying 
              ? "bg-mrsg-cyan/20 border-mrsg-cyan/40 text-mrsg-cyan animate-pulse" 
              : "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
          )}
        >
          {scenarios.find((s) => s.id === activeScenario)?.name}
        </Badge>
      )}
    </div>
  );
}
