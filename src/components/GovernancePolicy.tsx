import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Scale, 
  Shield, 
  FileCheck, 
  Lock,
  Unlock,
  GitBranch,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  History,
  Fingerprint,
  BookOpen,
  Gavel,
  Building,
  Link2,
  ArrowDownRight,
  ExternalLink
} from "lucide-react";

interface PolicyBlock {
  id: string;
  name: string;
  category: "operational" | "privacy" | "ethics" | "compliance" | "access";
  status: "active" | "pending" | "archived";
  version: string;
  lastUpdated: string;
  summary: string;
  accessLevel: "public" | "restricted" | "classified";
}

interface LineageNode {
  id: string;
  type: "source" | "transform" | "decision" | "output";
  name: string;
  timestamp: string;
  actor?: string;
  policyRef?: string;
}

interface AccessControl {
  id: string;
  resource: string;
  role: string;
  permission: "read" | "write" | "admin" | "none";
  grantedBy: string;
  expires?: string;
}

const mockPolicies: PolicyBlock[] = [
  { id: "1", name: "Use of Force Guidelines", category: "operational", status: "active", version: "3.2", lastUpdated: "2024-11-15", summary: "Defines escalation thresholds and de-escalation requirements for all response scenarios", accessLevel: "public" },
  { id: "2", name: "Citizen Privacy Protocol", category: "privacy", status: "active", version: "2.1", lastUpdated: "2024-12-01", summary: "Data retention limits, anonymization requirements, and consent frameworks for citizen interactions", accessLevel: "restricted" },
  { id: "3", name: "AI Ethics Framework", category: "ethics", status: "active", version: "1.5", lastUpdated: "2024-10-20", summary: "Bias detection, fairness auditing, and explainability requirements for all AI-assisted decisions", accessLevel: "public" },
  { id: "4", name: "Body Camera Footage Access", category: "compliance", status: "pending", version: "4.0-draft", lastUpdated: "2024-12-10", summary: "Updated retention periods and access controls for recorded footage", accessLevel: "classified" },
  { id: "5", name: "Role-Based Access Matrix", category: "access", status: "active", version: "2.8", lastUpdated: "2024-11-28", summary: "Defines granular permissions for each role across all system modules", accessLevel: "restricted" },
  { id: "6", name: "Community Engagement Standards", category: "operational", status: "active", version: "1.9", lastUpdated: "2024-09-15", summary: "Guidelines for positive community interaction and trust building", accessLevel: "public" },
];

const mockLineage: LineageNode[] = [
  { id: "1", type: "source", name: "911 Call Transcript", timestamp: "14:25:12", actor: "System" },
  { id: "2", type: "source", name: "Citizen Report #4521", timestamp: "14:26:45", actor: "Anonymous Citizen" },
  { id: "3", type: "transform", name: "NLP Entity Extraction", timestamp: "14:26:47", policyRef: "AI Ethics Framework" },
  { id: "4", type: "transform", name: "Location Correlation", timestamp: "14:26:48", policyRef: "Citizen Privacy Protocol" },
  { id: "5", type: "decision", name: "Priority Assignment: High", timestamp: "14:26:50", actor: "Cerebral Core", policyRef: "Use of Force Guidelines" },
  { id: "6", type: "output", name: "Unit Dispatch Recommendation", timestamp: "14:26:52", actor: "Cerebral Core" },
];

const mockAccessControls: AccessControl[] = [
  { id: "1", resource: "Incident Data", role: "Console Commander", permission: "admin", grantedBy: "System Admin" },
  { id: "2", resource: "Incident Data", role: "Dispatcher", permission: "write", grantedBy: "Console Commander" },
  { id: "3", resource: "Incident Data", role: "Responder", permission: "read", grantedBy: "Dispatcher" },
  { id: "4", resource: "Citizen Reports", role: "Citizen", permission: "write", grantedBy: "System" },
  { id: "5", resource: "Analytics Dashboard", role: "Console Commander", permission: "admin", grantedBy: "System Admin" },
  { id: "6", resource: "Analytics Dashboard", role: "Dispatcher", permission: "read", grantedBy: "Console Commander" },
  { id: "7", resource: "Body Camera Footage", role: "Responder", permission: "read", grantedBy: "Compliance Officer", expires: "2024-12-31" },
  { id: "8", resource: "Body Camera Footage", role: "Citizen", permission: "none", grantedBy: "Policy" },
];

interface GovernancePolicyProps {
  compact?: boolean;
}

export function GovernancePolicy({ compact = false }: GovernancePolicyProps) {
  const [activeTab, setActiveTab] = useState("policies");
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyBlock | null>(null);
  const [expandedLineage, setExpandedLineage] = useState<string[]>(["5"]);

  const getCategoryIcon = (category: PolicyBlock["category"]) => {
    switch (category) {
      case "operational": return <Gavel className="h-3 w-3" />;
      case "privacy": return <EyeOff className="h-3 w-3" />;
      case "ethics": return <Scale className="h-3 w-3" />;
      case "compliance": return <FileCheck className="h-3 w-3" />;
      case "access": return <Lock className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: PolicyBlock["category"]) => {
    switch (category) {
      case "operational": return "bg-mrsg-cyan/20 text-mrsg-cyan border-mrsg-cyan/30";
      case "privacy": return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      case "ethics": return "bg-status-escalating/20 text-status-escalating border-status-escalating/30";
      case "compliance": return "bg-status-stable/20 text-status-stable border-status-stable/30";
      case "access": return "bg-status-danger/20 text-status-danger border-status-danger/30";
    }
  };

  const getStatusBadge = (status: PolicyBlock["status"]) => {
    switch (status) {
      case "active": return <Badge className="bg-status-stable/20 text-status-stable text-[10px]"><CheckCircle className="h-2 w-2 mr-1" />Active</Badge>;
      case "pending": return <Badge className="bg-status-escalating/20 text-status-escalating text-[10px]"><Clock className="h-2 w-2 mr-1" />Pending</Badge>;
      case "archived": return <Badge variant="secondary" className="text-[10px]">Archived</Badge>;
    }
  };

  const getAccessIcon = (level: PolicyBlock["accessLevel"]) => {
    switch (level) {
      case "public": return <Unlock className="h-3 w-3 text-status-stable" />;
      case "restricted": return <Eye className="h-3 w-3 text-status-escalating" />;
      case "classified": return <Lock className="h-3 w-3 text-status-danger" />;
    }
  };

  const getLineageIcon = (type: LineageNode["type"]) => {
    switch (type) {
      case "source": return <Database className="h-4 w-4 text-mrsg-cyan" />;
      case "transform": return <GitBranch className="h-4 w-4 text-status-escalating" />;
      case "decision": return <Scale className="h-4 w-4 text-status-danger" />;
      case "output": return <ArrowDownRight className="h-4 w-4 text-status-stable" />;
    }
  };

  const getPermissionBadge = (permission: AccessControl["permission"]) => {
    switch (permission) {
      case "admin": return <Badge className="bg-status-danger/20 text-status-danger text-[10px]">Admin</Badge>;
      case "write": return <Badge className="bg-status-escalating/20 text-status-escalating text-[10px]">Write</Badge>;
      case "read": return <Badge className="bg-status-stable/20 text-status-stable text-[10px]">Read</Badge>;
      case "none": return <Badge variant="secondary" className="text-[10px]">None</Badge>;
    }
  };

  const toggleLineageExpand = (id: string) => {
    setExpandedLineage(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (compact) {
    return (
      <Card className="border-mrsg-cyan/20 bg-card/80" data-testid="governance-compact">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Scale className="h-4 w-4 text-mrsg-cyan" />
            Governance
            <Badge variant="secondary" className="ml-auto text-[10px]">
              {mockPolicies.filter(p => p.status === "active").length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockPolicies.slice(0, 3).map((policy) => (
              <Dialog key={policy.id}>
                <DialogTrigger asChild>
                  <div 
                    className="p-2 rounded-md bg-muted/30 border border-border/50 hover-elevate cursor-pointer"
                    data-testid={`policy-compact-${policy.id}`}
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(policy.category)}
                      <span className="text-xs font-medium truncate flex-1">{policy.name}</span>
                      {getAccessIcon(policy.accessLevel)}
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-mrsg-cyan" />
                      {policy.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={getCategoryColor(policy.category)}>
                        {getCategoryIcon(policy.category)}
                        <span className="ml-1 capitalize">{policy.category}</span>
                      </Badge>
                      {getStatusBadge(policy.status)}
                      <Badge variant="outline" className="text-xs">v{policy.version}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{policy.summary}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last updated: {policy.lastUpdated}
                    </div>
                    <div className="flex items-center gap-2">
                      {getAccessIcon(policy.accessLevel)}
                      <span className="text-xs capitalize">{policy.accessLevel} access</span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" data-testid="button-view-all-policies">
                View All Policies
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-mrsg-cyan" />
                  Governance & Policy Center
                </DialogTitle>
              </DialogHeader>
              <GovernancePolicy />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full" data-testid="governance-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="policies" data-testid="tab-policies">
            <FileCheck className="h-4 w-4 mr-1" />
            Policies
          </TabsTrigger>
          <TabsTrigger value="lineage" data-testid="tab-lineage">
            <GitBranch className="h-4 w-4 mr-1" />
            Lineage
          </TabsTrigger>
          <TabsTrigger value="access" data-testid="tab-access">
            <Lock className="h-4 w-4 mr-1" />
            Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="flex-1 mt-4">
          <ScrollArea className="h-[calc(100vh-520px)]">
            <div className="space-y-3 pr-4">
              {mockPolicies.map((policy) => (
                <Collapsible 
                  key={policy.id} 
                  open={selectedPolicy?.id === policy.id}
                  onOpenChange={(open) => setSelectedPolicy(open ? policy : null)}
                >
                  <CollapsibleTrigger className="w-full">
                    <div 
                      className="p-3 rounded-md bg-muted/30 border border-border/50 hover-elevate text-left"
                      data-testid={`policy-${policy.id}`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          {selectedPolicy?.id === policy.id ? 
                            <ChevronDown className="h-4 w-4 text-muted-foreground" /> : 
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          }
                          <span className="font-medium text-sm">{policy.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getAccessIcon(policy.accessLevel)}
                          {getStatusBadge(policy.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <Badge variant="outline" className={`text-[10px] ${getCategoryColor(policy.category)}`}>
                          {getCategoryIcon(policy.category)}
                          <span className="ml-1 capitalize">{policy.category}</span>
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">v{policy.version}</Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="ml-4 mt-2 p-3 rounded-md bg-background/50 border border-border/30 space-y-3">
                      <p className="text-sm text-muted-foreground">{policy.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated: {policy.lastUpdated}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          City Policy Office
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Full Document
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          <History className="h-3 w-3 mr-1" />
                          Version History
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="lineage" className="flex-1 mt-4">
          <ScrollArea className="h-[calc(100vh-520px)]">
            <div className="space-y-2 pr-4">
              <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                Decision Lineage Trail - Incident #2847
              </div>
              {mockLineage.map((node, index) => (
                <Collapsible 
                  key={node.id}
                  open={expandedLineage.includes(node.id)}
                  onOpenChange={() => toggleLineageExpand(node.id)}
                >
                  <div className="flex">
                    <div className="flex flex-col items-center mr-3">
                      <div className="w-8 h-8 rounded-full bg-muted/50 border border-border flex items-center justify-center">
                        {getLineageIcon(node.type)}
                      </div>
                      {index < mockLineage.length - 1 && (
                        <div className="w-px h-full bg-border/50 my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <CollapsibleTrigger className="w-full">
                        <div 
                          className="p-2 rounded-md bg-muted/30 border border-border/50 hover-elevate text-left"
                          data-testid={`lineage-${node.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {expandedLineage.includes(node.id) ? 
                                <ChevronDown className="h-3 w-3 text-muted-foreground" /> : 
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              }
                              <span className="text-sm font-medium">{node.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">{node.timestamp}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-5 mt-1">
                            <Badge variant="outline" className="text-[10px] capitalize">{node.type}</Badge>
                            {node.actor && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Users className="h-2 w-2" />
                                {node.actor}
                              </span>
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 p-2 rounded-md bg-background/50 border border-border/30 text-xs space-y-2">
                          {node.policyRef && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Link2 className="h-3 w-3" />
                              Policy Reference: <span className="text-foreground">{node.policyRef}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Fingerprint className="h-3 w-3" />
                            Hash: <span className="font-mono">0x{Math.random().toString(16).slice(2, 10)}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="h-6 text-[10px]">
                            <ExternalLink className="h-2 w-2 mr-1" />
                            View Full Details
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </div>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="access" className="flex-1 mt-4">
          <ScrollArea className="h-[calc(100vh-520px)]">
            <div className="space-y-4 pr-4">
              <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role-Based Access Control Matrix
              </div>
              
              {["Incident Data", "Citizen Reports", "Analytics Dashboard", "Body Camera Footage"].map((resource) => {
                const controls = mockAccessControls.filter(c => c.resource === resource);
                return (
                  <div key={resource} className="p-3 rounded-md bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="h-4 w-4 text-mrsg-cyan" />
                      <span className="font-medium text-sm">{resource}</span>
                    </div>
                    <div className="space-y-2">
                      {controls.map((control) => (
                        <div 
                          key={control.id}
                          className="flex items-center justify-between p-2 rounded-md bg-background/50"
                          data-testid={`access-control-${control.id}`}
                        >
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{control.role}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getPermissionBadge(control.permission)}
                            {control.expires && (
                              <Badge variant="outline" className="text-[10px] text-status-escalating">
                                <Clock className="h-2 w-2 mr-1" />
                                Expires {control.expires}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="p-3 rounded-md bg-status-escalating/10 border border-status-escalating/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-status-escalating" />
                  <span className="font-medium text-sm text-status-escalating">Access Audit Alert</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  2 temporary access grants expire within 30 days. Review and renew if necessary.
                </p>
                <Button size="sm" variant="outline" className="mt-2 text-xs">
                  Review Expiring Access
                </Button>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
