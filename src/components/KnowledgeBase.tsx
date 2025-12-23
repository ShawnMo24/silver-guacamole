import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  BookOpen,
  Search,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  Lightbulb,
  FileText,
  ExternalLink,
  GitBranch,
  Layers,
  Tag,
  Clock,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  Heart,
  Users,
  Scale
} from "lucide-react";

interface Citation {
  id: string;
  title: string;
  source: string;
  type: "policy" | "research" | "case" | "training" | "legal";
  url?: string;
  date?: string;
}

interface FollowUp {
  id: string;
  question: string;
  relevance: number;
  generated?: boolean;
}

interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  subcategory?: string;
  followUps: FollowUp[];
  citations: Citation[];
  confidence: number;
  lastUpdated: string;
  views: number;
  helpful: number;
}

interface KnowledgeBaseProps {
  compact?: boolean;
  onQuestionSelect?: (question: string) => void;
}

const categories = [
  { id: "all", label: "All Topics", icon: Layers },
  { id: "protocols", label: "Protocols", icon: Shield },
  { id: "mental-health", label: "Mental Health", icon: Heart },
  { id: "communication", label: "Communication", icon: Users },
  { id: "legal", label: "Legal", icon: Scale },
  { id: "resources", label: "Resources", icon: FileText },
];

const mockKnowledgeEntries: KnowledgeEntry[] = [
  {
    id: "kb-1",
    question: "What are the de-escalation protocols for armed confrontations?",
    answer: "De-escalation for armed confrontations follows the PACE framework: Proximity control (maintain safe distance), Active listening (acknowledge emotions), Communication clarity (simple, direct language), and Exit strategy (always have a retreat plan). Initial response should prioritize verbal engagement over physical intervention. Officers should identify cover positions, request backup if not already en route, and engage crisis intervention training techniques. Time is typically an ally - unless there's imminent threat to life, slowing down the encounter reduces risk of violence.",
    category: "protocols",
    subcategory: "Use of Force",
    followUps: [
      { id: "f1a", question: "What verbal techniques are most effective in armed standoffs?", relevance: 95 },
      { id: "f1b", question: "When should physical intervention be considered?", relevance: 88 },
      { id: "f1c", question: "How to handle mental health component in armed encounters?", relevance: 92 },
      { id: "f1d", question: "What is the PACE framework in detail?", relevance: 85, generated: true },
    ],
    citations: [
      { id: "c1", title: "PERF Guidelines 2024: De-escalation", source: "Police Executive Research Forum", type: "policy", date: "2024-01" },
      { id: "c2", title: "De-escalation Training Module 7", source: "Department Training Division", type: "training", date: "2024-03" },
      { id: "c3", title: "Use of Force: Evidence-Based Approaches", source: "NIJ Research", type: "research", date: "2023-11" },
    ],
    confidence: 94,
    lastUpdated: "2024-12-10",
    views: 1247,
    helpful: 892
  },
  {
    id: "kb-2",
    question: "How should responders approach mental health crises?",
    answer: "Mental health crisis response requires a trauma-informed approach. Key principles: 1) Assume the person is in crisis, not criminal. 2) Reduce stimulation - lower voice, dim lights if possible, reduce the number of officers visible. 3) Use active listening and validate feelings without agreeing with delusions. 4) Ask about triggers and what has helped before. 5) Involve crisis intervention specialists or mental health co-responders when available. 6) Avoid physical confrontation unless there's imminent danger. 7) Document the person's mental health history for future encounters.",
    category: "mental-health",
    subcategory: "Crisis Response",
    followUps: [
      { id: "f2a", question: "What signs indicate a mental health emergency vs. criminal behavior?", relevance: 93 },
      { id: "f2b", question: "Which community mental health resources should be contacted?", relevance: 90 },
      { id: "f2c", question: "How to communicate with family members during mental health crisis?", relevance: 85 },
      { id: "f2d", question: "What is trauma-informed care in field settings?", relevance: 87, generated: true },
    ],
    citations: [
      { id: "c4", title: "CIT Training Manual 2024", source: "Crisis Intervention Team International", type: "training", date: "2024-02" },
      { id: "c5", title: "Mental Health First Aid Guide", source: "NAMI", type: "policy", date: "2023-09" },
      { id: "c6", title: "Police Response to Mental Health Calls", source: "PERF Study", type: "research", date: "2024-01" },
    ],
    confidence: 91,
    lastUpdated: "2024-12-08",
    views: 2156,
    helpful: 1834
  },
  {
    id: "kb-3",
    question: "What are community-specific communication guidelines?",
    answer: "Effective community communication requires cultural competency and relationship building. Core guidelines: 1) Learn key phrases in predominant community languages. 2) Understand cultural norms around authority, eye contact, and personal space. 3) Build relationships with community leaders and attend local events. 4) Use community liaisons for sensitive situations. 5) Be aware of historical tensions and trauma. 6) Practice procedural justice - explain actions before taking them. 7) Follow up on promises and maintain consistency. 8) Acknowledge mistakes openly and commit to improvement.",
    category: "communication",
    subcategory: "Community Relations",
    followUps: [
      { id: "f3a", question: "How to build trust with historically marginalized communities?", relevance: 94 },
      { id: "f3b", question: "What cultural considerations apply to different ethnic groups?", relevance: 89 },
      { id: "f3c", question: "How to use community liaisons effectively?", relevance: 86, generated: true },
    ],
    citations: [
      { id: "c7", title: "Community Policing Best Practices", source: "DOJ COPS Office", type: "policy", date: "2024-04" },
      { id: "c8", title: "Cultural Competency Training Guide", source: "Department Training", type: "training", date: "2023-12" },
      { id: "c9", title: "Case Study: Community Engagement Success", source: "Internal Review Board", type: "case", date: "2024-06" },
    ],
    confidence: 88,
    lastUpdated: "2024-12-05",
    views: 987,
    helpful: 723
  },
  {
    id: "kb-4",
    question: "What resources are available for domestic violence situations?",
    answer: "Domestic violence response requires coordination with multiple support services. Available resources: 1) 24/7 DV Hotline: 1-800-799-7233 (National) and local shelter hotlines. 2) Emergency shelter network - contact dispatch for current availability. 3) Victim advocates available through the DA's office for court accompaniment. 4) Medical forensic exam facilities at designated hospitals. 5) Legal aid for protection orders. 6) Children's services if minors are involved. 7) Economic support programs for survivors. 8) Pet shelter programs for those fleeing with animals.",
    category: "resources",
    subcategory: "Victim Services",
    followUps: [
      { id: "f4a", question: "What shelters are currently available in the area?", relevance: 96 },
      { id: "f4b", question: "How to properly document evidence in DV cases?", relevance: 93 },
      { id: "f4c", question: "What are the mandatory reporting requirements?", relevance: 91 },
      { id: "f4d", question: "How to conduct lethality assessments?", relevance: 89, generated: true },
    ],
    citations: [
      { id: "c10", title: "DV Response Protocol 2024", source: "Department Policy Manual", type: "policy", date: "2024-01" },
      { id: "c11", title: "Victim Services Directory", source: "County Social Services", type: "case", date: "2024-03" },
      { id: "c12", title: "Lethality Assessment Guide", source: "MD Network Against DV", type: "training", date: "2023-08" },
    ],
    confidence: 96,
    lastUpdated: "2024-12-12",
    views: 3421,
    helpful: 3102
  },
  {
    id: "kb-5",
    question: "What are the legal requirements for search and seizure?",
    answer: "Fourth Amendment protections require probable cause and warrant for most searches. Key exceptions: 1) Consent - must be voluntary and informed. 2) Search incident to lawful arrest - immediate area and person. 3) Plain view - if officer is lawfully present and evidence is obvious. 4) Exigent circumstances - hot pursuit, imminent danger, evidence destruction. 5) Vehicle exception - probable cause only, no warrant needed. 6) Terry stop - reasonable suspicion allows pat-down for weapons. 7) Community caretaking - welfare checks have limited search authority. Always document basis for search and obtain supervisor approval when possible.",
    category: "legal",
    subcategory: "Constitutional Law",
    followUps: [
      { id: "f5a", question: "What constitutes valid consent for a search?", relevance: 94 },
      { id: "f5b", question: "How does the exclusionary rule apply to evidence?", relevance: 91 },
      { id: "f5c", question: "What are the limits of a Terry stop?", relevance: 88 },
      { id: "f5d", question: "How to handle search refusals?", relevance: 85, generated: true },
    ],
    citations: [
      { id: "c13", title: "Fourth Amendment Handbook", source: "Legal Division", type: "legal", date: "2024-02" },
      { id: "c14", title: "Search & Seizure Case Law Update", source: "State Attorney General", type: "legal", date: "2024-06" },
      { id: "c15", title: "Constitutional Policing Training", source: "POST Certification", type: "training", date: "2024-01" },
    ],
    confidence: 97,
    lastUpdated: "2024-12-11",
    views: 2876,
    helpful: 2654
  },
  {
    id: "kb-6",
    question: "How to handle juvenile encounters and detention?",
    answer: "Juvenile encounters require special considerations under law and department policy. Key protocols: 1) Miranda warnings required before custodial interrogation - juveniles must understand rights. 2) Parent/guardian notification required before questioning (with exceptions for exigent circumstances). 3) Detention should be in approved juvenile facilities, not adult holding. 4) Diversion programs should be considered for first-time, non-violent offenses. 5) School resource officers have additional guidelines for on-campus encounters. 6) Mandatory reporting of abuse if observed. 7) Privacy protections apply to juvenile records. 8) Age-appropriate communication is essential.",
    category: "legal",
    subcategory: "Juvenile Law",
    followUps: [
      { id: "f6a", question: "What are the Miranda requirements for juveniles?", relevance: 95 },
      { id: "f6b", question: "When can juveniles be questioned without parents present?", relevance: 92 },
      { id: "f6c", question: "What diversion programs are available locally?", relevance: 88, generated: true },
    ],
    citations: [
      { id: "c16", title: "Juvenile Justice Procedures Manual", source: "Department Policy", type: "policy", date: "2024-03" },
      { id: "c17", title: "State Juvenile Code Summary", source: "Legal Division", type: "legal", date: "2024-01" },
      { id: "c18", title: "Adolescent Brain Development", source: "MacArthur Foundation", type: "research", date: "2023-09" },
    ],
    confidence: 93,
    lastUpdated: "2024-12-09",
    views: 1543,
    helpful: 1298
  },
];

export function KnowledgeBase({ compact = false, onQuestionSelect }: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [generatingFollowUps, setGeneratingFollowUps] = useState(false);

  const filteredEntries = useMemo(() => {
    return mockKnowledgeEntries.filter(entry => {
      const matchesSearch = searchQuery === "" || 
        entry.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const toggleEntry = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const selectEntry = (entry: KnowledgeEntry) => {
    setSelectedEntry(entry);
    if (onQuestionSelect) {
      onQuestionSelect(entry.question);
    }
  };

  const handleFollowUpClick = (followUp: FollowUp) => {
    const matchingEntry = mockKnowledgeEntries.find(e => 
      e.question.toLowerCase() === followUp.question.toLowerCase()
    );
    if (matchingEntry) {
      setSelectedEntry(matchingEntry);
    } else {
      setSearchQuery(followUp.question);
      setActiveTab("browse");
    }
  };

  const generateMoreFollowUps = () => {
    setGeneratingFollowUps(true);
    setTimeout(() => {
      setGeneratingFollowUps(false);
    }, 1500);
  };

  const getCitationTypeColor = (type: Citation["type"]) => {
    switch (type) {
      case "policy": return "bg-mrsg-cyan/20 text-mrsg-cyan";
      case "research": return "bg-status-stable/20 text-status-stable";
      case "case": return "bg-status-escalating/20 text-status-escalating";
      case "training": return "bg-purple-500/20 text-purple-400";
      case "legal": return "bg-blue-500/20 text-blue-400";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-status-stable";
    if (confidence >= 75) return "text-status-escalating";
    return "text-status-danger";
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : Layers;
  };

  if (compact) {
    return (
      <Card className="border-mrsg-cyan/20 bg-card/80" data-testid="knowledge-base-compact">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-mrsg-cyan" />
            Knowledge Base
            <Badge variant="secondary" className="ml-auto text-[10px]">
              {mockKnowledgeEntries.length} entries
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input 
              placeholder="Search knowledge..."
              className="pl-7 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-kb-search-compact"
            />
          </div>
          <ScrollArea className="h-48">
            <div className="space-y-1">
              {filteredEntries.slice(0, 5).map((entry) => (
                <div 
                  key={entry.id}
                  className="p-2 rounded-md bg-muted/30 border border-border/50 hover-elevate cursor-pointer"
                  onClick={() => selectEntry(entry)}
                  data-testid={`kb-entry-compact-${entry.id}`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <Badge variant="secondary" className="text-[9px] h-4">{entry.category}</Badge>
                    <Badge variant="outline" className={`text-[9px] h-4 ${getConfidenceColor(entry.confidence)}`}>
                      {entry.confidence}%
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground line-clamp-2">{entry.question}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col" data-testid="knowledge-base">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-mrsg-cyan" />
            <h2 className="text-lg font-semibold">Knowledge Base</h2>
          </div>
          <TabsList>
            <TabsTrigger value="browse" data-testid="tab-browse">
              <Layers className="h-4 w-4 mr-1" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="detail" disabled={!selectedEntry} data-testid="tab-detail">
              <FileText className="h-4 w-4 mr-1" />
              Detail
            </TabsTrigger>
          </TabsList>
          <Badge variant="secondary" className="ml-auto">
            {mockKnowledgeEntries.length} entries
          </Badge>
        </div>

        <TabsContent value="browse" className="flex-1 mt-0">
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* Left: Categories */}
            <div className="col-span-3">
              <Card className="h-full border-mrsg-cyan/20 bg-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4 text-mrsg-cyan" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 px-3 pb-3">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      const count = category.id === "all" 
                        ? mockKnowledgeEntries.length 
                        : mockKnowledgeEntries.filter(e => e.category === category.id).length;
                      return (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? "default" : "ghost"}
                          className="w-full justify-start h-9 text-sm"
                          onClick={() => setSelectedCategory(category.id)}
                          data-testid={`button-category-${category.id}`}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {category.label}
                          <Badge variant="secondary" className="ml-auto text-[10px]">{count}</Badge>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Search and Results */}
            <div className="col-span-9 flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search questions, answers, or topics..."
                  className="pl-9 bg-muted/30 border-mrsg-cyan/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-kb-search"
                />
              </div>

              {/* Results */}
              <Card className="flex-1 border-mrsg-cyan/20 bg-card/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-mrsg-cyan" />
                    Questions
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      {filteredEntries.length} results
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-380px)]">
                    <div className="space-y-2 px-4 pb-4">
                      {filteredEntries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No results found</p>
                          <p className="text-xs">Try adjusting your search or category</p>
                        </div>
                      ) : (
                        filteredEntries.map((entry) => {
                          const CategoryIcon = getCategoryIcon(entry.category);
                          return (
                            <Collapsible
                              key={entry.id}
                              open={expandedEntries.has(entry.id)}
                              onOpenChange={() => toggleEntry(entry.id)}
                            >
                              <CollapsibleTrigger asChild>
                                <div 
                                  className="p-3 rounded-md bg-muted/30 border border-border/50 hover-elevate cursor-pointer"
                                  data-testid={`kb-entry-${entry.id}`}
                                >
                                  <div className="flex items-start gap-3">
                                    {expandedEntries.has(entry.id) ? (
                                      <ChevronDown className="h-4 w-4 text-mrsg-cyan mt-0.5 shrink-0" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                        <Badge variant="secondary" className="text-[10px]">
                                          <CategoryIcon className="h-3 w-3 mr-1" />
                                          {entry.category}
                                        </Badge>
                                        {entry.subcategory && (
                                          <Badge variant="outline" className="text-[10px]">{entry.subcategory}</Badge>
                                        )}
                                        <Badge variant="outline" className={`text-[10px] ${getConfidenceColor(entry.confidence)}`}>
                                          {entry.confidence}% confidence
                                        </Badge>
                                      </div>
                                      <p className="text-sm font-medium text-foreground">{entry.question}</p>
                                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {entry.lastUpdated}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <FileText className="h-3 w-3" />
                                          {entry.citations.length} citations
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <ThumbsUp className="h-3 w-3" />
                                          {entry.helpful} helpful
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="ml-7 mt-2 p-3 rounded-md bg-background/50 border border-border/30">
                                  <p className="text-sm text-foreground mb-3">{entry.answer}</p>
                                  
                                  {/* Follow-ups */}
                                  <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <GitBranch className="h-4 w-4 text-mrsg-cyan" />
                                      <span className="text-xs font-medium">Follow-up Questions</span>
                                    </div>
                                    <div className="space-y-1">
                                      {entry.followUps.map((followUp) => (
                                        <div 
                                          key={followUp.id}
                                          className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover-elevate cursor-pointer"
                                          onClick={() => handleFollowUpClick(followUp)}
                                          data-testid={`followup-${followUp.id}`}
                                        >
                                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                          <span className="text-xs flex-1">{followUp.question}</span>
                                          {followUp.generated && (
                                            <Badge className="bg-purple-500/20 text-purple-400 text-[8px]">
                                              <Sparkles className="h-2 w-2 mr-0.5" />
                                              AI
                                            </Badge>
                                          )}
                                          <Badge variant="outline" className="text-[8px]">{followUp.relevance}%</Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Citations */}
                                  <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <BookOpen className="h-4 w-4 text-mrsg-cyan" />
                                      <span className="text-xs font-medium">Citations</span>
                                    </div>
                                    <div className="space-y-1">
                                      {entry.citations.map((citation) => (
                                        <div 
                                          key={citation.id}
                                          className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                                          data-testid={`citation-${citation.id}`}
                                        >
                                          <Badge className={`text-[8px] ${getCitationTypeColor(citation.type)}`}>
                                            {citation.type}
                                          </Badge>
                                          <span className="text-xs flex-1 truncate">{citation.title}</span>
                                          <span className="text-[10px] text-muted-foreground">{citation.source}</span>
                                          <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-7 text-xs"
                                      onClick={() => selectEntry(entry)}
                                      data-testid={`button-view-full-${entry.id}`}
                                    >
                                      View Full Entry
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs" data-testid={`button-helpful-${entry.id}`}>
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      Helpful
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs" data-testid={`button-not-helpful-${entry.id}`}>
                                      <ThumbsDown className="h-3 w-3 mr-1" />
                                      Not Helpful
                                    </Button>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="detail" className="flex-1 mt-0">
          {selectedEntry && (
            <div className="grid grid-cols-12 gap-4 h-full">
              {/* Main Content */}
              <div className="col-span-8">
                <Card className="h-full border-mrsg-cyan/20 bg-card/80">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{selectedEntry.category}</Badge>
                          {selectedEntry.subcategory && (
                            <Badge variant="outline">{selectedEntry.subcategory}</Badge>
                          )}
                          <Badge className={`${getConfidenceColor(selectedEntry.confidence)} bg-opacity-20`}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {selectedEntry.confidence}% confidence
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{selectedEntry.question}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[calc(100vh-380px)]">
                      <div className="space-y-6 pr-4">
                        {/* Answer */}
                        <div className="p-4 rounded-md bg-muted/30 border border-mrsg-cyan/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="h-5 w-5 text-mrsg-cyan" />
                            <span className="font-medium">Answer</span>
                          </div>
                          <p className="text-sm leading-relaxed">{selectedEntry.answer}</p>
                        </div>

                        {/* Key Points */}
                        <div className="p-4 rounded-md bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Info className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Key Points</span>
                          </div>
                          <ul className="space-y-2">
                            {selectedEntry.answer.split('. ').slice(0, 4).map((point, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-status-stable mt-0.5 shrink-0" />
                                <span>{point.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Citations */}
                        <div className="p-4 rounded-md bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Sources & Citations</span>
                            <Badge variant="secondary" className="ml-auto text-[10px]">
                              {selectedEntry.citations.length} sources
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {selectedEntry.citations.map((citation) => (
                              <div 
                                key={citation.id}
                                className="p-3 rounded-md bg-background/50 border border-border/30 hover-elevate cursor-pointer"
                              >
                                <div className="flex items-start gap-3">
                                  <Badge className={`${getCitationTypeColor(citation.type)} shrink-0`}>
                                    {citation.type}
                                  </Badge>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{citation.title}</p>
                                    <p className="text-xs text-muted-foreground">{citation.source}</p>
                                    {citation.date && (
                                      <p className="text-[10px] text-muted-foreground mt-1">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        {citation.date}
                                      </p>
                                    )}
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Feedback */}
                        <div className="flex items-center justify-between p-4 rounded-md bg-muted/20 border border-border/50">
                          <span className="text-sm text-muted-foreground">Was this answer helpful?</span>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-8" data-testid="button-feedback-helpful">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Yes ({selectedEntry.helpful})
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8" data-testid="button-feedback-not-helpful">
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              No
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Follow-ups Sidebar */}
              <div className="col-span-4">
                <Card className="h-full border-mrsg-cyan/20 bg-card/80">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-mrsg-cyan" />
                      Follow-up Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[calc(100vh-420px)]">
                      <div className="space-y-2 pr-2">
                        {selectedEntry.followUps.map((followUp) => (
                          <div 
                            key={followUp.id}
                            className="p-3 rounded-md bg-muted/30 border border-border/50 hover-elevate cursor-pointer"
                            onClick={() => handleFollowUpClick(followUp)}
                            data-testid={`detail-followup-${followUp.id}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {followUp.generated ? (
                                <Badge className="bg-purple-500/20 text-purple-400 text-[9px]">
                                  <Sparkles className="h-2 w-2 mr-0.5" />
                                  AI Generated
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[9px]">Common</Badge>
                              )}
                              <Badge variant="outline" className="text-[9px] ml-auto">
                                {followUp.relevance}% relevant
                              </Badge>
                            </div>
                            <p className="text-sm">{followUp.question}</p>
                          </div>
                        ))}

                        {/* Generate More Button */}
                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={generateMoreFollowUps}
                          disabled={generatingFollowUps}
                          data-testid="button-generate-followups"
                        >
                          {generatingFollowUps ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate More Questions
                            </>
                          )}
                        </Button>
                      </div>
                    </ScrollArea>

                    {/* Stats */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 rounded-md bg-muted/30">
                          <div className="text-lg font-bold text-mrsg-cyan">{selectedEntry.views}</div>
                          <div className="text-[10px] text-muted-foreground">Views</div>
                        </div>
                        <div className="p-2 rounded-md bg-muted/30">
                          <div className="text-lg font-bold text-status-stable">{selectedEntry.helpful}</div>
                          <div className="text-[10px] text-muted-foreground">Helpful</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
