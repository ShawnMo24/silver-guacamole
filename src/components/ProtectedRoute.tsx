import { useLocation } from "wouter";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useEffect } from "react";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProtectedRouteProps {
  path: string;
  children: React.ReactNode;
}

export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { canAccessRoute, getAllowedRoutes, getRoleLabel } = usePermissions();
  const [, setLocation] = useLocation();
  
  const isAllowed = canAccessRoute(path);
  const allowedRoutes = getAllowedRoutes();
  const defaultRoute = allowedRoutes[0] || "/";

  if (!isAllowed) {
    return (
      <AccessDenied 
        requestedPath={path}
        currentRole={getRoleLabel()}
        defaultRoute={defaultRoute}
        onNavigateHome={() => setLocation(defaultRoute)}
      />
    );
  }

  return <>{children}</>;
}

interface AccessDeniedProps {
  requestedPath: string;
  currentRole: string;
  defaultRoute: string;
  onNavigateHome: () => void;
}

function AccessDenied({ requestedPath, currentRole, defaultRoute, onNavigateHome }: AccessDeniedProps) {
  const pathNames: Record<string, string> = {
    "/": "LPM Cerebral Console",
    "/dispatcher": "Dispatch Board",
    "/responder": "Responder Interface",
    "/citizen": "Citizen Portal",
    "/console": "Mind Center",
  };

  const pageName = pathNames[requestedPath] || requestedPath;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <ShieldOff className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your current role ({currentRole}) does not have permission to access the {pageName}.
          </p>
          <p className="text-sm text-muted-foreground">
            Please switch to an authorized role or contact your administrator.
          </p>
          <Button 
            onClick={onNavigateHome}
            data-testid="button-go-home"
          >
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
