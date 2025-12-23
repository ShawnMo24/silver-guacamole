import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Building2,
  Users,
  Heart,
  School,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Clock,
  Phone,
  Home,
  Utensils,
  Stethoscope,
  BookOpen,
  HandHeart,
  ChevronRight
} from "lucide-react";

interface City {
  id: string;
  name: string;
  state: string;
  population: string;
  zones: Zone[];
}

interface Zone {
  id: string;
  name: string;
  type: "residential" | "commercial" | "mixed" | "industrial";
  riskLevel: "low" | "moderate" | "elevated" | "high";
  population: string;
  trends: TrendData;
  resources: CommunityResource[];
  recentActivity: number;
}

interface TrendData {
  incidentsTrend: "up" | "down" | "stable";
  incidentsChange: number;
  responseTimeTrend: "up" | "down" | "stable";
  responseTimeChange: number;
  communityEngagement: "up" | "down" | "stable";
  engagementChange: number;
}

interface CommunityResource {
  id: string;
  name: string;
  type: "shelter" | "food" | "medical" | "education" | "support" | "safety";
  address: string;
  phone?: string;
  hours?: string;
  available: boolean;
}

const mockCities: City[] = [
  {
    id: "city-1",
    name: "Metro City",
    state: "CA",
    population: "1.2M",
    zones: [
      {
        id: "zone-1",
        name: "Downtown Core",
        type: "commercial",
        riskLevel: "moderate",
        population: "45,000",
        recentActivity: 12,
        trends: {
          incidentsTrend: "down",
          incidentsChange: -8,
          responseTimeTrend: "stable",
          responseTimeChange: 0,
          communityEngagement: "up",
          engagementChange: 15,
        },
        resources: [
          { id: "r1", name: "Central Community Shelter", type: "shelter", address: "123 Main St", phone: "555-0100", hours: "24/7", available: true },
          { id: "r2", name: "Downtown Food Bank", type: "food", address: "456 Oak Ave", phone: "555-0101", hours: "9AM-5PM", available: true },
          { id: "r3", name: "Metro Health Clinic", type: "medical", address: "789 Health Way", phone: "555-0102", hours: "8AM-8PM", available: true },
        ],
      },
      {
        id: "zone-2",
        name: "Riverside District",
        type: "residential",
        riskLevel: "low",
        population: "82,000",
        recentActivity: 3,
        trends: {
          incidentsTrend: "stable",
          incidentsChange: 0,
          responseTimeTrend: "down",
          responseTimeChange: -12,
          communityEngagement: "up",
          engagementChange: 22,
        },
        resources: [
          { id: "r4", name: "Riverside Family Center", type: "support", address: "321 River Rd", phone: "555-0103", hours: "9AM-6PM", available: true },
          { id: "r5", name: "Community Learning Hub", type: "education", address: "654 Scholar Ln", phone: "555-0104", hours: "7AM-9PM", available: true },
        ],
      },
      {
        id: "zone-3",
        name: "Industrial Park",
        type: "industrial",
        riskLevel: "elevated",
        population: "12,000",
        recentActivity: 8,
        trends: {
          incidentsTrend: "up",
          incidentsChange: 5,
          responseTimeTrend: "up",
          responseTimeChange: 8,
          communityEngagement: "stable",
          engagementChange: 0,
        },
        resources: [
          { id: "r6", name: "Workers Support Center", type: "support", address: "999 Industry Blvd", phone: "555-0105", hours: "6AM-10PM", available: true },
        ],
      },
      {
        id: "zone-4",
        name: "Oak Heights",
        type: "mixed",
        riskLevel: "high",
        population: "38,000",
        recentActivity: 18,
        trends: {
          incidentsTrend: "up",
          incidentsChange: 12,
          responseTimeTrend: "up",
          responseTimeChange: 15,
          communityEngagement: "down",
          engagementChange: -5,
        },
        resources: [
          { id: "r7", name: "Heights Youth Center", type: "education", address: "147 Oak Hill", phone: "555-0106", hours: "3PM-9PM", available: true },
          { id: "r8", name: "Community Health Outreach", type: "medical", address: "258 Heights Ave", phone: "555-0107", hours: "9AM-5PM", available: false },
          { id: "r9", name: "Safe Haven Shelter", type: "shelter", address: "369 Refuge St", phone: "555-0108", hours: "24/7", available: true },
        ],
      },
    ],
  },
  {
    id: "city-2",
    name: "Harbor Town",
    state: "CA",
    population: "450K",
    zones: [
      {
        id: "zone-5",
        name: "Harbor Front",
        type: "commercial",
        riskLevel: "moderate",
        population: "28,000",
        recentActivity: 7,
        trends: {
          incidentsTrend: "stable",
          incidentsChange: 2,
          responseTimeTrend: "down",
          responseTimeChange: -5,
          communityEngagement: "up",
          engagementChange: 10,
        },
        resources: [
          { id: "r10", name: "Harbor Community Center", type: "support", address: "100 Dock St", phone: "555-0200", hours: "8AM-8PM", available: true },
        ],
      },
      {
        id: "zone-6",
        name: "Seaside Village",
        type: "residential",
        riskLevel: "low",
        population: "65,000",
        recentActivity: 2,
        trends: {
          incidentsTrend: "down",
          incidentsChange: -15,
          responseTimeTrend: "stable",
          responseTimeChange: 0,
          communityEngagement: "up",
          engagementChange: 18,
        },
        resources: [
          { id: "r11", name: "Seaside Library & Resource Center", type: "education", address: "200 Beach Blvd", phone: "555-0201", hours: "9AM-7PM", available: true },
          { id: "r12", name: "Village Food Pantry", type: "food", address: "300 Coast Way", phone: "555-0202", hours: "10AM-4PM", available: true },
        ],
      },
    ],
  },
  {
    id: "city-3",
    name: "Valley Springs",
    state: "CA",
    population: "280K",
    zones: [
      {
        id: "zone-7",
        name: "Valley Center",
        type: "mixed",
        riskLevel: "low",
        population: "52,000",
        recentActivity: 4,
        trends: {
          incidentsTrend: "down",
          incidentsChange: -10,
          responseTimeTrend: "down",
          responseTimeChange: -8,
          communityEngagement: "stable",
          engagementChange: 3,
        },
        resources: [
          { id: "r13", name: "Valley Wellness Center", type: "medical", address: "500 Spring St", phone: "555-0300", hours: "7AM-9PM", available: true },
          { id: "r14", name: "Springs Community Kitchen", type: "food", address: "600 Valley Rd", phone: "555-0301", hours: "11AM-7PM", available: true },
        ],
      },
    ],
  },
];

function getTrendIcon(trend: "up" | "down" | "stable") {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-3 w-3" />;
    case "down":
      return <TrendingDown className="h-3 w-3" />;
    case "stable":
      return <Minus className="h-3 w-3" />;
  }
}

function getTrendColor(trend: "up" | "down" | "stable", inverted = false) {
  if (inverted) {
    switch (trend) {
      case "up":
        return "text-status-danger";
      case "down":
        return "text-status-stable";
      case "stable":
        return "text-muted-foreground";
    }
  }
  switch (trend) {
    case "up":
      return "text-status-stable";
    case "down":
      return "text-status-danger";
    case "stable":
      return "text-muted-foreground";
  }
}

function getRiskColor(risk: Zone["riskLevel"]) {
  switch (risk) {
    case "low":
      return "bg-status-stable/20 text-status-stable border-status-stable/30";
    case "moderate":
      return "bg-mrsg-cyan/20 text-mrsg-cyan border-mrsg-cyan/30";
    case "elevated":
      return "bg-status-escalating/20 text-status-escalating border-status-escalating/30";
    case "high":
      return "bg-status-danger/20 text-status-danger border-status-danger/30";
  }
}

function getZoneTypeIcon(type: Zone["type"]) {
  switch (type) {
    case "residential":
      return <Home className="h-3 w-3" />;
    case "commercial":
      return <Building2 className="h-3 w-3" />;
    case "mixed":
      return <Users className="h-3 w-3" />;
    case "industrial":
      return <Building2 className="h-3 w-3" />;
  }
}

function getResourceIcon(type: CommunityResource["type"]) {
  switch (type) {
    case "shelter":
      return <Home className="h-4 w-4" />;
    case "food":
      return <Utensils className="h-4 w-4" />;
    case "medical":
      return <Stethoscope className="h-4 w-4" />;
    case "education":
      return <BookOpen className="h-4 w-4" />;
    case "support":
      return <HandHeart className="h-4 w-4" />;
    case "safety":
      return <ShieldCheck className="h-4 w-4" />;
  }
}

interface ZoneIntelligenceProps {
  compact?: boolean;
}

export function ZoneIntelligence({ compact = false }: ZoneIntelligenceProps) {
  const [selectedCity, setSelectedCity] = useState<City>(mockCities[0]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const handleCityChange = (cityId: string) => {
    const city = mockCities.find((c) => c.id === cityId);
    if (city) {
      setSelectedCity(city);
      setSelectedZone(null);
    }
  };

  const totalIncidents = selectedCity.zones.reduce((sum, z) => sum + z.recentActivity, 0);
  const avgRisk = selectedCity.zones.filter((z) => z.riskLevel === "high" || z.riskLevel === "elevated").length;
  const totalResources = selectedCity.zones.reduce((sum, z) => sum + z.resources.length, 0);

  if (compact) {
    return (
      <Card className="border-mrsg-cyan/20 bg-card/80" data-testid="zone-intelligence-compact">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-mrsg-cyan" />
            Zone Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCity.id} onValueChange={handleCityChange}>
            <SelectTrigger className="h-8 text-xs mb-3" data-testid="select-city-compact">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockCities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}, {city.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-muted/30 rounded-md" data-testid="metric-zones-compact">
              <div className="text-lg font-bold text-mrsg-cyan" data-testid="value-zones-count">{selectedCity.zones.length}</div>
              <div className="text-[10px] text-muted-foreground">Zones</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded-md" data-testid="metric-risk-compact">
              <div className="text-lg font-bold text-status-escalating" data-testid="value-risk-count">{avgRisk}</div>
              <div className="text-[10px] text-muted-foreground">At Risk</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded-md" data-testid="metric-active-compact">
              <div className="text-lg font-bold text-foreground" data-testid="value-active-count">{totalIncidents}</div>
              <div className="text-[10px] text-muted-foreground">Active</div>
            </div>
          </div>

          <div className="space-y-1">
            {selectedCity.zones.slice(0, 3).map((zone) => (
              <div
                key={zone.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted/20 text-xs"
                data-testid={`zone-row-${zone.id}`}
              >
                <div className="flex items-center gap-2">
                  {getZoneTypeIcon(zone.type)}
                  <span className="font-medium">{zone.name}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] ${getRiskColor(zone.riskLevel)}`}>
                  {zone.riskLevel}
                </Badge>
              </div>
            ))}
            {selectedCity.zones.length > 3 && (
              <div className="text-center text-[10px] text-muted-foreground pt-1">
                +{selectedCity.zones.length - 3} more zones
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col" data-testid="zone-intelligence">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-mrsg-cyan" />
          <h2 className="text-lg font-semibold">Zone Intelligence</h2>
        </div>
        <Select value={selectedCity.id} onValueChange={handleCityChange}>
          <SelectTrigger className="w-48" data-testid="select-city">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {mockCities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}, {city.state} ({city.population})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <Card className="border-mrsg-cyan/20 bg-card/60" data-testid="metric-active-zones">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-mrsg-cyan" data-testid="value-active-zones">{selectedCity.zones.length}</div>
            <div className="text-xs text-muted-foreground">Active Zones</div>
          </CardContent>
        </Card>
        <Card className="border-mrsg-cyan/20 bg-card/60" data-testid="metric-population">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-foreground" data-testid="value-population">{selectedCity.population}</div>
            <div className="text-xs text-muted-foreground">Population</div>
          </CardContent>
        </Card>
        <Card className="border-mrsg-cyan/20 bg-card/60" data-testid="metric-elevated-risk">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-status-escalating" data-testid="value-elevated-risk">{avgRisk}</div>
            <div className="text-xs text-muted-foreground">Elevated Risk Zones</div>
          </CardContent>
        </Card>
        <Card className="border-mrsg-cyan/20 bg-card/60" data-testid="metric-resources">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-status-stable" data-testid="value-resources">{totalResources}</div>
            <div className="text-xs text-muted-foreground">Community Resources</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        <div className="col-span-4 flex flex-col">
          <Card className="flex-1 border-mrsg-cyan/20 bg-card/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-mrsg-cyan" />
                Zone Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="p-3 space-y-2">
                  {selectedCity.zones.map((zone) => (
                    <div
                      key={zone.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedZone?.id === zone.id
                          ? "border-mrsg-cyan bg-mrsg-cyan/10"
                          : "border-border/50 bg-muted/20 hover-elevate"
                      }`}
                      onClick={() => setSelectedZone(zone)}
                      data-testid={`zone-card-${zone.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getZoneTypeIcon(zone.type)}
                          <span className="font-medium text-sm">{zone.name}</span>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${getRiskColor(zone.riskLevel)}`}>
                          {zone.riskLevel}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{zone.population}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span>{zone.recentActivity} active</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-muted-foreground" />
                          <span>{zone.resources.length} resources</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-8 flex flex-col">
          {selectedZone ? (
            <Card className="flex-1 border-mrsg-cyan/20 bg-card/80">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {getZoneTypeIcon(selectedZone.type)}
                    {selectedZone.name}
                    <Badge variant="outline" className={`text-[10px] ${getRiskColor(selectedZone.riskLevel)}`}>
                      {selectedZone.riskLevel} risk
                    </Badge>
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedZone(null)}
                    data-testid="button-close-zone"
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <div className="px-4">
                    <TabsList className="w-full max-w-md">
                      <TabsTrigger value="overview" className="flex-1" data-testid="tab-zone-overview">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="trends" className="flex-1" data-testid="tab-zone-trends">
                        Trends
                      </TabsTrigger>
                      <TabsTrigger value="resources" className="flex-1" data-testid="tab-zone-resources">
                        Resources
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <ScrollArea className="h-[calc(100vh-480px)]">
                    <TabsContent value="overview" className="m-0 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-md bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="h-4 w-4 text-mrsg-cyan" />
                            <span className="font-medium text-sm">Demographics</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Population</span>
                              <span className="font-medium">{selectedZone.population}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Zone Type</span>
                              <span className="font-medium capitalize">{selectedZone.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Risk Level</span>
                              <Badge variant="outline" className={`text-[10px] ${getRiskColor(selectedZone.riskLevel)}`}>
                                {selectedZone.riskLevel}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-md bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Activity className="h-4 w-4 text-mrsg-cyan" />
                            <span className="font-medium text-sm">Current Activity</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Active Incidents</span>
                              <span className="font-medium">{selectedZone.recentActivity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Available Resources</span>
                              <span className="font-medium">{selectedZone.resources.filter((r) => r.available).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Resources</span>
                              <span className="font-medium">{selectedZone.resources.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="trends" className="m-0 p-4">
                      <div className="space-y-4">
                        <div className="p-4 rounded-md bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="h-4 w-4 text-mrsg-cyan" />
                            <span className="font-medium text-sm">Trend Analysis (30 days)</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 rounded-md bg-background/50" data-testid="trend-incident-rate">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Incident Rate</span>
                              </div>
                              <div className={`flex items-center gap-1 ${getTrendColor(selectedZone.trends.incidentsTrend, true)}`}>
                                {getTrendIcon(selectedZone.trends.incidentsTrend)}
                                <span className="text-sm font-medium" data-testid="value-incident-change">
                                  {selectedZone.trends.incidentsChange > 0 ? "+" : ""}
                                  {selectedZone.trends.incidentsChange}%
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-md bg-background/50" data-testid="trend-response-time">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Response Time</span>
                              </div>
                              <div className={`flex items-center gap-1 ${getTrendColor(selectedZone.trends.responseTimeTrend, true)}`}>
                                {getTrendIcon(selectedZone.trends.responseTimeTrend)}
                                <span className="text-sm font-medium" data-testid="value-response-change">
                                  {selectedZone.trends.responseTimeChange > 0 ? "+" : ""}
                                  {selectedZone.trends.responseTimeChange}%
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-md bg-background/50" data-testid="trend-engagement">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Community Engagement</span>
                              </div>
                              <div className={`flex items-center gap-1 ${getTrendColor(selectedZone.trends.communityEngagement)}`}>
                                {getTrendIcon(selectedZone.trends.communityEngagement)}
                                <span className="text-sm font-medium" data-testid="value-engagement-change">
                                  {selectedZone.trends.engagementChange > 0 ? "+" : ""}
                                  {selectedZone.trends.engagementChange}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-md bg-muted/30 border border-border/50">
                          <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="h-4 w-4 text-mrsg-cyan" />
                            <span className="font-medium text-sm">Risk Indicators</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {selectedZone.riskLevel === "high" && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-status-danger">
                                  <ChevronRight className="h-3 w-3" />
                                  <span>Elevated incident frequency detected</span>
                                </div>
                                <div className="flex items-center gap-2 text-status-danger">
                                  <ChevronRight className="h-3 w-3" />
                                  <span>Response time trending upward</span>
                                </div>
                                <div className="flex items-center gap-2 text-status-escalating">
                                  <ChevronRight className="h-3 w-3" />
                                  <span>Community engagement declining</span>
                                </div>
                              </div>
                            )}
                            {selectedZone.riskLevel === "elevated" && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-status-escalating">
                                  <ChevronRight className="h-3 w-3" />
                                  <span>Incident patterns emerging</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <ChevronRight className="h-3 w-3" />
                                  <span>Monitoring for trend changes</span>
                                </div>
                              </div>
                            )}
                            {selectedZone.riskLevel === "moderate" && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-mrsg-cyan">
                                  <ChevronRight className="h-3 w-3" />
                                  <span>Stable baseline metrics</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <ChevronRight className="h-3 w-3" />
                                  <span>Standard monitoring active</span>
                                </div>
                              </div>
                            )}
                            {selectedZone.riskLevel === "low" && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-status-stable">
                                  <ChevronRight className="h-3 w-3" />
                                  <span>All metrics within healthy range</span>
                                </div>
                                <div className="flex items-center gap-2 text-status-stable">
                                  <ChevronRight className="h-3 w-3" />
                                  <span>Strong community engagement</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="resources" className="m-0 p-4">
                      <div className="space-y-3">
                        {selectedZone.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className={`p-3 rounded-md border ${
                              resource.available
                                ? "border-border/50 bg-muted/20"
                                : "border-status-escalating/30 bg-status-escalating/10"
                            }`}
                            data-testid={`resource-${resource.id}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-md ${resource.available ? "bg-mrsg-cyan/20 text-mrsg-cyan" : "bg-status-escalating/20 text-status-escalating"}`}>
                                {getResourceIcon(resource.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">{resource.name}</span>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] ${
                                      resource.available
                                        ? "bg-status-stable/20 text-status-stable border-status-stable/30"
                                        : "bg-status-escalating/20 text-status-escalating border-status-escalating/30"
                                    }`}
                                  >
                                    {resource.available ? "Available" : "Limited"}
                                  </Badge>
                                </div>
                                <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{resource.address}</span>
                                  </div>
                                  {resource.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{resource.phone}</span>
                                    </div>
                                  )}
                                  {resource.hours && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{resource.hours}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex-1 border-mrsg-cyan/20 bg-card/80 flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Select a zone to view details</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click on any zone profile to see trends, resources, and risk indicators
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
