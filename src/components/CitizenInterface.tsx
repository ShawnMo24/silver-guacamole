import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { EmergencyCallout } from "./SafetyBanner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  MapPin,
  Shield,
  AlertTriangle,
  Phone,
  MessageSquare,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Send,
  Navigation,
  Heart,
  HelpCircle,
  FileText,
  Clock,
  ChevronLeft,
  Home,
  Users,
  Building,
  GraduationCap,
  HandHeart,
  CircleAlert,
  ArrowLeft,
  RefreshCw,
  Moon,
  Hand,
  Car,
  Footprints,
  MessageCircle,
  Flame,
  Siren,
  HeartPulse,
  Zap,
  UserX,
  ShieldAlert,
  Skull,
  HelpingHand,
  Map,
  Building2,
  TreePine,
  Mic,
  MicOff,
} from "lucide-react";

const UNLOCK_CODE = "MRSG";
const ADMIN_OVERRIDE_CODE = "ADMIN-MRSG";
const BRAIN_CONSENT_KEY = "brainV2Consent";

const URGENCY_KEYWORDS = [
  "gun", "knife", "kill", "hurt", "help", "please",
  "don't hurt me", "he has", "she has", "weapon",
  "shoot", "stab", "attack", "threat", "danger",
  "hostage", "bomb", "fire", "bleeding", "dying"
];

function analyzeUrgencyLevel(text: string): { detected: boolean; words: string[]; level: "unknown" | "high" } {
  const lowerText = text.toLowerCase();
  const hits = URGENCY_KEYWORDS.filter(word => lowerText.includes(word));
  return {
    detected: hits.length > 0,
    words: hits,
    level: hits.length > 0 ? "high" : "unknown"
  };
}

const QUICK_TAP_OPTIONS = [
  { id: "cant_speak", label: "Can't Speak", icon: MicOff },
  { id: "being_followed", label: "Being Followed", icon: Footprints },
  { id: "weapon_involved", label: "Weapon Involved", icon: ShieldAlert },
] as const;

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
import { Link } from "wouter";

type ActiveView = "home" | "report" | "school" | "danger" | "checkin" | "blackMode" | "triage";
type ReportCategory = "wellness" | "safety" | "community" | "resource" | "other";
type BlackModePhase = "dark" | "options";
type TriageStep = 1 | 2 | 3 | 4 | 5;

interface TriageData {
  whatHappening: string;
  whereLocation: string;
  howReach: string;
  supportType: string;
  policeSubType: string;
}

const WHAT_HAPPENING_OPTIONS = [
  { id: "medical", label: "Medical Emergency", icon: HeartPulse },
  { id: "violence", label: "Violence/Assault", icon: ShieldAlert },
  { id: "fire", label: "Fire/Smoke", icon: Flame },
  { id: "threat", label: "Active Threat", icon: Skull },
  { id: "accident", label: "Accident", icon: Car },
  { id: "mental", label: "Mental Health Crisis", icon: Heart },
  { id: "domestic", label: "Domestic Situation", icon: Users },
  { id: "suspicious", label: "Suspicious Activity", icon: Eye },
  { id: "trapped", label: "Trapped/Stuck", icon: Lock },
  { id: "other", label: "Other Emergency", icon: CircleAlert },
];

const WHERE_OPTIONS = [
  { id: "home", label: "At Home", icon: Home },
  { id: "work", label: "At Work", icon: Building2 },
  { id: "public", label: "Public Place", icon: Users },
  { id: "outside", label: "Outside/Outdoors", icon: TreePine },
  { id: "map", label: "Share My Location", icon: Map },
];

const HOW_REACH_OPTIONS = [
  { id: "call", label: "Call Me", icon: Phone },
  { id: "text", label: "Text Only", icon: MessageCircle },
  { id: "silent", label: "Stay Silent", icon: EyeOff },
];

const REPORT_WHAT_OPTIONS = [
  { id: "violent", label: "Violent Crime", icon: ShieldAlert },
  { id: "property", label: "Property Crime", icon: Building2 },
  { id: "vehicular", label: "Vehicular Crime", icon: Car },
  { id: "drugs", label: "Drug Activity", icon: CircleAlert },
  { id: "fraud", label: "Fraud / Scams", icon: AlertTriangle },
  { id: "trafficking", label: "Trafficking", icon: Users },
  { id: "gang", label: "Gang Activity", icon: Skull },
  { id: "community", label: "Adverse Community Issue", icon: Users },
  { id: "other", label: "Other Crime", icon: HelpCircle },
];

const REPORT_WHEN_OPTIONS = [
  { id: "now", label: "Happening Now", icon: Zap },
  { id: "recent", label: "Within 1 Hour", icon: Clock },
  { id: "today", label: "Earlier Today", icon: Clock },
  { id: "yesterday", label: "Yesterday", icon: Clock },
  { id: "ongoing", label: "Ongoing Issue", icon: RefreshCw },
];

const REPORT_WHERE_OPTIONS = [
  { id: "home", label: "Near My Home", icon: Home },
  { id: "work", label: "Near Work", icon: Building2 },
  { id: "public", label: "Public Area", icon: Users },
  { id: "park", label: "Park/Outdoor", icon: TreePine },
  { id: "map", label: "Share Location", icon: Map },
];

const REPORT_SUBCATEGORY_OPTIONS: Record<string, { id: string; label: string; icon: typeof AlertTriangle }[]> = {
  violent: [
    { id: "assault", label: "Assault / Battery", icon: Hand },
    { id: "robbery", label: "Robbery", icon: ShieldAlert },
    { id: "domestic", label: "Domestic Violence", icon: Home },
    { id: "threats", label: "Threats / Intimidation", icon: AlertTriangle },
    { id: "sexual", label: "Sexual Assault", icon: ShieldAlert },
    { id: "weapon", label: "Weapon Involved", icon: Skull },
    { id: "fight", label: "Fight / Altercation", icon: Users },
  ],
  property: [
    { id: "theft", label: "Theft / Larceny", icon: Hand },
    { id: "burglary", label: "Burglary / Break-in", icon: Home },
    { id: "vandalism", label: "Vandalism / Graffiti", icon: Flame },
    { id: "auto", label: "Auto Theft", icon: Car },
    { id: "trespassing", label: "Trespassing", icon: AlertTriangle },
    { id: "arson", label: "Arson", icon: Flame },
  ],
  drugs: [
    { id: "dealing", label: "Drug Dealing / Sales", icon: Users },
    { id: "use", label: "Drug Use in Public", icon: Eye },
    { id: "paraphernalia", label: "Paraphernalia Found", icon: AlertTriangle },
    { id: "trafficking", label: "Drug Trafficking", icon: Car },
    { id: "house", label: "Drug House / Location", icon: Home },
  ],
  fraud: [
    { id: "phone", label: "Phone / Text Scam", icon: Phone },
    { id: "online", label: "Online / Email Scam", icon: MessageSquare },
    { id: "door", label: "Door-to-Door Scam", icon: Home },
    { id: "identity", label: "Identity Theft", icon: UserX },
    { id: "financial", label: "Financial Fraud", icon: Building2 },
    { id: "elder", label: "Elder Abuse / Scam", icon: Heart },
  ],
  trafficking: [
    { id: "human", label: "Human Trafficking", icon: Users },
    { id: "labor", label: "Labor Trafficking", icon: Building2 },
    { id: "sex", label: "Sex Trafficking", icon: ShieldAlert },
    { id: "minors", label: "Involves Minors", icon: Users },
    { id: "suspicious", label: "Suspicious Activity", icon: Eye },
  ],
  gang: [
    { id: "activity", label: "Gang Activity", icon: Users },
    { id: "recruitment", label: "Gang Recruitment", icon: UserX },
    { id: "graffiti", label: "Gang Graffiti / Tags", icon: Flame },
    { id: "intimidation", label: "Gang Intimidation", icon: AlertTriangle },
    { id: "violence", label: "Gang Violence", icon: ShieldAlert },
    { id: "gathering", label: "Gang Gathering", icon: Users },
  ],
  vehicular: [
    { id: "hitrun", label: "Hit and Run", icon: Car },
    { id: "dui", label: "DUI / Impaired Driver", icon: AlertTriangle },
    { id: "reckless", label: "Reckless Driving", icon: Zap },
    { id: "racing", label: "Street Racing", icon: Car },
    { id: "theft", label: "Vehicle Theft", icon: ShieldAlert },
    { id: "carjacking", label: "Carjacking", icon: Skull },
    { id: "pursuit", label: "Police Pursuit", icon: Siren },
    { id: "accident", label: "Major Accident", icon: AlertTriangle },
  ],
  community: [
    { id: "noise", label: "Excessive Noise", icon: MessageCircle },
    { id: "dumping", label: "Illegal Dumping", icon: AlertTriangle },
    { id: "vehicle", label: "Abandoned Vehicle", icon: Car },
    { id: "homeless", label: "Homeless Encampment", icon: Home },
    { id: "loitering", label: "Loitering / Panhandling", icon: Users },
    { id: "nuisance", label: "Public Nuisance", icon: CircleAlert },
    { id: "animal", label: "Animal Complaint", icon: AlertTriangle },
    { id: "parking", label: "Parking Violation", icon: Car },
    { id: "blight", label: "Property Blight", icon: Building2 },
  ],
  other: [
    { id: "disturbance", label: "Disturbance / Disorder", icon: AlertTriangle },
    { id: "harassment", label: "Harassment", icon: ShieldAlert },
    { id: "wellness", label: "Wellness Concern", icon: Heart },
    { id: "suspicious", label: "Suspicious Person", icon: UserX },
    { id: "misc", label: "Other / Not Listed", icon: HelpCircle },
  ],
};

const REPORT_WEAPON_OPTIONS = [
  { id: "firearm", label: "Firearm/Gun", icon: ShieldAlert },
  { id: "knife", label: "Knife/Blade", icon: AlertTriangle },
  { id: "blunt", label: "Blunt Object", icon: Hand },
  { id: "unknown", label: "Unknown Type", icon: HelpCircle },
  { id: "none", label: "No Weapon Visible", icon: Eye },
];

const REPORT_VEHICLE_OPTIONS = [
  { id: "sedan", label: "Sedan/Car", icon: Car },
  { id: "suv", label: "SUV/Truck", icon: Car },
  { id: "van", label: "Van", icon: Car },
  { id: "motorcycle", label: "Motorcycle", icon: Car },
  { id: "unknown", label: "Unknown Type", icon: HelpCircle },
];

const REPORT_SOURCE_OPTIONS = [
  { id: "seen", label: "I Saw It", icon: Eye },
  { id: "heard", label: "I Heard It", icon: MessageCircle },
  { id: "thirdparty", label: "Someone Told Me", icon: Users },
  { id: "camera", label: "Saw on Camera", icon: Eye },
  { id: "online", label: "Saw Online", icon: MessageSquare },
  { id: "social", label: "Social Media", icon: MessageSquare },
];

const REPORT_LOCATION_TYPE_OPTIONS = [
  { id: "residential", label: "Residential Area", icon: Home },
  { id: "commercial", label: "Business/Store", icon: Building2 },
  { id: "school", label: "School Zone", icon: GraduationCap },
  { id: "park", label: "Park/Recreation", icon: TreePine },
  { id: "street", label: "Street/Road", icon: Map },
  { id: "transit", label: "Transit/Station", icon: Car },
];

const REPORT_ONGOING_OPTIONS = [
  { id: "yes", label: "Yes, Still Happening", icon: Zap },
  { id: "no", label: "No, It Stopped", icon: CheckCircle },
  { id: "unsure", label: "Not Sure", icon: HelpCircle },
];

const REPORT_CONTACT_METHOD_OPTIONS = [
  { id: "call", label: "Call Me", icon: Phone },
  { id: "text", label: "Text Me", icon: MessageCircle },
  { id: "none", label: "No Contact Needed", icon: EyeOff },
];

const SUPPORT_TYPE_OPTIONS = [
  { id: "police", label: "Police", icon: Shield },
  { id: "fire", label: "Fire/Rescue", icon: Flame },
  { id: "medical", label: "Medical", icon: HeartPulse },
  { id: "mental", label: "Crisis Support", icon: Heart },
  { id: "unsure", label: "Not Sure", icon: HelpCircle },
];

const POLICE_SUB_OPTIONS = [
  { id: "patrol", label: "Send Patrol Unit", icon: Car },
  { id: "detective", label: "Investigation Needed", icon: Eye },
  { id: "standby", label: "Standby/Observation", icon: Shield },
];

const SCHOOL_SAFETY_OPTIONS = [
  { id: "threat", label: "Active Threat", icon: Skull },
  { id: "weapon", label: "Weapon Seen", icon: ShieldAlert },
  { id: "fight", label: "Fight/Violence", icon: Users },
  { id: "bullying", label: "Bullying", icon: UserX },
  { id: "stranger", label: "Stranger on Campus", icon: Eye },
  { id: "emergency", label: "Medical Emergency", icon: HeartPulse },
  { id: "fire", label: "Fire/Hazard", icon: Flame },
  { id: "other", label: "Other Concern", icon: CircleAlert },
];

const SCHOOL_ADVERSE_OPTIONS = [
  { id: "selfharm", label: "Self-Harm Concern", icon: Heart },
  { id: "abuse", label: "Suspected Abuse", icon: ShieldAlert },
  { id: "isolation", label: "Extreme Isolation", icon: UserX },
  { id: "threats", label: "Making Threats", icon: AlertTriangle },
  { id: "behavior", label: "Behavior Change", icon: RefreshCw },
  { id: "substance", label: "Substance Use", icon: CircleAlert },
  { id: "crisis", label: "In Crisis", icon: Zap },
  { id: "other", label: "Other Concern", icon: HelpCircle },
];

const SCHOOL_WHEN_OPTIONS = [
  { id: "now", label: "Happening Now", icon: Zap },
  { id: "today", label: "Earlier Today", icon: Clock },
  { id: "recent", label: "Past Few Days", icon: Clock },
  { id: "ongoing", label: "Ongoing Pattern", icon: RefreshCw },
];

const CAMPUS_LOCATION_OPTIONS = [
  { id: "classroom", label: "Classroom" },
  { id: "hallway", label: "Hallway" },
  { id: "cafeteria", label: "Cafeteria" },
  { id: "gym", label: "Gym/Field" },
  { id: "bathroom", label: "Bathroom" },
  { id: "parking", label: "Parking Lot" },
  { id: "entrance", label: "Entrance/Exit" },
  { id: "playground", label: "Playground" },
  { id: "bus", label: "Bus/Bus Stop" },
  { id: "other", label: "Other Area" },
];

const SCHOOL_TYPE_OPTIONS = [
  { id: "k12", label: "K-12 School", icon: GraduationCap },
  { id: "campus", label: "College/University", icon: Building2 },
  { id: "bus", label: "School Bus", icon: Car },
  { id: "event", label: "School Event", icon: Users },
  { id: "online", label: "Online/Virtual", icon: MessageSquare },
];

const SCHOOL_WHO_OPTIONS = [
  { id: "student", label: "Student", icon: Users },
  { id: "staff", label: "Staff/Teacher", icon: User },
  { id: "visitor", label: "Visitor/Stranger", icon: UserX },
  { id: "multiple", label: "Multiple People", icon: Users },
  { id: "unknown", label: "Unknown", icon: HelpCircle },
];

const SCHOOL_COUNT_OPTIONS = [
  { id: "one", label: "1 Person", icon: User },
  { id: "few", label: "2-5 People", icon: Users },
  { id: "many", label: "6+ People", icon: Users },
  { id: "unknown", label: "Not Sure", icon: HelpCircle },
];

const SCHOOL_AGE_OPTIONS = [
  { id: "child", label: "Elementary Age", icon: Users },
  { id: "teen", label: "Middle/High School", icon: Users },
  { id: "adult", label: "Adult", icon: User },
  { id: "mixed", label: "Mixed Ages", icon: Users },
  { id: "unknown", label: "Not Sure", icon: HelpCircle },
];

const SCHOOL_DANGER_OPTIONS = [
  { id: "immediate", label: "Yes - Immediate Danger", icon: Zap },
  { id: "escalating", label: "May Escalate", icon: AlertTriangle },
  { id: "no", label: "No Immediate Danger", icon: Shield },
  { id: "unsure", label: "Not Sure", icon: HelpCircle },
];

const SCHOOL_SOURCE_OPTIONS = [
  { id: "witnessed", label: "I Witnessed It", icon: Eye },
  { id: "heard", label: "I Heard About It", icon: MessageCircle },
  { id: "student", label: "Student Told Me", icon: Users },
  { id: "staff", label: "Staff Told Me", icon: User },
  { id: "online", label: "Saw Online/Social", icon: MessageSquare },
];

const ADVERSE_RELATIONSHIP_OPTIONS = [
  { id: "friend", label: "Friend / Classmate", icon: Users },
  { id: "teacher", label: "Teacher / Staff", icon: User },
  { id: "parent", label: "Parent / Guardian", icon: Home },
  { id: "counselor", label: "Counselor", icon: Heart },
  { id: "anonymous", label: "Prefer Not to Say", icon: EyeOff },
];

const ADVERSE_DURATION_OPTIONS = [
  { id: "recent", label: "Just Started", icon: Clock },
  { id: "weeks", label: "Past Few Weeks", icon: Clock },
  { id: "months", label: "Ongoing for Months", icon: RefreshCw },
  { id: "unsure", label: "Not Sure", icon: HelpCircle },
];

const ADVERSE_SUPPORT_OPTIONS = [
  { id: "yes", label: "Yes, Has Support", icon: Heart },
  { id: "some", label: "Some Support", icon: Users },
  { id: "no", label: "No Known Support", icon: UserX },
  { id: "unsure", label: "Not Sure", icon: HelpCircle },
];

const ADVERSE_URGENCY_OPTIONS = [
  { id: "immediate", label: "Needs Help Now", icon: Zap },
  { id: "soon", label: "Within a Few Days", icon: Clock },
  { id: "monitor", label: "Worth Monitoring", icon: Eye },
  { id: "unsure", label: "Not Sure", icon: HelpCircle },
];

const BLACK_MODE_DURATION = 30000;

interface RecentReport {
  id: string;
  category: ReportCategory;
  status: "pending" | "assigned" | "monitoring" | "resolved";
  timestamp: Date;
  summary: string;
  referenceCode: string;
}

const categoryConfig: Record<ReportCategory, { icon: typeof AlertTriangle; label: string; color: string }> = {
  wellness: { icon: Heart, label: "Wellness Concern", color: "text-stable" },
  safety: { icon: Shield, label: "Safety Concern", color: "text-danger" },
  community: { icon: Users, label: "Community Concern", color: "text-mrsg-cyan" },
  resource: { icon: HelpCircle, label: "Resource Need", color: "text-escalating" },
  other: { icon: FileText, label: "Other", color: "text-muted-foreground" },
};

const mockRecentReports: RecentReport[] = [
  {
    id: "r-1",
    category: "wellness",
    status: "monitoring",
    timestamp: new Date(Date.now() - 3600000),
    summary: "Wellness check requested for elderly neighbor",
    referenceCode: "LPM-2024-0847",
  },
  {
    id: "r-2",
    category: "community",
    status: "resolved",
    timestamp: new Date(Date.now() - 86400000),
    summary: "Community concern addressed through mediation",
    referenceCode: "LPM-2024-0821",
  },
];

const DANGER_HOLD_DURATION = 3000;

export function CitizenInterface() {
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [reportCategory, setReportCategory] = useState<ReportCategory>("wellness");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLocation, setReportLocation] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [dangerHoldProgress, setDangerHoldProgress] = useState(0);
  const [isDangerHolding, setIsDangerHolding] = useState(false);
  const [dangerActivated, setDangerActivated] = useState(false);
  const dangerHoldRef = useRef<NodeJS.Timeout | null>(null);
  const dangerStartRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);
  
  const [schoolReportType, setSchoolReportType] = useState<"safety" | "adverse" | "">("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolDescription, setSchoolDescription] = useState("");
  const [schoolStep, setSchoolStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(1);
  const [schoolData, setSchoolData] = useState({
    what: "",
    when: "",
    location: "",
    hasVoiceNote: false,
    schoolType: "",
    whoInvolved: "",
    personCount: "",
    ageGroup: "",
    sourceType: "",
    dangerLevel: "",
    contactMethod: "",
    duration: "",
    relationship: "",
    hasSupport: "",
    urgency: "",
  });
  
  const [checkInCode, setCheckInCode] = useState("");
  const [checkInResult, setCheckInResult] = useState<RecentReport | null>(null);
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<{ code: string; type: string } | null>(null);

  const [blackModePhase, setBlackModePhase] = useState<BlackModePhase>("dark");
  const [blackModeCountdown, setBlackModeCountdown] = useState(30);
  const blackModeTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [triageStep, setTriageStep] = useState<TriageStep>(1);
  const [triageData, setTriageData] = useState<TriageData>({
    whatHappening: "",
    whereLocation: "",
    howReach: "",
    supportType: "",
    policeSubType: "",
  });

  const [reportStep, setReportStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(1);
  const [reportData, setReportData] = useState({
    what: "",
    when: "",
    where: "",
    subcategory: "",
    weaponType: "",
    vehicleType: "",
    sourceType: "",
    onlinePlatform: "",
    onlineLink: "",
    locationType: "",
    isOngoing: "",
    notes: "",
    contactName: "",
    contactPhone: "",
    contactMethod: "",
  });

  const [isEmergencyRecording, setIsEmergencyRecording] = useState(false);
  const [emergencyTranscript, setEmergencyTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [brainV2Consent, setBrainV2Consent] = useState<boolean | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<"unknown" | "high">("unknown");

  type EmergencyStatus = "idle" | "active" | "acknowledged" | "monitoring" | "resolved";
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>("idle");
  const [emergencyId, setEmergencyId] = useState<string | null>(null);
  const [quickTaps, setQuickTaps] = useState<string[]>([]);

  useEffect(() => {
    const storedConsent = localStorage.getItem(BRAIN_CONSENT_KEY);
    if (storedConsent === null) {
      setShowConsentModal(true);
      setBrainV2Consent(null);
    } else {
      setBrainV2Consent(storedConsent === "true");
    }
  }, []);

  const handleConsentEnable = () => {
    localStorage.setItem(BRAIN_CONSENT_KEY, "true");
    setBrainV2Consent(true);
    setShowConsentModal(false);
  };

  const handleConsentDecline = () => {
    localStorage.setItem(BRAIN_CONSENT_KEY, "false");
    setBrainV2Consent(false);
    setShowConsentModal(false);
  };

  const sendEmergencyTranscript = useCallback((text: string) => {
    const payload = {
      type: "transcript",
      message: text,
      timestamp: new Date().toISOString(),
    };

    fetch("/api/emergency/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});

    fetch("/api/emergency/911", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, []);

  const sendEmergencyAudio = useCallback((audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    fetch("/api/emergency/dispatch", {
      method: "POST",
      body: formData,
    }).catch(() => {});

    fetch("/api/emergency/911", {
      method: "POST",
      body: formData,
    }).catch(() => {});
  }, []);

  const startTranscription = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setEmergencyTranscript(transcript);
      sendEmergencyTranscript(transcript);

      const urgency = analyzeUrgencyLevel(transcript);
      if (urgency.detected) {
        setUrgencyLevel(urgency.level);
      }

      const upperTranscript = transcript.toUpperCase();
      if (upperTranscript.includes(UNLOCK_CODE) || upperTranscript.includes(ADMIN_OVERRIDE_CODE)) {
        stopEmergencyMode();
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn("Speech recognition error:", event.error);
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [sendEmergencyTranscript]);

  const initMicStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          sendEmergencyAudio(audioBlob);
          audioChunksRef.current = [];
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      return true;
    } catch (err) {
      console.warn("Microphone access denied:", err);
      return false;
    }
  }, [sendEmergencyAudio]);

  const activateEmergencyMode = useCallback(async () => {
    if (isEmergencyRecording) return;
    setIsEmergencyRecording(true);

    const micReady = await initMicStream();
    if (micReady && mediaRecorderRef.current) {
      mediaRecorderRef.current.start();
      startTranscription();

      recordingIntervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.start();
        }
      }, 15000);
    }
  }, [isEmergencyRecording, initMicStream, startTranscription]);

  const stopEmergencyMode = useCallback(() => {
    setIsEmergencyRecording(false);
    setEmergencyTranscript("");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    audioChunksRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      stopEmergencyMode();
    };
  }, [stopEmergencyMode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeView === "blackMode" && blackModePhase === "dark") {
      setBlackModeCountdown(30);
      blackModeTimerRef.current = setInterval(() => {
        setBlackModeCountdown((prev) => {
          if (prev <= 1) {
            if (blackModeTimerRef.current) {
              clearInterval(blackModeTimerRef.current);
            }
            setBlackModePhase("options");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (blackModeTimerRef.current) {
        clearInterval(blackModeTimerRef.current);
      }
    };
  }, [activeView, blackModePhase]);

  const formatTimeAgo = (date: Date) => {
    const diff = Math.floor((currentTime.getTime() - date.getTime()) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const getStatusConfig = (status: RecentReport["status"]) => {
    const config = {
      pending: { color: "bg-escalating/20 text-escalating border-escalating", label: "Pending Review" },
      assigned: { color: "bg-mrsg-cyan/20 text-mrsg-cyan border-mrsg-cyan", label: "Responder Assigned" },
      monitoring: { color: "bg-stable/20 text-stable border-stable", label: "Being Monitored" },
      resolved: { color: "bg-muted text-muted-foreground border-muted-foreground", label: "Resolved" },
    };
    return config[status];
  };

  const generateReferenceCode = () => {
    const year = new Date().getFullYear();
    const num = Math.floor(Math.random() * 9000) + 1000;
    return `LPM-${year}-${num}`;
  };

  const handleDangerStart = useCallback(() => {
    if (isHoldingRef.current) return;
    
    isHoldingRef.current = true;
    setIsDangerHolding(true);
    dangerStartRef.current = Date.now();
    
    const updateProgress = () => {
      if (!isHoldingRef.current) return;
      
      const elapsed = Date.now() - dangerStartRef.current;
      const progress = Math.min((elapsed / DANGER_HOLD_DURATION) * 100, 100);
      setDangerHoldProgress(progress);
      
      if (progress >= 100) {
        isHoldingRef.current = false;
        setDangerActivated(true);
        setIsDangerHolding(false);
        const code = generateReferenceCode();
        const newEmergencyId = `EMG-${Date.now()}`;
        setEmergencyId(newEmergencyId);
        setEmergencyStatus("active");
        setQuickTaps([]);
        setSubmittedReport({ code, type: "Emergency Alert" });
        setBlackModePhase("dark");
        setActiveView("blackMode");
        if (brainV2Consent === true) {
          activateEmergencyMode();
        }
        fetch("/api/emergency/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emergencyId: newEmergencyId, status: "active", quickTaps: [], role: "citizen" }),
        }).catch(() => {});
      } else {
        dangerHoldRef.current = setTimeout(updateProgress, 50);
      }
    };
    
    dangerHoldRef.current = setTimeout(updateProgress, 50);
  }, [brainV2Consent]);

  const handleDangerEnd = useCallback(() => {
    if (dangerHoldRef.current) {
      clearTimeout(dangerHoldRef.current);
    }
    if (!dangerActivated) {
      isHoldingRef.current = false;
      setIsDangerHolding(false);
      setDangerHoldProgress(0);
    }
  }, [dangerActivated]);

  const handleQuickTap = useCallback((tapId: string) => {
    setQuickTaps(prev => {
      const newTaps = prev.includes(tapId) 
        ? prev.filter(t => t !== tapId) 
        : [...prev, tapId];
      
      if (emergencyId) {
        fetch("/api/emergency/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            emergencyId, 
            status: emergencyStatus, 
            quickTaps: newTaps, 
            role: "citizen" 
          }),
        }).catch(() => {});
      }
      
      return newTaps;
    });
  }, [emergencyId, emergencyStatus]);

  const handleImSafe = useCallback(() => {
    if (!emergencyId) return;
    
    fetch("/api/emergency/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emergencyId, resolvedBy: "citizen" }),
    }).catch(() => {});
    
    setEmergencyStatus("resolved");
    stopEmergencyMode();
    setActiveView("danger");
  }, [emergencyId, stopEmergencyMode]);

  const getDefaultReportData = () => ({
    what: "",
    when: "",
    where: "",
    subcategory: "",
    weaponType: "",
    vehicleType: "",
    sourceType: "",
    onlinePlatform: "",
    onlineLink: "",
    locationType: "",
    isOngoing: "",
    notes: "",
    contactName: "",
    contactPhone: "",
    contactMethod: "",
  });

  const handleReportSubmit = () => {
    const code = generateReferenceCode();
    setSubmittedReport({ code, type: "Anonymous Report" });
    setShowConfirmDialog(true);
    setReportStep(1);
    setReportData(getDefaultReportData());
  };

  const getDefaultSchoolData = () => ({
    what: "",
    when: "",
    location: "",
    hasVoiceNote: false,
    schoolType: "",
    whoInvolved: "",
    personCount: "",
    ageGroup: "",
    sourceType: "",
    dangerLevel: "",
    contactMethod: "",
    duration: "",
    relationship: "",
    hasSupport: "",
    urgency: "",
  });

  const handleSchoolSubmit = () => {
    const code = generateReferenceCode();
    setSubmittedReport({ code, type: schoolReportType === "safety" ? "School Safety Report" : "Adverse Action Report" });
    setShowConfirmDialog(true);
    setSchoolDescription("");
    setSchoolName("");
    setSchoolReportType("");
    setSchoolStep(1);
    setSchoolData(getDefaultSchoolData());
  };

  const handleCheckIn = () => {
    const found = mockRecentReports.find(r => r.referenceCode.toLowerCase() === checkInCode.toLowerCase());
    setCheckInResult(found || null);
  };

  const resetToHome = () => {
    setActiveView("home");
    setDangerActivated(false);
    setDangerHoldProgress(0);
    setShowConfirmDialog(false);
    setSubmittedReport(null);
    isHoldingRef.current = false;
    setIsDangerHolding(false);
    setBlackModePhase("dark");
    setBlackModeCountdown(30);
    setTriageStep(1);
    setTriageData({ whatHappening: "", whereLocation: "", howReach: "", supportType: "", policeSubType: "" });
    setReportStep(1);
    setReportData(getDefaultReportData());
    setSchoolStep(1);
    setSchoolData(getDefaultSchoolData());
    setSchoolReportType("");
    setEmergencyStatus("idle");
    setEmergencyId(null);
    setQuickTaps([]);
    stopEmergencyMode();
    if (blackModeTimerRef.current) {
      clearInterval(blackModeTimerRef.current);
    }
  };

  const handleKeepScreenDark = () => {
    setBlackModePhase("dark");
    setBlackModeCountdown(30);
  };

  const handleStartTriage = () => {
    setActiveView("triage");
    setTriageStep(1);
  };

  const handleTriageSelect = (step: TriageStep, value: string) => {
    if (step === 1) {
      setTriageData((prev) => ({ ...prev, whatHappening: value }));
      setTriageStep(2);
    } else if (step === 2) {
      setTriageData((prev) => ({ ...prev, whereLocation: value }));
      setTriageStep(3);
    } else if (step === 3) {
      setTriageData((prev) => ({ ...prev, howReach: value }));
      setTriageStep(4);
    } else if (step === 4) {
      setTriageData((prev) => ({ ...prev, supportType: value }));
      if (value === "police") {
        setTriageStep(5);
      } else {
        setActiveView("danger");
      }
    } else if (step === 5) {
      setTriageData((prev) => ({ ...prev, policeSubType: value }));
      setActiveView("danger");
    }
  };

  const renderHomeView = () => (
    <div className="flex-1 flex flex-col p-4 gap-4">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold mb-1">How can we help you today?</h2>
        <p className="text-sm text-muted-foreground">
          Your voice matters. All reports are handled with care.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        <Card 
          className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer border-mrsg-cyan/30 hover-elevate"
          onClick={() => setActiveView("report")}
          data-testid="tile-report-anonymously"
        >
          <div className="h-14 w-14 rounded-full bg-mrsg-cyan/10 flex items-center justify-center">
            <EyeOff className="h-7 w-7 text-mrsg-cyan" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold">Report Anonymously</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Share a concern privately
            </p>
          </div>
        </Card>

        <Card 
          className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer border-escalating/30 hover-elevate"
          onClick={() => setActiveView("school")}
          data-testid="tile-school-safety"
        >
          <div className="h-14 w-14 rounded-full bg-escalating/10 flex items-center justify-center">
            <GraduationCap className="h-7 w-7 text-escalating" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold">School Safety</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Report school concerns
            </p>
          </div>
        </Card>

        <Card 
          className={cn(
            "p-4 flex flex-col items-center justify-center gap-3 cursor-pointer border-danger/50 col-span-2",
            "select-none touch-none",
            isDangerHolding && "border-danger"
          )}
          onMouseDown={handleDangerStart}
          onMouseUp={handleDangerEnd}
          onMouseLeave={handleDangerEnd}
          onTouchStart={handleDangerStart}
          onTouchEnd={handleDangerEnd}
          data-testid="tile-danger-now"
        >
          <div className={cn(
            "h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200",
            isDangerHolding ? "bg-danger scale-110" : "bg-danger/10"
          )}>
            <CircleAlert className={cn(
              "h-8 w-8 transition-colors",
              isDangerHolding ? "text-white" : "text-danger"
            )} />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-danger">I Need Help Now</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Hold 3 sec - screen goes dark for safety
            </p>
          </div>
          {isDangerHolding && (
            <div className="w-full mt-2">
              <Progress value={dangerHoldProgress} className="h-2 bg-danger/20" />
              <p className="text-xs text-center text-danger mt-1 font-medium">
                Keep holding... {Math.ceil((100 - dangerHoldProgress) / 33)}s
              </p>
            </div>
          )}
        </Card>

        <Card 
          className="p-4 flex flex-col items-center justify-center gap-3 cursor-pointer border-stable/30 hover-elevate col-span-2"
          onClick={() => setActiveView("checkin")}
          data-testid="tile-check-in"
        >
          <div className="h-14 w-14 rounded-full bg-stable/10 flex items-center justify-center">
            <RefreshCw className="h-7 w-7 text-stable" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold">Check-In / Follow-Up</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Get updates on your report
            </p>
          </div>
        </Card>
      </div>
    </div>
  );

  const needsSubcategory = (what: string) => 
    ["violent", "property", "vehicular", "drugs", "fraud", "trafficking", "gang", "community", "other"].includes(what);
  
  const needsWeaponFollowUp = (what: string, subcategory: string) =>
    (what === "violent" && subcategory === "weapon") ||
    (what === "vehicular" && subcategory === "carjacking");
  
  const needsVehicleFollowUp = (what: string, subcategory: string) =>
    (what === "property" && subcategory === "auto") || 
    (what === "community" && subcategory === "vehicle") ||
    (what === "vehicular" && ["hitrun", "dui", "reckless", "racing", "theft", "pursuit"].includes(subcategory));

  const needsOnlineFields = (sourceType: string) =>
    ["online", "social"].includes(sourceType);

  const getReportTotalSteps = () => {
    let steps = 3;
    if (needsSubcategory(reportData.what)) steps++;
    if (needsWeaponFollowUp(reportData.what, reportData.subcategory)) steps++;
    if (needsVehicleFollowUp(reportData.what, reportData.subcategory)) steps++;
    steps += 3;
    steps++;
    return steps;
  };

  const handleReportChipSelect = (step: typeof reportStep, value: string) => {
    if (step === 1) {
      setReportData((prev) => ({ ...prev, what: value }));
      setReportStep(2);
    } else if (step === 2) {
      setReportData((prev) => ({ ...prev, when: value }));
      setReportStep(3);
    } else if (step === 3) {
      setReportData((prev) => ({ ...prev, where: value }));
      if (needsSubcategory(reportData.what)) {
        setReportStep(4);
      } else {
        setReportStep(6);
      }
    } else if (step === 4) {
      setReportData((prev) => ({ ...prev, subcategory: value }));
      if (needsWeaponFollowUp(reportData.what, value)) {
        setReportStep(5);
      } else if (needsVehicleFollowUp(reportData.what, value)) {
        setReportStep(5);
      } else {
        setReportStep(6);
      }
    } else if (step === 5) {
      if (needsWeaponFollowUp(reportData.what, reportData.subcategory)) {
        setReportData((prev) => ({ ...prev, weaponType: value }));
      } else if (needsVehicleFollowUp(reportData.what, reportData.subcategory)) {
        setReportData((prev) => ({ ...prev, vehicleType: value }));
      }
      setReportStep(6);
    } else if (step === 6) {
      setReportData((prev) => ({ ...prev, sourceType: value }));
      if (needsOnlineFields(value)) {
        setReportStep(7);
      } else {
        setReportStep(8);
      }
    } else if (step === 7) {
      setReportData((prev) => ({ ...prev, onlinePlatform: value }));
      setReportStep(8);
    } else if (step === 8) {
      setReportData((prev) => ({ ...prev, locationType: value }));
      setReportStep(9);
    } else if (step === 9) {
      setReportData((prev) => ({ ...prev, contactMethod: value }));
      handleReportSubmit();
    }
  };

  const getReportStepLabel = () => {
    switch (reportStep) {
      case 1: return "What are you noticing?";
      case 2: return "When did this happen?";
      case 3: return "Where is this?";
      case 4: return "Tell us more";
      case 5: return needsWeaponFollowUp(reportData.what, reportData.subcategory) 
        ? "What type of weapon?" 
        : "What type of vehicle?";
      case 6: return "How do you know this?";
      case 7: return "Which platform?";
      case 8: return "What type of location?";
      case 9: return "Want updates? (Optional)";
      default: return "";
    }
  };

  const getReportStepOptions = () => {
    switch (reportStep) {
      case 1: return REPORT_WHAT_OPTIONS;
      case 2: return REPORT_WHEN_OPTIONS;
      case 3: return REPORT_WHERE_OPTIONS;
      case 4: return REPORT_SUBCATEGORY_OPTIONS[reportData.what] || [];
      case 5: return needsWeaponFollowUp(reportData.what, reportData.subcategory) 
        ? REPORT_WEAPON_OPTIONS 
        : REPORT_VEHICLE_OPTIONS;
      case 6: return REPORT_SOURCE_OPTIONS;
      case 7: return [
        { id: "facebook", label: "Facebook", icon: MessageSquare },
        { id: "twitter", label: "Twitter/X", icon: MessageSquare },
        { id: "instagram", label: "Instagram", icon: MessageSquare },
        { id: "tiktok", label: "TikTok", icon: MessageSquare },
        { id: "nextdoor", label: "Nextdoor", icon: Users },
        { id: "other", label: "Other Platform", icon: HelpCircle },
      ];
      case 8: return REPORT_LOCATION_TYPE_OPTIONS;
      case 9: return REPORT_CONTACT_METHOD_OPTIONS;
      default: return [];
    }
  };

  const handleReportBack = () => {
    if (reportStep === 1) {
      setActiveView("home");
      setReportStep(1);
      setReportData(getDefaultReportData());
    } else if (reportStep === 2) {
      setReportStep(1);
    } else if (reportStep === 3) {
      setReportStep(2);
    } else if (reportStep === 4) {
      setReportStep(3);
    } else if (reportStep === 5) {
      setReportStep(4);
    } else if (reportStep === 6) {
      if (needsWeaponFollowUp(reportData.what, reportData.subcategory) || 
          needsVehicleFollowUp(reportData.what, reportData.subcategory)) {
        setReportStep(5);
      } else if (needsSubcategory(reportData.what)) {
        setReportStep(4);
      } else {
        setReportStep(3);
      }
    } else if (reportStep === 7) {
      setReportStep(6);
    } else if (reportStep === 8) {
      if (needsOnlineFields(reportData.sourceType)) {
        setReportStep(7);
      } else {
        setReportStep(6);
      }
    } else if (reportStep === 9) {
      setReportStep(8);
    }
  };

  const renderReportView = () => {
    const currentOptions = getReportStepOptions();
    const stepLabel = getReportStepLabel();
    const progressSteps = 9;

    return (
      <div className="flex-1 flex flex-col p-4 gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit gap-2 -ml-2"
          onClick={handleReportBack}
          data-testid="button-back-report"
        >
          <ArrowLeft className="h-4 w-4" />
          {reportStep > 1 ? "Previous" : "Back"}
        </Button>

        <div className="mb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-mrsg-cyan" />
            Report Anonymously
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tap to select - no typing required
          </p>
        </div>

        <div className="flex gap-1 mb-2">
          {Array.from({ length: progressSteps }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-colors",
                step < reportStep ? "bg-mrsg-cyan" : step === reportStep ? "bg-mrsg-cyan/50" : "bg-muted"
              )}
            />
          ))}
        </div>

        {reportData.what && reportStep > 1 && (
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="secondary" className="gap-1">
              {REPORT_WHAT_OPTIONS.find(o => o.id === reportData.what)?.label}
            </Badge>
            {reportData.when && reportStep > 2 && (
              <Badge variant="secondary" className="gap-1">
                {REPORT_WHEN_OPTIONS.find(o => o.id === reportData.when)?.label}
              </Badge>
            )}
            {reportData.where && reportStep > 3 && (
              <Badge variant="secondary" className="gap-1">
                {REPORT_WHERE_OPTIONS.find(o => o.id === reportData.where)?.label}
              </Badge>
            )}
            {reportData.subcategory && reportStep > 4 && REPORT_SUBCATEGORY_OPTIONS[reportData.what] && (
              <Badge variant="secondary" className="gap-1">
                {REPORT_SUBCATEGORY_OPTIONS[reportData.what]?.find(o => o.id === reportData.subcategory)?.label}
              </Badge>
            )}
          </div>
        )}

        <div className="space-y-2 flex-1 overflow-y-auto">
          <Label className="text-sm font-medium block text-mrsg-cyan">
            {stepLabel}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {currentOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.id}
                  className="p-3 cursor-pointer border-border/50 hover-elevate flex items-center gap-2"
                  onClick={() => handleReportChipSelect(reportStep, option.id)}
                  data-testid={`chip-report-${reportStep}-${option.id}`}
                >
                  <Icon className="h-4 w-4 text-mrsg-cyan shrink-0" />
                  <span className="text-sm">{option.label}</span>
                </Card>
              );
            })}
          </div>
          
          {reportStep === 9 && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleReportChipSelect(9, "none")}
                data-testid="button-skip-contact"
              >
                Skip - Submit Anonymously
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => {
              setActiveView("home");
              setReportStep(1);
              setReportData(getDefaultReportData());
            }}
            data-testid="button-cancel-report"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  const handleSchoolChipSelect = (step: typeof schoolStep, value: string) => {
    if (schoolReportType === "adverse") {
      if (step === 1) {
        setSchoolData((prev) => ({ ...prev, schoolType: value }));
        setSchoolStep(2);
      } else if (step === 2) {
        setSchoolData((prev) => ({ ...prev, what: value }));
        setSchoolStep(3);
      } else if (step === 3) {
        setSchoolData((prev) => ({ ...prev, duration: value }));
        setSchoolStep(4);
      } else if (step === 4) {
        setSchoolData((prev) => ({ ...prev, relationship: value }));
        setSchoolStep(5);
      } else if (step === 5) {
        setSchoolData((prev) => ({ ...prev, hasSupport: value }));
        setSchoolStep(6);
      } else if (step === 6) {
        setSchoolData((prev) => ({ ...prev, urgency: value }));
        setSchoolStep(7);
      } else if (step === 7) {
        setSchoolData((prev) => ({ ...prev, contactMethod: value }));
        handleSchoolSubmit();
      }
    } else {
      if (step === 1) {
        setSchoolData((prev) => ({ ...prev, schoolType: value }));
        setSchoolStep(2);
      } else if (step === 2) {
        setSchoolData((prev) => ({ ...prev, what: value }));
        setSchoolStep(3);
      } else if (step === 3) {
        setSchoolData((prev) => ({ ...prev, when: value }));
        setSchoolStep(4);
      } else if (step === 4) {
        setSchoolData((prev) => ({ ...prev, location: value }));
        setSchoolStep(5);
      } else if (step === 5) {
        setSchoolData((prev) => ({ ...prev, whoInvolved: value }));
        setSchoolStep(6);
      } else if (step === 6) {
        setSchoolData((prev) => ({ ...prev, personCount: value }));
        setSchoolStep(7);
      } else if (step === 7) {
        setSchoolData((prev) => ({ ...prev, sourceType: value }));
        setSchoolStep(8);
      } else if (step === 8) {
        setSchoolData((prev) => ({ ...prev, dangerLevel: value }));
        setSchoolStep(9);
      } else if (step === 9) {
        setSchoolData((prev) => ({ ...prev, contactMethod: value }));
        handleSchoolSubmit();
      }
    }
  };

  const getSchoolStepLabel = () => {
    if (schoolReportType === "adverse") {
      switch (schoolStep) {
        case 1: return "What type of school?";
        case 2: return "What's the concern?";
        case 3: return "How long has this been happening?";
        case 4: return "Your relationship to the student?";
        case 5: return "Does the person have support?";
        case 6: return "How urgent is this?";
        case 7: return "Want updates? (Optional)";
        default: return "";
      }
    }
    switch (schoolStep) {
      case 1: return "What type of school?";
      case 2: return "What's the concern?";
      case 3: return "When did this happen?";
      case 4: return "Where on campus?";
      case 5: return "Who is involved?";
      case 6: return "How many people?";
      case 7: return "How do you know this?";
      case 8: return "Is there immediate danger?";
      case 9: return "Want updates? (Optional)";
      default: return "";
    }
  };

  const getSchoolStepOptions = () => {
    if (schoolReportType === "adverse") {
      switch (schoolStep) {
        case 1: return SCHOOL_TYPE_OPTIONS;
        case 2: return SCHOOL_ADVERSE_OPTIONS;
        case 3: return ADVERSE_DURATION_OPTIONS;
        case 4: return ADVERSE_RELATIONSHIP_OPTIONS;
        case 5: return ADVERSE_SUPPORT_OPTIONS;
        case 6: return ADVERSE_URGENCY_OPTIONS;
        case 7: return REPORT_CONTACT_METHOD_OPTIONS;
        default: return [];
      }
    }
    switch (schoolStep) {
      case 1: return SCHOOL_TYPE_OPTIONS;
      case 2: return SCHOOL_SAFETY_OPTIONS;
      case 3: return SCHOOL_WHEN_OPTIONS;
      case 4: return null;
      case 5: return SCHOOL_WHO_OPTIONS;
      case 6: return SCHOOL_COUNT_OPTIONS;
      case 7: return SCHOOL_SOURCE_OPTIONS;
      case 8: return SCHOOL_DANGER_OPTIONS;
      case 9: return REPORT_CONTACT_METHOD_OPTIONS;
      default: return [];
    }
  };

  const handleSchoolBack = () => {
    if (schoolStep === 1) {
      if (schoolReportType) {
        setSchoolReportType("");
      } else {
        setActiveView("home");
      }
    } else {
      setSchoolStep((prev) => (prev - 1) as typeof schoolStep);
    }
  };

  const renderSchoolView = () => {
    const currentOptions = getSchoolStepOptions();
    const stepLabel = getSchoolStepLabel();
    const progressSteps = schoolReportType === "adverse" ? 7 : 9;

    return (
      <div className="flex-1 flex flex-col p-4 gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit gap-2 -ml-2"
          onClick={handleSchoolBack}
          data-testid="button-back-school"
        >
          <ArrowLeft className="h-4 w-4" />
          {schoolStep > 1 ? "Previous" : schoolReportType ? "Change Type" : "Back"}
        </Button>

        <div className="mb-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-escalating" />
            {schoolReportType === "adverse" ? "Adverse Action Report" : "School Safety Report"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tap to select - no typing required
          </p>
        </div>

        {!schoolReportType ? (
          <div className="space-y-3 flex-1">
            <Card 
              className="p-4 cursor-pointer border-danger/30 hover-elevate"
              onClick={() => setSchoolReportType("safety")}
              data-testid="button-school-safety-type"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
                  <Shield className="h-6 w-6 text-danger" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Safety Concern</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Report a threat, bullying, or unsafe situation
                  </p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-4 cursor-pointer border-escalating/30 hover-elevate"
              onClick={() => setSchoolReportType("adverse")}
              data-testid="button-school-adverse-type"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-escalating/10 flex items-center justify-center shrink-0">
                  <HandHeart className="h-6 w-6 text-escalating" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Adverse Action Report</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Student who may need support
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            <div className="flex gap-1 mb-2">
              {Array.from({ length: progressSteps }, (_, i) => i + 1).map((step) => (
                <div
                  key={step}
                  className={cn(
                    "flex-1 h-1.5 rounded-full transition-colors",
                    step < schoolStep ? "bg-escalating" : step === schoolStep ? "bg-escalating/50" : "bg-muted"
                  )}
                />
              ))}
            </div>

            {schoolData.schoolType && schoolStep > 1 && (
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary" className="gap-1">
                  {SCHOOL_TYPE_OPTIONS.find(o => o.id === schoolData.schoolType)?.label}
                </Badge>
                {schoolData.what && schoolStep > 2 && (
                  <Badge variant="secondary" className="gap-1">
                    {(schoolReportType === "safety" ? SCHOOL_SAFETY_OPTIONS : SCHOOL_ADVERSE_OPTIONS).find(o => o.id === schoolData.what)?.label}
                  </Badge>
                )}
                {schoolReportType === "adverse" && schoolData.duration && schoolStep > 3 && (
                  <Badge variant="secondary" className="gap-1">
                    {ADVERSE_DURATION_OPTIONS.find(o => o.id === schoolData.duration)?.label}
                  </Badge>
                )}
                {schoolReportType === "safety" && schoolData.when && schoolStep > 3 && (
                  <Badge variant="secondary" className="gap-1">
                    {SCHOOL_WHEN_OPTIONS.find(o => o.id === schoolData.when)?.label}
                  </Badge>
                )}
              </div>
            )}

            <div className="space-y-2 flex-1 overflow-y-auto">
              <Label className="text-sm font-medium block text-escalating">
                {stepLabel}
              </Label>
              
              {schoolStep === 4 && schoolReportType === "safety" ? (
                <div className="space-y-3">
                  <Select onValueChange={(value) => handleSchoolChipSelect(4, value)}>
                    <SelectTrigger className="w-full" data-testid="select-campus-location">
                      <SelectValue placeholder="Select campus location" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMPUS_LOCATION_OPTIONS.map((option) => (
                        <SelectItem key={option.id} value={option.id} data-testid={`option-location-${option.id}`}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Card 
                    className={cn(
                      "p-3 cursor-pointer border-border/50 hover-elevate flex items-center gap-3",
                      schoolData.hasVoiceNote && "border-escalating bg-escalating/10"
                    )}
                    onClick={() => setSchoolData((prev) => ({ ...prev, hasVoiceNote: !prev.hasVoiceNote }))}
                    data-testid="button-voice-note"
                  >
                    <MessageCircle className={cn("h-5 w-5", schoolData.hasVoiceNote ? "text-escalating" : "text-muted-foreground")} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Add Voice Note</p>
                      <p className="text-xs text-muted-foreground">Optional - tap to toggle</p>
                    </div>
                    {schoolData.hasVoiceNote && (
                      <Badge variant="secondary" className="text-xs">Ready</Badge>
                    )}
                  </Card>
                </div>
              ) : currentOptions ? (
                <div className="grid grid-cols-2 gap-2">
                  {currentOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Card
                        key={option.id}
                        className="p-3 cursor-pointer border-border/50 hover-elevate flex items-center gap-2"
                        onClick={() => handleSchoolChipSelect(schoolStep, option.id)}
                        data-testid={`chip-school-${schoolStep}-${option.id}`}
                      >
                        <Icon className="h-4 w-4 text-escalating shrink-0" />
                        <span className="text-sm">{option.label}</span>
                      </Card>
                    );
                  })}
                </div>
              ) : null}

              {((schoolReportType === "adverse" && schoolStep === 7) || (schoolReportType === "safety" && schoolStep === 9)) && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleSchoolChipSelect(schoolStep, "none")}
                    data-testid="button-skip-school-contact"
                  >
                    Skip - Submit Anonymously
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => {
                  setActiveView("home");
                  setSchoolStep(1);
                  setSchoolData(getDefaultSchoolData());
                  setSchoolReportType("");
                }}
                data-testid="button-cancel-school"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBlackModeView = () => (
    <div 
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
      data-testid="black-mode-screen"
    >
      {isEmergencyRecording && (
        <div className="absolute top-4 right-4 flex items-center gap-2" data-testid="recording-indicator">
          <div className="h-3 w-3 rounded-full bg-danger animate-pulse" />
          <Mic className="h-4 w-4 text-danger" />
        </div>
      )}
      {blackModePhase === "dark" ? (
        <div className="text-center" data-testid="black-mode-dark">
          <p className="text-white/30 text-sm mb-4">Screen will stay dark for safety</p>
          <p className="text-white/50 text-2xl font-mono">{blackModeCountdown}s</p>
          {isEmergencyRecording && (
            <p className="text-danger/60 text-xs mt-4">Recording active</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 p-6 w-full max-w-md" data-testid="black-mode-options">
          <div className="text-center mb-2">
            <Moon className="h-10 w-10 text-white/50 mx-auto mb-3" />
            <p className="text-white/70 text-sm">Alert sent. Help is on the way.</p>
            {isEmergencyRecording && (
              <p className="text-danger/60 text-xs mt-2">Recording and sending to dispatch</p>
            )}
          </div>

          <div className="w-full space-y-2" data-testid="quick-taps-section">
            <p className="text-white/40 text-xs uppercase tracking-wide text-center mb-2">Quick Taps</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_TAP_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = quickTaps.includes(option.id);
                return (
                  <Button
                    key={option.id}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "gap-2 border-white/30 text-white",
                      isSelected && "bg-danger/30 border-danger text-danger"
                    )}
                    onClick={() => handleQuickTap(option.id)}
                    data-testid={`button-quicktap-${option.id}`}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="w-full border-t border-white/10 pt-4 mt-2 space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 bg-transparent border-white/30 text-white"
              onClick={handleKeepScreenDark}
              data-testid="button-keep-dark"
            >
              <Moon className="h-5 w-5 mr-2" />
              Keep Screen Dark
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 bg-transparent border-white/30 text-white"
              onClick={handleStartTriage}
              data-testid="button-quick-taps"
            >
              <Hand className="h-5 w-5 mr-2" />
              3 Quick Taps to Help
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 bg-stable/20 border-stable text-stable"
              onClick={handleImSafe}
              data-testid="button-im-safe"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              I'm Safe / End Alert
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-white/40 mt-2"
            onClick={() => setActiveView("danger")}
            data-testid="button-skip-to-details"
          >
            Skip to Details
          </Button>
        </div>
      )}
    </div>
  );

  const renderTriageView = () => {
    const totalSteps = triageData.supportType === "police" || triageStep === 5 ? 5 : 4;
    
    const getCurrentOptions = () => {
      switch (triageStep) {
        case 1:
          return { title: "What's happening?", options: WHAT_HAPPENING_OPTIONS, field: "whatHappening" as const };
        case 2:
          return { title: "Where are you?", options: WHERE_OPTIONS, field: "whereLocation" as const };
        case 3:
          return { title: "How should help reach you?", options: HOW_REACH_OPTIONS, field: "howReach" as const };
        case 4:
          return { title: "What type of support?", options: SUPPORT_TYPE_OPTIONS, field: "supportType" as const };
        case 5:
          return { title: "What kind of police response?", options: POLICE_SUB_OPTIONS, field: "policeSubType" as const };
        default:
          return { title: "What's happening?", options: WHAT_HAPPENING_OPTIONS, field: "whatHappening" as const };
      }
    };

    const current = getCurrentOptions();

    return (
      <div 
        className="fixed inset-0 bg-black flex flex-col z-50"
        data-testid="triage-screen"
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/50 text-xs uppercase tracking-wide">Emergency Triage</span>
            <span className="text-white/50 text-xs">Step {triageStep} of {totalSteps}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div
                key={step}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  step <= triageStep ? "bg-danger" : "bg-white/20"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold text-white text-center mb-6" data-testid="triage-title">
            {current.title}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {current.options.map((option) => {
              const Icon = option.icon;
              const isSelected = triageData[current.field] === option.id;
              
              return (
                <Card
                  key={option.id}
                  className={cn(
                    "p-4 cursor-pointer border-white/20 bg-white/5 hover:bg-white/10 transition-colors",
                    isSelected && "border-danger bg-danger/20"
                  )}
                  onClick={() => handleTriageSelect(triageStep, option.id)}
                  data-testid={`chip-${option.id}`}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Icon className={cn(
                      "h-6 w-6",
                      isSelected ? "text-danger" : "text-white/70"
                    )} />
                    <span className={cn(
                      "text-sm",
                      isSelected ? "text-danger" : "text-white/90"
                    )}>
                      {option.label}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full text-white/50"
            onClick={() => triageStep === 1 ? setActiveView("blackMode") : setTriageStep((triageStep - 1) as TriageStep)}
            data-testid="button-triage-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {triageStep === 1 ? "Back to Options" : "Previous Step"}
          </Button>
        </div>
      </div>
    );
  };

  const renderDangerView = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6 overflow-y-auto">
      <EmergencyCallout className="w-full max-w-sm" />
      <div className={cn(
        "h-24 w-24 rounded-full flex items-center justify-center",
        emergencyStatus === "resolved" ? "bg-stable" : "bg-danger animate-pulse"
      )}>
        {emergencyStatus === "resolved" ? (
          <CheckCircle className="h-12 w-12 text-white" />
        ) : (
          <CircleAlert className="h-12 w-12 text-white" />
        )}
      </div>
      <div className="text-center">
        <h2 className={cn("text-xl font-bold mb-2", emergencyStatus === "resolved" ? "text-stable" : "text-danger")}>
          {emergencyStatus === "resolved" ? "Alert Ended" : "Alert Sent"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {emergencyStatus === "resolved" 
            ? "You marked yourself as safe. We're glad you're okay."
            : "Help is being coordinated. Stay calm if you can."}
        </p>
        {emergencyStatus !== "idle" && emergencyStatus !== "resolved" && (
          <Badge variant="outline" className="mt-2 text-xs">
            Status: {emergencyStatus.toUpperCase()}
          </Badge>
        )}
      </div>

      {quickTaps.length > 0 && (
        <Card className="p-3 border-danger/30 bg-danger/5 w-full max-w-sm" data-testid="quick-taps-summary">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Alerts Sent</p>
          <div className="flex flex-wrap gap-2">
            {quickTaps.map(tapId => {
              const option = QUICK_TAP_OPTIONS.find(o => o.id === tapId);
              if (!option) return null;
              const Icon = option.icon;
              return (
                <Badge key={tapId} variant="outline" className="gap-1 text-danger border-danger">
                  <Icon className="h-3 w-3" />
                  {option.label}
                </Badge>
              );
            })}
          </div>
        </Card>
      )}

      {(triageData.whatHappening || triageData.whereLocation || triageData.howReach || triageData.supportType) && (
        <Card className="p-4 border-mrsg-cyan/30 bg-mrsg-cyan/5 w-full max-w-sm" data-testid="triage-summary">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Triage Info Sent</p>
          <div className="space-y-1 text-sm">
            {triageData.whatHappening && (
              <p><span className="text-muted-foreground">What: </span>{WHAT_HAPPENING_OPTIONS.find(o => o.id === triageData.whatHappening)?.label}</p>
            )}
            {triageData.whereLocation && (
              <p><span className="text-muted-foreground">Where: </span>{WHERE_OPTIONS.find(o => o.id === triageData.whereLocation)?.label}</p>
            )}
            {triageData.howReach && (
              <p><span className="text-muted-foreground">Contact: </span>{HOW_REACH_OPTIONS.find(o => o.id === triageData.howReach)?.label}</p>
            )}
            {triageData.supportType && (
              <p><span className="text-muted-foreground">Support: </span>{SUPPORT_TYPE_OPTIONS.find(o => o.id === triageData.supportType)?.label}</p>
            )}
            {triageData.policeSubType && (
              <p><span className="text-muted-foreground">Police Type: </span>{POLICE_SUB_OPTIONS.find(o => o.id === triageData.policeSubType)?.label}</p>
            )}
          </div>
        </Card>
      )}
      
      <Card className="p-4 border-stable/30 bg-stable/5 w-full max-w-sm" data-testid="guidance-card">
        <div className="flex items-start gap-3">
          <Heart className="h-5 w-5 text-stable shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-stable">You are not alone</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-stable">1.</span>
                <span>If safe, stay where you are. Help is on the way.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stable">2.</span>
                <span>Take slow, deep breaths. This helps your body stay calm.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stable">3.</span>
                <span>Look around for exits or safe spaces nearby.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stable">4.</span>
                <span>If you can, silence your phone but keep it with you.</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-danger/30 w-full max-w-sm">
        <p className="text-sm text-center text-muted-foreground mb-2">
          Your reference code:
        </p>
        <p className="text-lg font-mono font-bold text-center text-danger" data-testid="text-reference-code">
          {submittedReport?.code}
        </p>
      </Card>

      <div className="flex flex-col gap-2 w-full max-w-sm">
        {emergencyStatus !== "idle" && emergencyStatus !== "resolved" && (
          <Button 
            className="w-full bg-stable gap-2"
            onClick={handleImSafe}
            data-testid="button-im-safe-danger"
          >
            <CheckCircle className="h-4 w-4" />
            I'm Safe / End Alert
          </Button>
        )}
        <Button variant="outline" onClick={resetToHome} data-testid="button-return-home">
          Return to Home
        </Button>
      </div>
    </div>
  );

  const renderCheckInView = () => (
    <div className="flex-1 flex flex-col p-4 gap-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-fit gap-2 -ml-2"
        onClick={() => {
          setActiveView("home");
          setCheckInCode("");
          setCheckInResult(null);
        }}
        data-testid="button-back-checkin"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="mb-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-stable" />
          Check-In / Follow-Up
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your reference code to see updates on your report.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Reference Code</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., LPM-2024-0847"
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value.toUpperCase())}
              className="font-mono"
              data-testid="input-checkin-code"
            />
            <Button onClick={handleCheckIn} data-testid="button-lookup-report">
              Look Up
            </Button>
          </div>
        </div>

        {checkInResult && (
          <Card className="p-4 border-stable/30">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-stable/10 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 text-stable" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-sm font-semibold">{checkInResult.referenceCode}</span>
                  <Badge variant="outline" className={cn("text-[10px] shrink-0", getStatusConfig(checkInResult.status).color)}>
                    {getStatusConfig(checkInResult.status).label}
                  </Badge>
                </div>
                <p className="text-sm text-foreground mb-2">{checkInResult.summary}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted {formatTimeAgo(checkInResult.timestamp)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {checkInCode && !checkInResult && (
          <Card className="p-4 border-muted">
            <div className="text-center py-4">
              <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No report found with that code. Please check and try again.
              </p>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-auto pt-4">
        <Card className="p-3 border-mrsg-cyan/20 bg-mrsg-cyan/5">
          <p className="text-xs text-muted-foreground">
            Lost your reference code? Contact our support line for assistance.
          </p>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="citizen-interface">
      <header className="h-14 border-b border-mrsg-cyan/20 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <User className="h-5 w-5 text-mrsg-cyan" />
              <span className="text-base font-semibold tracking-tight text-foreground">LPM V2</span>
            </div>
          </Link>
          <div className="h-4 w-px bg-mrsg-cyan/30" />
          <span className="text-xs font-semibold uppercase tracking-wider text-mrsg-cyan">
            Citizen Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1 text-xs">
            <Lock className="h-3 w-3" />
            Secure
          </Badge>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {activeView === "home" && renderHomeView()}
        {activeView === "report" && renderReportView()}
        {activeView === "school" && renderSchoolView()}
        {activeView === "danger" && renderDangerView()}
        {activeView === "checkin" && renderCheckInView()}
      </div>

      {activeView === "blackMode" && renderBlackModeView()}
      {activeView === "triage" && renderTriageView()}

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-stable" />
              Report Submitted
            </DialogTitle>
            <DialogDescription>
              Thank you for speaking up. Your report has been received.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Card className="p-4 border-stable/30 bg-stable/5">
              <p className="text-sm text-muted-foreground mb-1">Your reference code:</p>
              <p className="text-xl font-mono font-bold text-foreground">
                {submittedReport?.code}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Save this code to check on your report status later.
              </p>
            </Card>
          </div>
          <DialogFooter>
            <Button onClick={resetToHome} className="w-full" data-testid="button-dialog-close">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConsentModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg bg-background border-mrsg-cyan/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-mrsg-cyan" />
              Emergency Consent for Brain v2
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              By enabling Brain v2, you allow audio and location use ONLY during life-threatening emergencies.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-stable mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">Only triggered if YOU press and hold the danger button</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-stable mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">Stops with your unlock code (&quot;{UNLOCK_CODE}&quot;)</p>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-escalating mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">Brain v2 NEVER records without your control</p>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleConsentDecline}
              variant="outline"
              className="w-full sm:w-auto"
              data-testid="button-consent-decline"
            >
              No, Opt Out
            </Button>
            <Button
              onClick={handleConsentEnable}
              className="w-full sm:w-auto bg-mrsg-cyan/20 border border-mrsg-cyan/60 text-mrsg-cyan"
              data-testid="button-consent-enable"
            >
              Yes, Enable Brain v2
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
