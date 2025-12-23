import { StatusIndicator } from "./StatusIndicator";
import { ThemeToggle } from "./ThemeToggle";
import { DemoModeToggle } from "./DemoModePanel";
import { Activity, Radio, Headset, Shield, User, Brain, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions, UserRole } from "@/contexts/PermissionsContext";

interface TopBarProps {
  boardType?: "operations" | "dispatcher" | "responder" | "citizen" | "console";
}

export function TopBar({ boardType = "operations" }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { currentRole, setCurrentRole, canAccessRoute, getRoleLabel, getAllRoles } = usePermissions();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <header 
      className="h-14 border-b border-mrsg-cyan/20 bg-card/80 backdrop-blur-sm flex items-center justify-between px-6"
      data-testid="topbar"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {boardType === "dispatcher" ? (
            <Headset className="h-5 w-5 text-mrsg-cyan" />
          ) : boardType === "responder" ? (
            <Shield className="h-5 w-5 text-mrsg-cyan" />
          ) : boardType === "citizen" ? (
            <User className="h-5 w-5 text-mrsg-cyan" />
          ) : boardType === "console" ? (
            <Brain className="h-5 w-5 text-mrsg-cyan" />
          ) : (
            <Radio className="h-5 w-5 text-mrsg-cyan" />
          )}
          <span className="text-base font-semibold tracking-tight text-foreground">LPM V2</span>
        </div>
        <div className="h-4 w-px bg-mrsg-cyan/30" />
        <span className="text-xs font-semibold uppercase tracking-wider text-mrsg-cyan">
          {boardType === "dispatcher" ? "Dispatch Board" : boardType === "responder" ? "Responder Interface" : boardType === "citizen" ? "Citizen Portal" : boardType === "console" ? "Mind Center" : "LPM Cerebral Console"}
        </span>
        <div className="h-4 w-px bg-mrsg-cyan/30" />
        <BoardSwitcher currentBoard={boardType} canAccessRoute={canAccessRoute} />
      </div>

      <div className="flex items-center gap-6">
        <DemoModeToggle />

        <div className="h-4 w-px bg-border/50" />

        <RoleSwitcher 
          currentRole={currentRole} 
          setCurrentRole={setCurrentRole} 
          getRoleLabel={getRoleLabel}
          getAllRoles={getAllRoles}
        />

        <div className="h-4 w-px bg-border/50" />

        <div className="flex items-center gap-4">
          <StatusIndicator status="online" label="System" />
          <div className="h-4 w-px bg-border/50" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4 text-mrsg-cyan" />
            <span className="text-xs font-mono">3 Active Channels</span>
          </div>
        </div>

        <div className="h-4 w-px bg-border/50" />

        <ThemeToggle />

        <div className="h-4 w-px bg-border/50" />

        <div className="flex items-center gap-3 text-right">
          <div className="flex flex-col items-end">
            <span className="text-sm font-mono tabular-nums text-foreground" data-testid="text-time">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs font-mono text-muted-foreground" data-testid="text-date">
              {formatDate(currentTime)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

interface RoleSwitcherProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  getRoleLabel: () => string;
  getAllRoles: () => UserRole[];
}

function RoleSwitcher({ currentRole, setCurrentRole, getRoleLabel, getAllRoles }: RoleSwitcherProps) {
  const roleIcons: Record<UserRole, typeof User> = {
    admin: Shield,
    operations: Radio,
    dispatcher: Headset,
    responder: Shield,
    citizen: User,
  };

  const roleLabels: Record<UserRole, string> = {
    admin: "Admin",
    operations: "Console",
    dispatcher: "Dispatch",
    responder: "Responder",
    citizen: "Citizen",
  };

  const CurrentIcon = roleIcons[currentRole];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-xs gap-1"
          data-testid="button-role-switcher"
        >
          <CurrentIcon className="h-3 w-3" />
          <span>{roleLabels[currentRole]}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {getAllRoles().map((role) => {
          const Icon = roleIcons[role];
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => setCurrentRole(role)}
              className={currentRole === role ? "bg-accent" : ""}
              data-testid={`menu-item-role-${role}`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {roleLabels[role]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface BoardSwitcherProps {
  currentBoard: "operations" | "dispatcher" | "responder" | "citizen" | "console";
  canAccessRoute: (route: string) => boolean;
}

function BoardSwitcher({ currentBoard, canAccessRoute }: BoardSwitcherProps) {
  const boards = [
    { key: "operations", route: "/", icon: Brain, label: "Console" },
    { key: "dispatcher", route: "/dispatcher", icon: Headset, label: "Dispatch" },
    { key: "responder", route: "/responder", icon: Shield, label: "Responder" },
    { key: "citizen", route: "/citizen", icon: User, label: "Citizen" },
    { key: "console", route: "/console", icon: Activity, label: "Mind" },
  ] as const;

  return (
    <div className="flex items-center gap-1">
      {boards.map((board) => {
        const isAllowed = canAccessRoute(board.route);
        const Icon = board.icon;
        
        if (!isAllowed) {
          return (
            <Button
              key={board.key}
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs opacity-30 cursor-not-allowed"
              disabled
              data-testid={`button-switch-${board.key}`}
            >
              <Icon className="h-3 w-3 mr-1" />
              {board.label}
            </Button>
          );
        }

        return (
          <Link key={board.key} href={board.route}>
            <Button
              size="sm"
              variant={currentBoard === board.key ? "default" : "ghost"}
              className="h-7 px-2 text-xs"
              data-testid={`button-switch-${board.key}`}
            >
              <Icon className="h-3 w-3 mr-1" />
              {board.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
