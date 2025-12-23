import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "admin" | "operations" | "dispatcher" | "responder" | "citizen";

export type Permission = 
  | "view_operations"
  | "view_dispatcher"
  | "view_responder"
  | "view_citizen"
  | "view_console"
  | "manage_incidents"
  | "dispatch_responders"
  | "respond_to_incidents"
  | "submit_reports"
  | "view_all_data"
  | "configure_system"
  | "view_knowledge_base"
  | "edit_knowledge_base";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "view_operations",
    "view_dispatcher",
    "view_responder",
    "view_citizen",
    "view_console",
    "manage_incidents",
    "dispatch_responders",
    "respond_to_incidents",
    "submit_reports",
    "view_all_data",
    "configure_system",
    "view_knowledge_base",
    "edit_knowledge_base",
  ],
  operations: [
    "view_operations",
    "view_dispatcher",
    "view_console",
    "manage_incidents",
    "view_all_data",
    "view_knowledge_base",
  ],
  dispatcher: [
    "view_dispatcher",
    "view_responder",
    "dispatch_responders",
    "view_knowledge_base",
  ],
  responder: [
    "view_responder",
    "respond_to_incidents",
    "view_knowledge_base",
  ],
  citizen: [
    "view_citizen",
    "submit_reports",
  ],
};

const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin: ["/", "/dispatcher", "/responder", "/citizen", "/console"],
  operations: ["/", "/dispatcher", "/console"],
  dispatcher: ["/dispatcher", "/responder"],
  responder: ["/responder"],
  citizen: ["/citizen"],
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  operations: "Console",
  dispatcher: "Dispatcher",
  responder: "Responder",
  citizen: "Citizen",
};

interface PermissionsContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
  canAccessRoute: (route: string) => boolean;
  getAllowedRoutes: () => string[];
  getRoleLabel: () => string;
  getAllRoles: () => UserRole[];
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
  defaultRole?: UserRole;
}

export function PermissionsProvider({ children, defaultRole = "admin" }: PermissionsProviderProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>(defaultRole);

  const hasPermission = (permission: Permission): boolean => {
    return ROLE_PERMISSIONS[currentRole].includes(permission);
  };

  const canAccessRoute = (route: string): boolean => {
    return ROLE_ROUTES[currentRole].includes(route);
  };

  const getAllowedRoutes = (): string[] => {
    return ROLE_ROUTES[currentRole];
  };

  const getRoleLabel = (): string => {
    return ROLE_LABELS[currentRole];
  };

  const getAllRoles = (): UserRole[] => {
    return ["admin", "operations", "dispatcher", "responder", "citizen"];
  };

  return (
    <PermissionsContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        hasPermission,
        canAccessRoute,
        getAllowedRoutes,
        getRoleLabel,
        getAllRoles,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextType {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
