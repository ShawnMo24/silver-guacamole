import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dashboard } from "@/components/Dashboard";
import { DispatcherBoard } from "@/components/DispatcherBoard";
import { ResponderInterface } from "@/components/ResponderInterface";
import { CitizenInterface } from "@/components/CitizenInterface";
import { CerebralConsole } from "@/components/CerebralConsole";
import { BrainInterface } from "@/components/BrainInterface";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SafetyBanner, DemoModeIndicator } from "@/components/SafetyBanner";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <ProtectedRoute path="/">
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dispatcher">
        <ProtectedRoute path="/dispatcher">
          <DispatcherBoard />
        </ProtectedRoute>
      </Route>
      <Route path="/responder">
        <ProtectedRoute path="/responder">
          <ResponderInterface />
        </ProtectedRoute>
      </Route>
      <Route path="/citizen">
        <ProtectedRoute path="/citizen">
          <CitizenInterface />
        </ProtectedRoute>
      </Route>
      <Route path="/console">
        <ProtectedRoute path="/console">
          <CerebralConsole />
        </ProtectedRoute>
      </Route>
      <Route path="/brain">
        <BrainInterface />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PermissionsProvider defaultRole="admin">
          <DemoModeProvider>
            <div className="flex flex-col min-h-screen">
              <SafetyBanner variant="compact" />
              <div className="flex-1">
                <Router />
              </div>
            </div>
            <DemoModeIndicator />
            <Toaster />
          </DemoModeProvider>
        </PermissionsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
