// ─────────────────────────────────────────────
// LifeLane – Mock Data & Types
// ─────────────────────────────────────────────

export type SignalState = "NORMAL" | "PREPARING" | "ACTIVE GREEN" | "COMPLETED" | "MANUAL OVERRIDE" | "OFFLINE";
export type Priority = "P1" | "P2" | "P3";
export type AmbulanceStatus = "Emergency active" | "En route" | "Preparing route" | "Monitoring" | "Completed" | "Available" | "Offline";
export type HospitalStatus = "Acknowledged" | "Standby" | "Preparing" | "Ready";
export type NavSection =
  | "Command Center"
  | "Live Operations"
  | "Ambulances"
  | "Traffic Signals"
  | "Green Corridors"
  | "Hospitals"
  | "Analytics"
  | "Settings";

// ─── Junction (corridor control) ─────────────
export interface Junction {
  id: string;
  label: string;
  state: SignalState;
  etaSeconds: number;
  greenDuration: number;
  greenElapsed: number;
  distance: string;
}

// ─── Signal (full mesh) ───────────────────────
export interface SignalNode {
  id: string;
  name: string;
  zone: string;
  state: SignalState;
  /** seconds until next state change */
  countdown: number;
  greenDuration: number;
  redDuration: number;
  lastChanged: string;
  /** ambulance ID if in priority mode */
  priorityFor: string | null;
  lat: number;
  lng: number;
}

// ─── Ambulance ────────────────────────────────
export interface Ambulance {
  id: string;
  priority: Priority;
  destination: string;
  destinationShort: string;
  initialEta: number;
  currentEta: number;
  speed: number;
  distance: number;
  status: AmbulanceStatus;
  tone: "coral" | "amber" | "cyan" | "muted";
  route: { x1: number; y1: number; x2: number; y2: number };
  patientCondition: string;
  crew: string;
  gpsLocked: boolean;
  lastSync: string;
  vehicleNumber: string;
  zone: string;
  dispatchedAt: string;
}

// ─── Corridor Operation ───────────────────────
export interface CorridorOp {
  id: string;
  ambulanceId: string;
  priority: Priority;
  origin: string;
  destination: string;
  route: string;
  totalSignals: number;
  clearedSignals: number;
  status: "Active" | "Completed" | "Pending";
  etaSeconds: number;
  timeSavedSeconds: number;
  startedAt: string;
  completedAt: string | null;
  junctionIds: string[];
}

// ─── Hospital ─────────────────────────────────
export interface Hospital {
  id: string;
  name: string;
  shortName: string;
  bay: string;
  status: HospitalStatus;
  etaThreshold: number;
  emergencyTeamNotified: boolean;
  notifiedAt: string;
  availableBeds: number;
  totalEmergencyBeds: number;
  traumaLevel: string;
  specialties: string[];
  address: string;
  contactNumber: string;
}

// ─── Notification ─────────────────────────────
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "critical";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

// ─── Analytics ────────────────────────────────
export interface AnalyticsTrend {
  label: string;
  avgResponseTime: number; // minutes
  timeSaved: number;       // minutes
  trips: number;
  signalsPrioritized: number;
}

// ═══════════════════════════════════════════════
// INITIAL DATA
// ═══════════════════════════════════════════════

// ─── Active fleet (4 live + 8 standby) ───────
export const INITIAL_AMBULANCES: Ambulance[] = [
  {
    id: "AMB-102", priority: "P1",
    destination: "City General Hospital", destinationShort: "City General",
    initialEta: 272, currentEta: 272, speed: 48, distance: 2.4,
    status: "Emergency active", tone: "coral",
    route: { x1: 88, y1: 335, x2: 640, y2: 272 },
    patientCondition: "Cardiac arrest", crew: "Paramedic A. Roy, EMT S. Patel",
    gpsLocked: true, lastSync: "14:32:08",
    vehicleNumber: "MH-12-AB-1234", zone: "Central", dispatchedAt: "14:28:00",
  },
  {
    id: "AMB-087", priority: "P2",
    destination: "St. Mary's Trauma Center", destinationShort: "St. Mary's",
    initialEta: 495, currentEta: 495, speed: 39, distance: 5.1,
    status: "En route", tone: "amber",
    route: { x1: 50, y1: 80, x2: 700, y2: 90 },
    patientCondition: "Multiple fractures", crew: "Paramedic D. Kumar, EMT R. Singh",
    gpsLocked: true, lastSync: "14:31:44",
    vehicleNumber: "MH-12-CD-5678", zone: "North", dispatchedAt: "14:22:00",
  },
  {
    id: "AMB-114", priority: "P2",
    destination: "Metropolitan Medical", destinationShort: "Metropolitan",
    initialEta: 768, currentEta: 768, speed: 34, distance: 7.3,
    status: "Preparing route", tone: "amber",
    route: { x1: 250, y1: -10, x2: 470, y2: 450 },
    patientCondition: "Stroke (suspected)", crew: "Paramedic M. Nair, EMT P. Verma",
    gpsLocked: false, lastSync: "14:30:12",
    vehicleNumber: "MH-12-EF-9012", zone: "West", dispatchedAt: "14:18:00",
  },
  {
    id: "AMB-061", priority: "P3",
    destination: "Eastside Community Hospital", destinationShort: "Eastside",
    initialEta: 1100, currentEta: 1100, speed: 28, distance: 9.8,
    status: "Monitoring", tone: "cyan",
    route: { x1: 610, y1: -10, x2: 190, y2: 302 },
    patientCondition: "Respiratory distress", crew: "Paramedic K. Joshi, EMT A. Mehta",
    gpsLocked: true, lastSync: "14:29:55",
    vehicleNumber: "MH-12-GH-3456", zone: "East", dispatchedAt: "14:10:00",
  },
  // Standby / available units
  {
    id: "AMB-031", priority: "P3", destination: "—", destinationShort: "—",
    initialEta: 0, currentEta: 0, speed: 0, distance: 0,
    status: "Available", tone: "muted",
    route: { x1: 0, y1: 0, x2: 0, y2: 0 },
    patientCondition: "—", crew: "Paramedic S. Rao, EMT V. Kumar",
    gpsLocked: true, lastSync: "14:32:00",
    vehicleNumber: "MH-12-IJ-7890", zone: "Central", dispatchedAt: "—",
  },
  {
    id: "AMB-055", priority: "P3", destination: "—", destinationShort: "—",
    initialEta: 0, currentEta: 0, speed: 0, distance: 0,
    status: "Available", tone: "muted",
    route: { x1: 0, y1: 0, x2: 0, y2: 0 },
    patientCondition: "—", crew: "Paramedic T. Iyer, EMT B. Sharma",
    gpsLocked: true, lastSync: "14:31:00",
    vehicleNumber: "MH-12-KL-2345", zone: "South", dispatchedAt: "—",
  },
  {
    id: "AMB-073", priority: "P3", destination: "—", destinationShort: "—",
    initialEta: 0, currentEta: 0, speed: 0, distance: 0,
    status: "Available", tone: "muted",
    route: { x1: 0, y1: 0, x2: 0, y2: 0 },
    patientCondition: "—", crew: "Paramedic N. Pillai, EMT C. Gupta",
    gpsLocked: false, lastSync: "14:15:00",
    vehicleNumber: "MH-12-MN-6789", zone: "North", dispatchedAt: "—",
  },
  {
    id: "AMB-098", priority: "P3", destination: "—", destinationShort: "—",
    initialEta: 0, currentEta: 0, speed: 0, distance: 0,
    status: "Offline", tone: "muted",
    route: { x1: 0, y1: 0, x2: 0, y2: 0 },
    patientCondition: "—", crew: "—",
    gpsLocked: false, lastSync: "12:44:00",
    vehicleNumber: "MH-12-OP-0123", zone: "West", dispatchedAt: "—",
  },
];

// ─── Junctions (for selected ambulance corridor) ─
export const INITIAL_JUNCTIONS: Junction[] = [
  { id: "01", label: "Junction 01", state: "ACTIVE GREEN", etaSeconds: 31,  greenDuration: 45, greenElapsed: 0, distance: "420 m" },
  { id: "02", label: "Junction 02", state: "PREPARING",    etaSeconds: 78,  greenDuration: 40, greenElapsed: 0, distance: "1.1 km" },
  { id: "03", label: "Junction 03", state: "NORMAL",       etaSeconds: 166, greenDuration: 40, greenElapsed: 0, distance: "1.8 km" },
  { id: "04", label: "Junction 04", state: "NORMAL",       etaSeconds: 260, greenDuration: 35, greenElapsed: 0, distance: "2.6 km" },
];

// ─── Full signal mesh (12 nodes) ──────────────
export const INITIAL_SIGNALS: SignalNode[] = [
  { id: "SIG-J01", name: "Junction 01 – MG Road",       zone: "Central", state: "ACTIVE GREEN",    countdown: 31,  greenDuration: 45, redDuration: 60, lastChanged: "14:32:01", priorityFor: "AMB-102", lat: 18.5200, lng: 73.8553 },
  { id: "SIG-J02", name: "Junction 02 – FC Road",        zone: "Central", state: "PREPARING",       countdown: 48,  greenDuration: 40, redDuration: 55, lastChanged: "14:31:45", priorityFor: "AMB-102", lat: 18.5218, lng: 73.8499 },
  { id: "SIG-J03", name: "Junction 03 – Deccan Gymkhana",zone: "Central", state: "NORMAL",          countdown: 136, greenDuration: 40, redDuration: 50, lastChanged: "14:30:22", priorityFor: null,      lat: 18.5155, lng: 73.8421 },
  { id: "SIG-J04", name: "Junction 04 – Shivaji Nagar",  zone: "North",   state: "NORMAL",          countdown: 230, greenDuration: 35, redDuration: 50, lastChanged: "14:29:55", priorityFor: null,      lat: 18.5308, lng: 73.8474 },
  { id: "SIG-J05", name: "Junction 05 – Kothrud Cross",  zone: "West",    state: "PREPARING",       countdown: 60,  greenDuration: 38, redDuration: 52, lastChanged: "14:31:10", priorityFor: "AMB-114", lat: 18.5074, lng: 73.8082 },
  { id: "SIG-J06", name: "Junction 06 – Karve Rd",       zone: "West",    state: "NORMAL",          countdown: 180, greenDuration: 42, redDuration: 58, lastChanged: "14:28:00", priorityFor: null,      lat: 18.5002, lng: 73.8201 },
  { id: "SIG-J07", name: "Junction 07 – Nagar Road",     zone: "East",    state: "NORMAL",          countdown: 95,  greenDuration: 36, redDuration: 48, lastChanged: "14:27:30", priorityFor: null,      lat: 18.5479, lng: 73.9012 },
  { id: "SIG-J08", name: "Junction 08 – Hadapsar",       zone: "East",    state: "NORMAL",          countdown: 72,  greenDuration: 33, redDuration: 45, lastChanged: "14:26:15", priorityFor: null,      lat: 18.5018, lng: 73.9246 },
  { id: "SIG-J09", name: "Junction 09 – Swargate",       zone: "South",   state: "NORMAL",          countdown: 110, greenDuration: 40, redDuration: 55, lastChanged: "14:30:00", priorityFor: null,      lat: 18.4973, lng: 73.8627 },
  { id: "SIG-J10", name: "Junction 10 – Paud Road",      zone: "West",    state: "MANUAL OVERRIDE", countdown: 0,   greenDuration: 40, redDuration: 55, lastChanged: "14:29:00", priorityFor: null,      lat: 18.5110, lng: 73.8000 },
  { id: "SIG-J11", name: "Junction 11 – Baner Road",     zone: "North",   state: "ACTIVE GREEN",    countdown: 22,  greenDuration: 38, redDuration: 50, lastChanged: "14:32:05", priorityFor: "AMB-087", lat: 18.5590, lng: 73.8020 },
  { id: "SIG-J12", name: "Junction 12 – Viman Nagar",    zone: "East",    state: "OFFLINE",         countdown: 0,   greenDuration: 0,  redDuration: 0,  lastChanged: "11:20:00", priorityFor: null,      lat: 18.5635, lng: 73.9145 },
];

// ─── Corridor operations ──────────────────────
export const INITIAL_CORRIDORS: CorridorOp[] = [
  {
    id: "COR-001", ambulanceId: "AMB-102", priority: "P1",
    origin: "Koregaon Park", destination: "City General Hospital",
    route: "Koregaon Park → MG Road → FC Road → Deccan → City General",
    totalSignals: 4, clearedSignals: 1, status: "Active",
    etaSeconds: 272, timeSavedSeconds: 384,
    startedAt: "14:28:00", completedAt: null,
    junctionIds: ["SIG-J01", "SIG-J02", "SIG-J03", "SIG-J04"],
  },
  {
    id: "COR-002", ambulanceId: "AMB-087", priority: "P2",
    origin: "Baner", destination: "St. Mary's Trauma Center",
    route: "Baner → Baner Road → Sus Road → St. Mary's",
    totalSignals: 3, clearedSignals: 1, status: "Active",
    etaSeconds: 495, timeSavedSeconds: 210,
    startedAt: "14:22:00", completedAt: null,
    junctionIds: ["SIG-J11", "SIG-J04", "SIG-J06"],
  },
  {
    id: "COR-003", ambulanceId: "AMB-114", priority: "P2",
    origin: "Wakad", destination: "Metropolitan Medical",
    route: "Wakad → Paud Road → Kothrud → Metropolitan",
    totalSignals: 3, clearedSignals: 0, status: "Active",
    etaSeconds: 768, timeSavedSeconds: 150,
    startedAt: "14:18:00", completedAt: null,
    junctionIds: ["SIG-J05", "SIG-J06", "SIG-J09"],
  },
  {
    id: "COR-004", ambulanceId: "AMB-045", priority: "P1",
    origin: "Magarpatta", destination: "City General Hospital",
    route: "Magarpatta → Hadapsar → Swargate → City General",
    totalSignals: 4, clearedSignals: 4, status: "Completed",
    etaSeconds: 0, timeSavedSeconds: 462,
    startedAt: "13:55:00", completedAt: "14:21:00",
    junctionIds: ["SIG-J08", "SIG-J09", "SIG-J03", "SIG-J01"],
  },
  {
    id: "COR-005", ambulanceId: "AMB-032", priority: "P2",
    origin: "Aundh", destination: "St. Mary's Trauma Center",
    route: "Aundh → DP Road → Shivaji Nagar → St. Mary's",
    totalSignals: 3, clearedSignals: 3, status: "Completed",
    etaSeconds: 0, timeSavedSeconds: 198,
    startedAt: "13:40:00", completedAt: "14:02:00",
    junctionIds: ["SIG-J04", "SIG-J02", "SIG-J03"],
  },
];

// ─── Hospitals ────────────────────────────────
export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: "h1", name: "City General Hospital", shortName: "City General",
    bay: "BAY 04", status: "Acknowledged", etaThreshold: 180,
    emergencyTeamNotified: true, notifiedAt: "14:29",
    availableBeds: 3, totalEmergencyBeds: 8,
    traumaLevel: "Level I",
    specialties: ["Cardiac", "Trauma", "Neurology", "Burns"],
    address: "1 Hospital Road, Central, Pune",
    contactNumber: "+91-20-2612-3456",
  },
  {
    id: "h2", name: "St. Mary's Trauma Center", shortName: "St. Mary's",
    bay: "BAY 02", status: "Standby", etaThreshold: 300,
    emergencyTeamNotified: false, notifiedAt: "",
    availableBeds: 5, totalEmergencyBeds: 10,
    traumaLevel: "Level II",
    specialties: ["Trauma", "Orthopaedics", "General Surgery"],
    address: "42 North Avenue, Baner, Pune",
    contactNumber: "+91-20-2744-5678",
  },
  {
    id: "h3", name: "Metropolitan Medical", shortName: "Metropolitan",
    bay: "BAY 07", status: "Standby", etaThreshold: 300,
    emergencyTeamNotified: false, notifiedAt: "",
    availableBeds: 2, totalEmergencyBeds: 6,
    traumaLevel: "Level II",
    specialties: ["Neurology", "Stroke Unit", "Cardiac"],
    address: "17 West Ring Road, Kothrud, Pune",
    contactNumber: "+91-20-2543-9012",
  },
  {
    id: "h4", name: "Eastside Community Hospital", shortName: "Eastside",
    bay: "BAY 01", status: "Standby", etaThreshold: 600,
    emergencyTeamNotified: false, notifiedAt: "",
    availableBeds: 8, totalEmergencyBeds: 12,
    traumaLevel: "Level III",
    specialties: ["General Medicine", "Paediatrics", "Orthopaedics"],
    address: "88 Nagar Road, Hadapsar, Pune",
    contactNumber: "+91-20-2689-3456",
  },
];

// ─── Notifications ────────────────────────────
export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "critical", title: "P1 Corridor Active",    body: "AMB-102 — City General Hospital. Green corridor live on J01–J04.", time: "14:32", read: false },
  { id: "n2", type: "success",  title: "Corridor Recalculated", body: "Junction 02 is staging for the next ETA window.", time: "14:31", read: false },
  { id: "n3", type: "warning",  title: "Signal Queue Detected", body: "Junction 03 reports 4-vehicle queue on approach lane.", time: "14:30", read: true },
  { id: "n4", type: "info",     title: "AMB-087 En Route",      body: "St. Mary's Trauma Center notified. ETA 08:15.", time: "14:29", read: true },
  { id: "n5", type: "info",     title: "AMB-114 Dispatched",    body: "Metropolitan Medical corridor pre-computation started.", time: "14:28", read: true },
];

// ─── Analytics trend data (last 7 days) ───────
export const ANALYTICS_TREND: AnalyticsTrend[] = [
  { label: "Mon", avgResponseTime: 11.2, timeSaved: 6.8, trips: 8,  signalsPrioritized: 24 },
  { label: "Tue", avgResponseTime: 10.5, timeSaved: 7.4, trips: 11, signalsPrioritized: 31 },
  { label: "Wed", avgResponseTime: 12.1, timeSaved: 5.9, trips: 7,  signalsPrioritized: 19 },
  { label: "Thu", avgResponseTime: 9.8,  timeSaved: 8.1, trips: 13, signalsPrioritized: 38 },
  { label: "Fri", avgResponseTime: 10.2, timeSaved: 7.6, trips: 10, signalsPrioritized: 29 },
  { label: "Sat", avgResponseTime: 8.9,  timeSaved: 9.2, trips: 15, signalsPrioritized: 44 },
  { label: "Sun", avgResponseTime: 7.7,  timeSaved: 9.8, trips: 6,  signalsPrioritized: 18 },
];

// ─── helpers ──────────────────────────────────
export function fmtEta(seconds: number): string {
  if (seconds <= 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function fmtMins(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function signalTone(state: SignalState): "green" | "amber" | "cyan" | "muted" | "coral" {
  if (state === "ACTIVE GREEN")    return "green";
  if (state === "PREPARING")       return "amber";
  if (state === "COMPLETED")       return "muted";
  if (state === "MANUAL OVERRIDE") return "coral";
  if (state === "OFFLINE")         return "muted";
  return "cyan";
}

export function junctionStateLabel(state: SignalState): string {
  if (state === "NORMAL") return "PRIORITY SCHEDULED";
  return state;
}
