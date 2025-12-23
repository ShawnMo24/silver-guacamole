import { useState } from "react";
import { TopBar } from "./TopBar";
import { DangerBanner } from "./DangerBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { KnowledgeBase } from "./KnowledgeBase";
import { GovernancePolicy } from "./GovernancePolicy";
import { ZoneIntelligence } from "./ZoneIntelligence";
import { 
  Brain, 
  Zap, 
  MessageSquare, 
  FileText, 
  Send,
  Headset,
  Shield,
  User,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Network,
  Globe,
  Search,
  ChevronRight,
  ChevronDown,
  CircleDot,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  GitBranch,
  TreeDeciduous,
  ExternalLink,
  Scale,
  MapPin
} from "lucide-react";

interface InputStreamItem {
  id: string;
  source: "dispatcher" | "responder" | "citizen";
  message: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
}

interface OutputItem {
  id: string;
  type: "action" | "guidance" | "report";
  title: string;
  description: string;
  timestamp: string;
  status: "pending" | "active" | "completed";
}

const mockInputStreams: InputStreamItem[] = [
  { id: "1", source: "dispatcher", message: "Multiple units responding to 5th & Main - possible 10-31", timestamp: "14:32:15", priority: "high" },
  { id: "2", source: "responder", message: "Unit 7 requesting backup at current location", timestamp: "14:31:42", priority: "high" },
  { id: "3", source: "citizen", message: "Suspicious activity reported near Oak Park", timestamp: "14:30:18", priority: "medium" },
  { id: "4", source: "dispatcher", message: "Traffic advisory: MLK Blvd closed for investigation", timestamp: "14:28:55", priority: "low" },
  { id: "5", source: "responder", message: "Unit 12 on scene, situation contained", timestamp: "14:27:30", priority: "medium" },
  { id: "6", source: "citizen", message: "Report of loud noise disturbance on Elm Street", timestamp: "14:25:00", priority: "low" },
  { id: "7", source: "dispatcher", message: "Unit 5 cleared from previous call, available", timestamp: "14:23:45", priority: "low" },
];

const mockOutputs: OutputItem[] = [
  { id: "1", type: "action", title: "Deploy Unit 3 to Oak Park", description: "Respond to citizen report of suspicious activity", timestamp: "14:32:00", status: "active" },
  { id: "2", type: "guidance", title: "De-escalation Protocol", description: "Recommended approach for 5th & Main incident", timestamp: "14:31:00", status: "pending" },
  { id: "3", type: "report", title: "Incident Summary #2847", description: "Completed analysis of morning shift activities", timestamp: "14:25:00", status: "completed" },
];


const allLanguages = [
  "English", "Spanish", "Mandarin", "Vietnamese", "Korean", "Tagalog", "Arabic", "French", "Portuguese", "Russian",
  "Hindi", "Bengali", "Japanese", "German", "Italian", "Polish", "Ukrainian", "Dutch", "Greek", "Turkish",
  "Thai", "Indonesian", "Malay", "Swahili", "Amharic", "Somali", "Haitian Creole", "Punjabi", "Urdu", "Persian",
  "Hebrew", "Hmong", "Lao", "Khmer", "Burmese", "Nepali", "Tamil", "Telugu", "Kannada", "Malayalam",
  "Gujarati", "Marathi", "Oriya", "Assamese", "Czech", "Slovak", "Hungarian", "Romanian", "Bulgarian", "Serbian"
];

export function CerebralConsole() {
  const [showDanger] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [dialectMode, setDialectMode] = useState<"standard" | "street" | "formal">("standard");
  const [activeTab, setActiveTab] = useState("core");
  const [streamFilter, setStreamFilter] = useState<"all" | "dispatcher" | "responder" | "citizen">("all");
  const [languageSearch, setLanguageSearch] = useState("");
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);

  const filteredStreams = streamFilter === "all" 
    ? mockInputStreams 
    : mockInputStreams.filter(item => item.source === streamFilter);

  const filteredLanguages = allLanguages.filter(lang => 
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const getDialectLabel = () => {
    switch (dialectMode) {
      case "standard": return "Standard English";
      case "street": return "Street/Colloquial";
      case "formal": return "Formal/Professional";
    }
  };

  const getSourceIcon = (source: InputStreamItem["source"]) => {
    switch (source) {
      case "dispatcher": return <Headset className="h-3 w-3" />;
      case "responder": return <Shield className="h-3 w-3" />;
      case "citizen": return <User className="h-3 w-3" />;
    }
  };

  const getSourceColor = (source: InputStreamItem["source"]) => {
    switch (source) {
      case "dispatcher": return "text-mrsg-cyan";
      case "responder": return "text-status-stable";
      case "citizen": return "text-status-escalating";
    }
  };

  const getPriorityColor = (priority: InputStreamItem["priority"]) => {
    switch (priority) {
      case "high": return "bg-status-danger/20 text-status-danger border-status-danger/30";
      case "medium": return "bg-status-escalating/20 text-status-escalating border-status-escalating/30";
      case "low": return "bg-muted text-muted-foreground border-border";
    }
  };

  const getOutputIcon = (type: OutputItem["type"]) => {
    switch (type) {
      case "action": return <Zap className="h-4 w-4 text-status-danger" />;
      case "guidance": return <Lightbulb className="h-4 w-4 text-status-escalating" />;
      case "report": return <FileText className="h-4 w-4 text-mrsg-cyan" />;
    }
  };

  const getStatusBadge = (status: OutputItem["status"]) => {
    switch (status) {
      case "pending": return <Badge variant="secondary" className="text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "active": return <Badge className="bg-status-escalating/20 text-status-escalating text-xs"><Activity className="h-3 w-3 mr-1" />Active</Badge>;
      case "completed": return <Badge className="bg-status-stable/20 text-status-stable text-xs"><CheckCircle className="h-3 w-3 mr-1" />Done</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="cerebral-console">
      <TopBar boardType="console" />
      {showDanger && (
        <DangerBanner 
          isActive={true}
          incidentId="INC-001"
          incidentTitle="Active Critical Incident"
          startTime={new Date()}
        />
      )}
      
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-4">
          {/* Left Rail - Input Streams */}
          <div className="col-span-3 flex flex-col gap-4">
            <Card className="flex-1 border-mrsg-cyan/20 bg-card/80" data-testid="input-streams-panel">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Network className="h-4 w-4 text-mrsg-cyan" />
                  Input Streams
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {filteredStreams.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-3 mb-2">
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant={streamFilter === "all" ? "default" : "ghost"}
                      className="h-7 px-2 text-xs flex-1"
                      onClick={() => setStreamFilter("all")}
                      data-testid="tab-all-streams"
                    >
                      All
                    </Button>
                    <Button 
                      size="sm" 
                      variant={streamFilter === "dispatcher" ? "default" : "ghost"}
                      className="h-7 px-2 text-xs"
                      onClick={() => setStreamFilter("dispatcher")}
                      data-testid="tab-dispatcher-stream"
                    >
                      <Headset className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={streamFilter === "responder" ? "default" : "ghost"}
                      className="h-7 px-2 text-xs"
                      onClick={() => setStreamFilter("responder")}
                      data-testid="tab-responder-stream"
                    >
                      <Shield className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={streamFilter === "citizen" ? "default" : "ghost"}
                      className="h-7 px-2 text-xs"
                      onClick={() => setStreamFilter("citizen")}
                      data-testid="tab-citizen-stream"
                    >
                      <User className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[calc(100vh-340px)]">
                  <div className="px-3 pb-3 space-y-2">
                    {filteredStreams.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-xs">
                        No messages from this source
                      </div>
                    ) : (
                      filteredStreams.map((item) => (
                        <div 
                          key={item.id} 
                          className="p-2 rounded-md bg-muted/30 border border-border/50 hover-elevate cursor-pointer"
                          data-testid={`input-stream-${item.id}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className={`flex items-center gap-1 ${getSourceColor(item.source)}`}>
                              {getSourceIcon(item.source)}
                              <span className="text-xs font-medium capitalize">{item.source}</span>
                            </div>
                            <Badge variant="outline" className={`text-[10px] ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground line-clamp-2">{item.message}</p>
                          <span className="text-[10px] text-muted-foreground font-mono">{item.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Language Controls */}
            <Card className="border-mrsg-cyan/20 bg-card/80" data-testid="language-panel">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-mrsg-cyan" />
                  Language & Dialect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-mrsg-cyan/20 text-mrsg-cyan">
                    {selectedLanguage}
                  </Badge>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span className="text-xs text-muted-foreground">{getDialectLabel()}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {allLanguages.slice(0, 5).map((lang) => (
                    <Button 
                      key={lang}
                      size="sm" 
                      variant={selectedLanguage === lang ? "default" : "ghost"}
                      className="h-6 px-2 text-[10px]"
                      onClick={() => setSelectedLanguage(lang)}
                      data-testid={`button-lang-${lang.toLowerCase()}`}
                    >
                      {lang}
                    </Button>
                  ))}
                  <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" data-testid="button-more-languages">
                        +{allLanguages.length - 5} more
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-mrsg-cyan" />
                          Select Language ({allLanguages.length} available)
                        </DialogTitle>
                      </DialogHeader>
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search languages..."
                          className="pl-9"
                          value={languageSearch}
                          onChange={(e) => setLanguageSearch(e.target.value)}
                          data-testid="input-language-search"
                        />
                      </div>
                      <ScrollArea className="h-64">
                        <div className="grid grid-cols-2 gap-2 pr-4">
                          {filteredLanguages.map((lang) => (
                            <Button
                              key={lang}
                              size="sm"
                              variant={selectedLanguage === lang ? "default" : "ghost"}
                              className="justify-start h-8 text-xs"
                              onClick={() => {
                                setSelectedLanguage(lang);
                                setLanguageDialogOpen(false);
                                setLanguageSearch("");
                              }}
                              data-testid={`button-lang-dialog-${lang.toLowerCase().replace(/\s/g, '-')}`}
                            >
                              {lang}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant={dialectMode === "standard" ? "default" : "outline"}
                    className="flex-1 h-7 text-xs"
                    onClick={() => setDialectMode("standard")}
                    data-testid="button-dialect-standard"
                  >
                    Standard
                  </Button>
                  <Button 
                    size="sm" 
                    variant={dialectMode === "street" ? "default" : "outline"}
                    className="flex-1 h-7 text-xs"
                    onClick={() => setDialectMode("street")}
                    data-testid="button-dialect-street"
                  >
                    Street/Slang
                  </Button>
                  <Button 
                    size="sm" 
                    variant={dialectMode === "formal" ? "default" : "outline"}
                    className="flex-1 h-7 text-xs"
                    onClick={() => setDialectMode("formal")}
                    data-testid="button-dialect-formal"
                  >
                    Formal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Cognitive Core */}
          <div className="col-span-6 flex flex-col gap-4">
            <Card className="flex-1 border-mrsg-cyan/20 bg-card/80" data-testid="cognitive-core-panel">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-mrsg-cyan" />
                  Cognitive Core
                  <Badge className="ml-2 bg-status-stable/20 text-status-stable">
                    <CircleDot className="h-3 w-3 mr-1 animate-pulse" />
                    Online
                  </Badge>
                  <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    {selectedLanguage} ({getDialectLabel()})
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[calc(100%-60px)]">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
                    <TabsTrigger value="core" data-testid="tab-core">
                      <Brain className="h-4 w-4 mr-1" />
                      Core
                    </TabsTrigger>
                    <TabsTrigger value="zones" data-testid="tab-zones">
                      <MapPin className="h-4 w-4 mr-1" />
                      Zones
                    </TabsTrigger>
                    <TabsTrigger value="synthesis" data-testid="tab-synthesis">
                      <Zap className="h-4 w-4 mr-1" />
                      Synthesis
                    </TabsTrigger>
                    <TabsTrigger value="governance" data-testid="tab-governance">
                      <Scale className="h-4 w-4 mr-1" />
                      Governance
                    </TabsTrigger>
                    <TabsTrigger value="output" data-testid="tab-output">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Output
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="core" className="flex-1 mt-4">
                    <ScrollArea className="h-[calc(100vh-420px)]">
                      <div className="space-y-4 pr-4">
                        <div className="p-4 rounded-md bg-muted/30 border border-mrsg-cyan/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="h-5 w-5 text-mrsg-cyan" />
                            <span className="font-medium">Active Processing</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <CircleDot className="h-3 w-3 text-status-stable animate-pulse" />
                              <span>Analyzing 5th & Main incident patterns</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CircleDot className="h-3 w-3 text-status-escalating animate-pulse" />
                              <span>Cross-referencing historical data</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CircleDot className="h-3 w-3 text-mrsg-cyan animate-pulse" />
                              <span>Generating response recommendations</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-md bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Database className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Knowledge Stats</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-2 bg-background/50 rounded-md">
                              <div className="text-2xl font-bold text-mrsg-cyan">10,247</div>
                              <div className="text-xs text-muted-foreground">Questions</div>
                            </div>
                            <div className="text-center p-2 bg-background/50 rounded-md">
                              <div className="text-2xl font-bold text-status-stable">8,932</div>
                              <div className="text-xs text-muted-foreground">Responses</div>
                            </div>
                            <div className="text-center p-2 bg-background/50 rounded-md">
                              <div className="text-2xl font-bold text-status-escalating">2,156</div>
                              <div className="text-xs text-muted-foreground">Citations</div>
                            </div>
                            <div className="text-center p-2 bg-background/50 rounded-md">
                              <div className="text-2xl font-bold text-foreground">{allLanguages.length}</div>
                              <div className="text-xs text-muted-foreground">Languages</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-md bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Activity className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">System Health</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Response Latency</span>
                              <Badge variant="secondary" className="bg-status-stable/20 text-status-stable">42ms</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Queue Depth</span>
                              <Badge variant="secondary">3 items</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Accuracy Rate</span>
                              <Badge variant="secondary" className="bg-status-stable/20 text-status-stable">98.7%</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="zones" className="flex-1 mt-4">
                    <div className="h-[calc(100vh-420px)]">
                      <ZoneIntelligence />
                    </div>
                  </TabsContent>

                  <TabsContent value="synthesis" className="flex-1 mt-4">
                    <ScrollArea className="h-[calc(100vh-420px)]">
                      <div className="space-y-4 pr-4">
                        <div className="p-4 rounded-md bg-status-escalating/10 border border-status-escalating/30">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-status-escalating" />
                            <span className="font-medium text-status-escalating">Active Synthesis</span>
                          </div>
                          <p className="text-sm mb-3">
                            Correlating multiple reports from 5th & Main area. Pattern suggests potential escalation.
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">3 sources</Badge>
                            <Badge variant="outline" className="text-xs">High confidence</Badge>
                            <Badge variant="outline" className="text-xs">2 min ago</Badge>
                          </div>
                        </div>

                        <div className="p-4 rounded-md bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-2">
                            <GitBranch className="h-4 w-4 text-mrsg-cyan" />
                            <span className="font-medium">Connected Insights</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm p-2 bg-background/50 rounded-md">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              <span>Similar incident pattern detected last week</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm p-2 bg-background/50 rounded-md">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              <span>Community feedback suggests ongoing issue</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm p-2 bg-background/50 rounded-md">
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              <span>Resource allocation may need adjustment</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="governance" className="flex-1 mt-4">
                    <GovernancePolicy />
                  </TabsContent>

                  <TabsContent value="output" className="flex-1 mt-4">
                    <ScrollArea className="h-[calc(100vh-420px)]">
                      <div className="space-y-3 pr-4">
                        <div className="p-4 rounded-md bg-muted/30 border border-mrsg-cyan/30">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-mrsg-cyan" />
                            <span className="font-medium">Generated Response</span>
                            <Badge variant="secondary" className="ml-auto text-[10px]">
                              {selectedLanguage} - {dialectMode}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {dialectMode === "street" 
                              ? "Yo, based on what we're seeing, we should probably send another unit over to 5th & Main. Things been heating up around this time before. Might wanna use that calm-down approach - Protocol Alpha-3."
                              : dialectMode === "formal"
                              ? "Upon thorough analysis of current intelligence, it is recommended that additional personnel be deployed to the 5th & Main intersection. Historical data indicates an approaching peak activity window. De-escalation Protocol Alpha-3 is advised."
                              : "Based on current analysis, recommend deploying additional unit to 5th & Main intersection. Historical data indicates peak activity window approaching. Suggest de-escalation protocol Alpha-3."
                            }
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" data-testid="button-approve-output">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" data-testid="button-modify-output">Modify</Button>
                            <Button size="sm" variant="ghost" data-testid="button-reject-output">Reject</Button>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>

                {/* Query Input */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Ask the Mind Center anything..."
                        className="pl-9 bg-muted/30 border-mrsg-cyan/20"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        data-testid="input-query"
                      />
                    </div>
                    <Button data-testid="button-send-query">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Rail - Outputs */}
          <div className="col-span-3 flex flex-col gap-4">
            <Card className="flex-1 border-mrsg-cyan/20 bg-card/80" data-testid="outputs-panel">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-mrsg-cyan" />
                  Output Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-480px)]">
                  <div className="space-y-3">
                    {mockOutputs.map((output) => (
                      <div 
                        key={output.id}
                        className="p-3 rounded-md bg-muted/30 border border-border/50 hover-elevate cursor-pointer"
                        data-testid={`output-${output.id}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getOutputIcon(output.type)}
                            <span className="text-xs font-medium capitalize">{output.type}</span>
                          </div>
                          {getStatusBadge(output.status)}
                        </div>
                        <h4 className="text-sm font-medium mb-1">{output.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{output.description}</p>
                        <span className="text-[10px] text-muted-foreground font-mono mt-2 block">{output.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Knowledge Base - Compact View */}
            <KnowledgeBase compact={true} />

            {/* Governance - Compact View */}
            <GovernancePolicy compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
