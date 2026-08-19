// ─────────────────────────────────────────────────────────────────
// LifeLane Command Center — Home.tsx
// All interactivity implemented with React state + mock data only.
// ─────────────────────────────────────────────────────────────────
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Activity, Ambulance, Bell, Building2, ChevronRight, CircleDot, Clock3,
  Command, Crosshair, Gauge, Hospital, LayoutDashboard, MapPinned, Menu,
  MoreHorizontal, Navigation, Radio, Settings, ShieldCheck, Signal, Siren,
  SlidersHorizontal, Sparkles, Timer, TrafficCone, TrendingUp, TriangleAlert,
  Users, X, Zap, LockKeyhole, Eye, EyeOff, CheckCircle2, AlertTriangle,
  Info, CheckCheck, RefreshCcw, Maximize2, ZapOff,
} from "lucide-react";
import {
  INITIAL_AMBULANCES, INITIAL_HOSPITALS, INITIAL_JUNCTIONS, INITIAL_NOTIFICATIONS,
  INITIAL_SIGNALS, INITIAL_CORRIDORS,
  fmtEta, junctionStateLabel, signalTone,
  type Ambulance as AmbulanceType,
  type Hospital as HospitalType,
  type Junction,
  type NavSection,
  type Notification,
  type SignalNode,
  type SignalState,
  type CorridorOp,
} from "../data/mockData";
import AmbulancesPage   from "./sections/AmbulancesPage";
import TrafficSignalsPage from "./sections/TrafficSignalsPage";
import GreenCorridorsPage from "./sections/GreenCorridorsPage";
import HospitalsPage    from "./sections/HospitalsPage";
import AnalyticsPage    from "./sections/AnalyticsPage";
import SettingsPage     from "./sections/SettingsPage";
import LiveOperationsPage from "./sections/LiveOperationsPage";
import { useSettings } from "../contexts/SettingsContext";

// ─── nav items ────────────────────────────────────────────────────
const navItems: { label: NavSection; icon: any }[] = [
  { label: "Command Center",  icon: LayoutDashboard },
  { label: "Live Operations", icon: Radio },
  { label: "Ambulances",      icon: Ambulance },
  { label: "Traffic Signals", icon: Signal },
  { label: "Green Corridors", icon: Navigation },
  { label: "Hospitals",       icon: Hospital },
  { label: "Analytics",       icon: TrendingUp },
  { label: "Settings",        icon: Settings },
];

// ─── tiny shared presentational components ────────────────────────
function StatusPill({ children, tone = "cyan" }: {
  children: React.ReactNode;
  tone?: "cyan" | "green" | "amber" | "coral" | "muted";
}) {
  const colors = {
    cyan:  "border-[#48d7e8]/25 bg-[#48d7e8]/[.08] text-[#72e2ed]",
    green: "border-[#5be6a8]/25 bg-[#5be6a8]/[.08] text-[#5be6a8]",
    amber: "border-[#f5ba69]/25 bg-[#f5ba69]/[.08] text-[#f5ba69]",
    coral: "border-[#ff806e]/25 bg-[#ff806e]/[.08] text-[#ff9688]",
    muted: "border-white/10 bg-white/[.04] text-[#92aab0]",
  };
  const dot = {
    cyan: "bg-[#48d7e8]", green: "bg-[#5be6a8]", amber: "bg-[#f5ba69]",
    coral: "bg-[#ff806e]", muted: "bg-[#92aab0]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 mono text-[9px] uppercase tracking-[.08em] ${colors[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`} />
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, action, onAction }: {
  eyebrow: string; title: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">{eyebrow}</p>
        <h2 className="mt-1 text-[17px] font-semibold tracking-[-.02em] text-white">{title}</h2>
      </div>
      {action && (
        <button
          onClick={onAction ?? (() => toast.info(`${action} view is available in the full operations suite.`))}
          className="mono flex items-center gap-1 text-[10px] uppercase tracking-[.12em] text-[#76939c] transition-colors hover:text-[#48d7e8]"
        >
          View all <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, accent = "cyan" }: {
  icon: any; label: string; value: string; detail: string; accent?: string;
}) {
  const accentClass = accent === "green" ? "text-[#5be6a8]" : accent === "coral" ? "text-[#ff806e]" : "text-[#48d7e8]";
  const dotClass   = accent === "green" ? "bg-[#5be6a8]"   : accent === "coral" ? "bg-[#ff806e]"   : "bg-[#48d7e8]";
  return (
    <div className="panel panel-hover relative overflow-hidden rounded-xl p-4 sm:p-5">
      <div className="absolute -right-5 -top-7 h-24 w-24 rounded-full bg-[#48d7e8]/5 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.18em] text-[#76939c]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[30px]">{value}</p>
        </div>
        <div className={`rounded-lg border border-white/10 bg-white/[.035] p-2 ${accentClass}`}>
          <Icon size={17} strokeWidth={1.7} />
        </div>
      </div>
      <div className="relative mt-3 flex items-center justify-between gap-2 text-[11px] text-[#76939c]">
        <span className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />{detail}
        </span>
        <span className="mono text-[9px] text-[#496d76]">LIVE / 01s</span>
      </div>
    </div>
  );
}

function PlusIcon()  { return <span className="block text-sm leading-none">+</span>; }
function MinusIcon() { return <span className="block text-sm leading-none">−</span>; }

// ─── LiveMap ──────────────────────────────────────────────────────
// Road network uses a real city-grid layout.
// All coordinates are in a 760×440 viewBox.
//
// Street layout:
//   Horizontal arterials:  H1 y=80, H2 y=175, H3 y=270, H4 y=365
//   Vertical arterials:    V1 x=110, V2 x=230, V3 x=360, V4 x=490, V5 x=620
//
// Ambulance route follows streets:
//   Start (AMB origin) → J01 → J02 → J03 → J04 → Hospital (dest)
//   Path: (110,365) → (230,365)[J01] → (230,270)[J02] → (360,270)[J03] → (490,175)[J04] → (620,175)[Hospital]
//
// Junction positions (fixed on actual intersections):
//   J01: (230,365)  J02: (230,270)  J03: (360,270)  J04: (490,175)

const ROUTE_SEGMENTS = [
  { x1:110, y1:365, x2:230, y2:365 }, // start → J01
  { x1:230, y1:365, x2:230, y2:270 }, // J01 → J02
  { x1:230, y1:270, x2:360, y2:270 }, // J02 → J03
  { x1:360, y1:270, x2:490, y2:175 }, // J03 → J04 (diagonal shortcut road)
  { x1:490, y1:175, x2:620, y2:175 }, // J04 → Hospital
] as const;

// Total route path length (approximate, used for interpolation)
const ROUTE_WAYPOINTS = [
  { x:110, y:365 },
  { x:230, y:365 },
  { x:230, y:270 },
  { x:360, y:270 },
  { x:490, y:175 },
  { x:620, y:175 },
];

function getRoutePoint(pct: number): { x: number; y: number } {
  // compute cumulative lengths
  const lens: number[] = [0];
  for (let i = 1; i < ROUTE_WAYPOINTS.length; i++) {
    const dx = ROUTE_WAYPOINTS[i].x - ROUTE_WAYPOINTS[i-1].x;
    const dy = ROUTE_WAYPOINTS[i].y - ROUTE_WAYPOINTS[i-1].y;
    lens.push(lens[i-1] + Math.sqrt(dx*dx + dy*dy));
  }
  const total = lens[lens.length - 1];
  const target = pct * total;
  for (let i = 1; i < ROUTE_WAYPOINTS.length; i++) {
    if (target <= lens[i]) {
      const t = (target - lens[i-1]) / (lens[i] - lens[i-1]);
      return {
        x: ROUTE_WAYPOINTS[i-1].x + t * (ROUTE_WAYPOINTS[i].x - ROUTE_WAYPOINTS[i-1].x),
        y: ROUTE_WAYPOINTS[i-1].y + t * (ROUTE_WAYPOINTS[i].y - ROUTE_WAYPOINTS[i-1].y),
      };
    }
  }
  return ROUTE_WAYPOINTS[ROUTE_WAYPOINTS.length - 1];
}

const JUNCTION_POSITIONS = [
  { id: "J01", x: 230, y: 365, label: "Junction 01" },
  { id: "J02", x: 230, y: 270, label: "Junction 02" },
  { id: "J03", x: 360, y: 270, label: "Junction 03" },
  { id: "J04", x: 490, y: 175, label: "Junction 04" },
];

function JunctionMarker({ x, y, id, label, state }: {
  x: number; y: number; id: string; label: string; state: SignalState;
}) {
  const isGreen    = state === "ACTIVE GREEN";
  const isPrepare  = state === "PREPARING";
  const isComplete = state === "COMPLETED";
  const ringColor  = isGreen ? "#5be6a8" : isPrepare ? "#f5ba69" : isComplete ? "#92aab0" : "#48d7e8";
  const fillColor  = isGreen ? "rgba(91,230,168,.18)" : isPrepare ? "rgba(245,186,105,.12)" : isComplete ? "rgba(146,170,176,.08)" : "rgba(72,215,232,.10)";
  const stateLabel = isGreen ? "ACTIVE GREEN" : isPrepare ? "PREPARING" : isComplete ? "COMPLETED" : "SCHEDULED";

  return (
    <g>
      {/* outer ring for active states */}
      {isGreen && (
        <circle cx={x} cy={y} r="22" fill="none" stroke="#5be6a8" strokeWidth="1" opacity=".25" className="amb-pulse"/>
      )}
      {isPrepare && (
        <circle cx={x} cy={y} r="18" fill="none" stroke="#f5ba69" strokeWidth="1" opacity=".35" className="junction-prepare"/>
      )}
      {/* mini traffic light box */}
      <rect x={x-5} y={y-11} width="10" height="16" rx="2" fill="#0a1a22" stroke={ringColor} strokeWidth="1.2"/>
      <circle cx={x} cy={y-6} r="2" fill={isGreen || isPrepare || isComplete ? "#92aab0" : "#92aab0"} opacity=".4"/>
      <circle cx={x} cy={y-1} r="2" fill={isPrepare ? "#f5ba69" : "#92aab0"} opacity={isPrepare ? "1" : ".4"}/>
      <circle cx={x} cy={y+4} r="2" fill={isGreen ? "#5be6a8" : "#92aab0"}
        opacity={isGreen ? "1" : ".4"}
        style={isGreen ? { filter:"drop-shadow(0 0 3px #5be6a8)" } : {}}
      />
      {/* node ring */}
      <circle cx={x} cy={y} r="12" fill={fillColor} stroke={ringColor} strokeWidth="1.5"/>
      {/* ID label */}
      <text x={x} y={y+4} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="9" fontWeight="600" fill={ringColor}>{id}</text>
      {/* label below */}
      <rect x={x-28} y={y+16} width="56" height="14" rx="3" fill="rgba(7,16,23,.82)" stroke={ringColor} strokeWidth=".8" opacity=".9"/>
      <text x={x} y={y+26} textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="8" fill={ringColor} opacity=".9">{stateLabel}</text>
    </g>
  );
}

function LiveMap({ ambulance, junctions }: { ambulance: AmbulanceType; junctions: Junction[] }) {
  const pct = Math.max(0, Math.min(0.98, 1 - ambulance.currentEta / ambulance.initialEta));
  const { x: ax, y: ay } = getRoutePoint(pct);
  const [zoom, setZoom] = useState(1);

  // Map junction state from the live junctions array to J01–J04
  const junctionState = (id: string): SignalState => {
    const idx = parseInt(id.replace("J",""), 10) - 1;
    return junctions[idx]?.state ?? "NORMAL";
  };

  // Completed portion of route (from start to ambulance position)
  const completedPath = (() => {
    const pts: string[] = [];
    let remaining = pct;
    const lens: number[] = [0];
    for (let i = 1; i < ROUTE_WAYPOINTS.length; i++) {
      const dx = ROUTE_WAYPOINTS[i].x - ROUTE_WAYPOINTS[i-1].x;
      const dy = ROUTE_WAYPOINTS[i].y - ROUTE_WAYPOINTS[i-1].y;
      lens.push(lens[i-1] + Math.sqrt(dx*dx + dy*dy));
    }
    const total = lens[lens.length - 1];
    const target = pct * total;
    pts.push(`M ${ROUTE_WAYPOINTS[0].x} ${ROUTE_WAYPOINTS[0].y}`);
    for (let i = 1; i < ROUTE_WAYPOINTS.length; i++) {
      if (lens[i] <= target) {
        pts.push(`L ${ROUTE_WAYPOINTS[i].x} ${ROUTE_WAYPOINTS[i].y}`);
      } else {
        pts.push(`L ${ax.toFixed(1)} ${ay.toFixed(1)}`);
        break;
      }
    }
    return pts.join(" ");
  })();

  // Full route path string
  const fullRoutePath = ROUTE_WAYPOINTS.map((p,i) => `${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ");

  const etaStr = (() => {
    const s = ambulance.currentEta;
    if (s <= 0) return "00:00";
    return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  })();
  const distStr = `${ambulance.distance.toFixed(1)} km`;
  const nextJunction = junctions.find(j => j.state === "PREPARING" || j.state === "ACTIVE GREEN");

  return (
    <div className="panel telemetry-grid relative min-h-[360px] overflow-hidden rounded-xl sm:min-h-[430px]">
      {/* subtle grid overlay */}
      <div className="absolute inset-0 opacity-80"
        style={{ backgroundImage:"url('/manus-storage/lifelane-grid-texture_ab6daa6e.png')", backgroundSize:"cover", mixBlendMode:"screen" }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`${zoom===1?0:zoom===1.5?80:140} ${zoom===1?0:zoom===1.5?60:100} ${760/zoom} ${440/zoom}`}
        preserveAspectRatio="xMidYMid meet"
        aria-label="LifeLane live city command map"
        style={{ transition:"all .5s cubic-bezier(.23,1,.32,1)" }}
      >
        <defs>
          {/* route glow filter */}
          <filter id="routeGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* soft city block fill */}
          <filter id="softFill">
            <feGaussianBlur stdDeviation="1"/>
          </filter>
          {/* congestion glow */}
          <filter id="congestionGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* ── CITY BLOCKS (muted background fills) ── */}
        <g opacity=".28">
          <rect x="130" y="90"  width="90" height="75"  rx="2" fill="#0d2028"/>
          <rect x="240" y="90"  width="110" height="75" rx="2" fill="#0d2028"/>
          <rect x="370" y="90"  width="110" height="75" rx="2" fill="#0d2028"/>
          <rect x="500" y="90"  width="110" height="75" rx="2" fill="#0d2028"/>
          <rect x="130" y="185" width="90" height="75"  rx="2" fill="#0d2028"/>
          <rect x="240" y="185" width="110" height="75" rx="2" fill="#0d2028"/>
          <rect x="370" y="185" width="110" height="75" rx="2" fill="#0d2028"/>
          <rect x="500" y="185" width="110" height="75" rx="2" fill="#0d2028"/>
          <rect x="130" y="280" width="90" height="75"  rx="2" fill="#0d2028"/>
          <rect x="240" y="280" width="110" height="75" rx="2" fill="#0d2028"/>
          <rect x="370" y="280" width="110" height="75" rx="2" fill="#0d2028"/>
          <rect x="500" y="280" width="110" height="75" rx="2" fill="#0d2028"/>
        </g>

        {/* ── ROAD NETWORK ── */}
        {/* Road fill (wide, dark) */}
        <g fill="none" strokeLinecap="square">
          {/* horizontal arterials */}
          <line x1="80"  y1="80"  x2="660" y2="80"  stroke="#162530" strokeWidth="20"/>
          <line x1="80"  y1="175" x2="660" y2="175" stroke="#162530" strokeWidth="20"/>
          <line x1="80"  y1="270" x2="660" y2="270" stroke="#162530" strokeWidth="20"/>
          <line x1="80"  y1="365" x2="660" y2="365" stroke="#162530" strokeWidth="20"/>
          {/* vertical arterials */}
          <line x1="110" y1="60"  x2="110" y2="400" stroke="#162530" strokeWidth="18"/>
          <line x1="230" y1="60"  x2="230" y2="400" stroke="#162530" strokeWidth="18"/>
          <line x1="360" y1="60"  x2="360" y2="400" stroke="#162530" strokeWidth="18"/>
          <line x1="490" y1="60"  x2="490" y2="400" stroke="#162530" strokeWidth="18"/>
          <line x1="620" y1="60"  x2="620" y2="400" stroke="#162530" strokeWidth="18"/>
          {/* diagonal connector road (J03→J04) */}
          <line x1="360" y1="270" x2="490" y2="175" stroke="#162530" strokeWidth="18"/>
        </g>

        {/* Road centerlines (subtle lane markings) */}
        <g fill="none" strokeLinecap="round" opacity=".18">
          <line x1="80"  y1="80"  x2="660" y2="80"  stroke="#48d7e8" strokeWidth="1" strokeDasharray="12 10"/>
          <line x1="80"  y1="175" x2="660" y2="175" stroke="#48d7e8" strokeWidth="1" strokeDasharray="12 10"/>
          <line x1="80"  y1="270" x2="660" y2="270" stroke="#48d7e8" strokeWidth="1" strokeDasharray="12 10"/>
          <line x1="80"  y1="365" x2="660" y2="365" stroke="#48d7e8" strokeWidth="1" strokeDasharray="12 10"/>
          <line x1="110" y1="60"  x2="110" y2="400" stroke="#48d7e8" strokeWidth="1" strokeDasharray="12 10"/>
          <line x1="230" y1="60"  x2="230" y2="400" stroke="#48d7e8" strokeWidth="1" strokeDasharray="12 10"/>
          <line x1="360" y1="60"  x2="360" y2="400" stroke="#48d7e8" strokeWidth="1" strokeDasharray="12 10"/>
          <line x1="490" y1="60"  x2="490" y2="400" stroke="#48d7e8" strokeWidth="1" strokeDasharray="12 10"/>
          <line x1="620" y1="60"  x2="620" y2="400" stroke="#48d7e8" strokeWidth="1" strokeDasharray="12 10"/>
        </g>

        {/* Road edges (border lines) */}
        <g fill="none" opacity=".5">
          <line x1="80"  y1="70"  x2="660" y2="70"  stroke="#1e3a48" strokeWidth="1"/>
          <line x1="80"  y1="90"  x2="660" y2="90"  stroke="#1e3a48" strokeWidth="1"/>
          <line x1="80"  y1="165" x2="660" y2="165" stroke="#1e3a48" strokeWidth="1"/>
          <line x1="80"  y1="185" x2="660" y2="185" stroke="#1e3a48" strokeWidth="1"/>
          <line x1="80"  y1="260" x2="660" y2="260" stroke="#1e3a48" strokeWidth="1"/>
          <line x1="80"  y1="280" x2="660" y2="280" stroke="#1e3a48" strokeWidth="1"/>
          <line x1="80"  y1="355" x2="660" y2="355" stroke="#1e3a48" strokeWidth="1"/>
          <line x1="80"  y1="375" x2="660" y2="375" stroke="#1e3a48" strokeWidth="1"/>
        </g>

        {/* Street name labels */}
        <g fontFamily="IBM Plex Mono" fontSize="8" fill="#2a4a58" opacity=".9">
          <text x="88" y="77">MG ROAD</text>
          <text x="88" y="172">FC ROAD</text>
          <text x="88" y="267">DECCAN AVE</text>
          <text x="88" y="362">KARVE ROAD</text>
          <text x="113" y="72" writingMode="tb" transform="rotate(0)">BANER ST</text>
          <text x="232" y="72">NORTH RD</text>
          <text x="362" y="72">CENTRAL</text>
          <text x="492" y="72">EAST AVE</text>
          <text x="623" y="72">NAGAR RD</text>
        </g>

        {/* ── CONGESTION ZONES ── */}
        {/* Heavy congestion segment */}
        <line x1="360" y1="270" x2="490" y2="270" stroke="#ff806e" strokeWidth="6" opacity=".22" filter="url(#congestionGlow)"/>
        <line x1="360" y1="270" x2="490" y2="270" stroke="#ff806e" strokeWidth="3" opacity=".35" strokeDasharray="4 3"/>
        {/* Moderate congestion */}
        <line x1="490" y1="270" x2="620" y2="270" stroke="#f5ba69" strokeWidth="4" opacity=".18" filter="url(#congestionGlow)"/>
        <line x1="490" y1="270" x2="620" y2="270" stroke="#f5ba69" strokeWidth="2" opacity=".3" strokeDasharray="4 4"/>
        {/* signal queue dots */}
        <g opacity=".55">
          <circle cx="400" cy="270" r="3.5" fill="#f5ba69"/>
          <circle cx="415" cy="270" r="3.5" fill="#f5ba69"/>
          <circle cx="430" cy="270" r="3.5" fill="#f5ba69"/>
          <circle cx="445" cy="270" r="3"   fill="#f5ba69" opacity=".6"/>
          <circle cx="540" cy="175" r="3"   fill="#f5ba69"/>
          <circle cx="555" cy="175" r="3"   fill="#f5ba69" opacity=".7"/>
        </g>
        {/* vehicle dots on non-corridor roads */}
        <g opacity=".3">
          <circle cx="300" cy="80"  r="3" fill="#6fa8b4"/>
          <circle cx="450" cy="80"  r="3" fill="#6fa8b4"/>
          <circle cx="560" cy="175" r="3" fill="#6fa8b4"/>
          <circle cx="180" cy="365" r="3" fill="#6fa8b4"/>
          <circle cx="420" cy="365" r="3" fill="#6fa8b4"/>
        </g>

        {/* ── CORRIDOR ROUTE ── */}
        {/* Completed portion (bright solid) */}
        {pct > 0.01 && (
          <path d={completedPath} fill="none" stroke="#5be6a8" strokeWidth="4.5"
            strokeLinecap="round" strokeLinejoin="round" opacity=".7"
            style={{ filter:"drop-shadow(0 0 4px rgba(91,230,168,.6))" }}
          />
        )}
        {/* Remaining route (cyan dashed, animated flow) */}
        <path d={fullRoutePath} fill="none" stroke="#48d7e8" strokeWidth="4"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="12 9" opacity=".45"
          className="dash-flow route-glow"
        />
        {/* Route highlight underneath */}
        <path d={fullRoutePath} fill="none" stroke="#48d7e8" strokeWidth="9"
          strokeLinecap="round" strokeLinejoin="round" opacity=".07"
        />

        {/* ── DIRECTION ARROWS on route ── */}
        {[0.12, 0.32, 0.52, 0.72, 0.88].map((t, i) => {
          const p0 = getRoutePoint(Math.max(0, t - 0.04));
          const p1 = getRoutePoint(Math.min(1, t + 0.04));
          const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
          const p  = getRoutePoint(t);
          const isPast = t < pct;
          return (
            <g key={i} transform={`translate(${p.x},${p.y}) rotate(${angle})`} opacity={isPast ? ".6" : ".3"}>
              <path d="M-4 -3 L4 0 L-4 3" fill="none"
                stroke={isPast ? "#5be6a8" : "#48d7e8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </g>
          );
        })}

        {/* ── JUNCTIONS ── */}
        {JUNCTION_POSITIONS.map(jp => (
          <JunctionMarker key={jp.id} x={jp.x} y={jp.y} id={jp.id} label={jp.label} state={junctionState(jp.id)} />
        ))}

        {/* ── HOSPITAL (destination) ── */}
        <g transform="translate(620,175)">
          {/* glow */}
          <circle cx="0" cy="0" r="22" fill="rgba(91,230,168,.06)" stroke="#5be6a8" strokeWidth="1" opacity=".4"/>
          {/* building */}
          <rect x="-13" y="-14" width="26" height="22" rx="3" fill="#071017" stroke="#5be6a8" strokeWidth="1.5"/>
          {/* cross */}
          <rect x="-2"  y="-11" width="4"  height="16" rx="1" fill="#5be6a8"/>
          <rect x="-7"  y="-6"  width="14" height="4"  rx="1" fill="#5be6a8"/>
          {/* label */}
          <rect x="-40" y="12" width="80" height="14" rx="3" fill="rgba(7,16,23,.9)" stroke="#5be6a8" strokeWidth=".8"/>
          <text x="0" y="22" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="8" fontWeight="600" fill="#5be6a8">CITY GENERAL</text>
        </g>

        {/* ── AMBULANCE MARKER ── */}
        <g transform={`translate(${ax.toFixed(1)},${ay.toFixed(1)})`} style={{ transition:"transform 1s cubic-bezier(.23,1,.32,1)" }}>
          {/* outer pulse ring */}
          <circle r="22" fill="rgba(72,215,232,.06)" stroke="#48d7e8" strokeWidth=".8" opacity=".5" className="amb-pulse"/>
          {/* mid ring */}
          <circle r="14" fill="rgba(72,215,232,.12)" stroke="#48d7e8" strokeWidth="1.2" opacity=".7"/>
          {/* vehicle body */}
          <rect x="-9" y="-6" width="18" height="12" rx="2.5" fill="#071017" stroke="#48d7e8" strokeWidth="1.8"/>
          {/* cross on vehicle */}
          <rect x="-1.5" y="-4" width="3"  height="8"  rx=".5" fill="#48d7e8"/>
          <rect x="-4.5" y="-1" width="9"  height="2.5" rx=".5" fill="#48d7e8"/>
          {/* siren lights */}
          <rect x="-9" y="-9" width="4" height="3" rx="1" fill="#ff806e" opacity=".9"
            style={{ filter:"drop-shadow(0 0 3px #ff806e)" }}
          />
          <rect x="5"  y="-9" width="4" height="3" rx="1" fill="#48d7e8" opacity=".9"
            style={{ filter:"drop-shadow(0 0 3px #48d7e8)" }}
          />
          {/* ID label */}
          <rect x="-22" y="16" width="44" height="13" rx="3" fill="rgba(7,16,23,.92)" stroke="#48d7e8" strokeWidth="1"/>
          <text x="0" y="25.5" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="8.5" fontWeight="700" fill="#48d7e8">AMB-102</text>
        </g>

        {/* ── ORIGIN marker ── */}
        {pct < 0.05 && (
          <g transform="translate(110,365)">
            <circle r="6" fill="#071017" stroke="#48d7e8" strokeWidth="1.5" opacity=".7"/>
            <circle r="2.5" fill="#48d7e8" opacity=".8"/>
          </g>
        )}
      </svg>

      {/* ── TOP-LEFT: map badge ── */}
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-white/10 bg-[#071017]/80 px-3 py-2 backdrop-blur-md">
        <Crosshair size={13} className="text-[#48d7e8]"/>
        <span className="mono text-[10px] uppercase tracking-[.12em] text-[#b8d5da]">Live city grid</span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#5be6a8] beacon"/>
      </div>

      {/* ── TOP-RIGHT: zoom controls ── */}
      <div className="absolute right-4 top-4 flex flex-col gap-1">
        <button
          onClick={() => setZoom(z => Math.min(2, parseFloat((z + 0.5).toFixed(1))))}
          className="rounded-md border border-white/10 bg-[#071017]/80 p-1.5 text-[#91aab0] transition-colors hover:text-white hover:border-[#48d7e8]/30 w-8 h-8 flex items-center justify-center mono text-sm font-semibold"
        >+</button>
        <button
          onClick={() => setZoom(z => Math.max(1, parseFloat((z - 0.5).toFixed(1))))}
          className="rounded-md border border-white/10 bg-[#071017]/80 p-1.5 text-[#91aab0] transition-colors hover:text-white hover:border-[#48d7e8]/30 w-8 h-8 flex items-center justify-center mono text-sm font-semibold"
        >−</button>
        {zoom > 1 && (
          <button
            onClick={() => setZoom(1)}
            className="rounded-md border border-white/10 bg-[#071017]/80 px-1.5 py-1 text-[8px] mono uppercase text-[#48d7e8] hover:bg-[#48d7e8]/10 transition-colors"
          >fit</button>
        )}
      </div>

      {/* ── FLOATING INFO PANEL ── hidden on xs, shown sm+ */}
      <div className="absolute left-4 bottom-14 hidden sm:block rounded-xl border border-[#48d7e8]/20 bg-[#071017]/88 backdrop-blur-md px-3 py-3 min-w-[190px]">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff806e] beacon"/>
          <span className="mono text-[10px] uppercase tracking-[.14em] text-[#48d7e8] font-semibold">AMB-102 LIVE</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {[
            { l:"Distance",    v: distStr },
            { l:"ETA",         v: etaStr },
            { l:"Next junction", v: nextJunction ? nextJunction.label.replace("Junction ","J") : "—" },
            { l:"Corridor",    v: "ACTIVE" },
          ].map(r => (
            <div key={r.l}>
              <p className="mono text-[8px] uppercase text-[#56737a]">{r.l}</p>
              <p className={`mono text-[10px] font-semibold mt-0.5 ${r.l==="ETA"?"text-[#48d7e8]":r.l==="Corridor"?"text-[#5be6a8]":"text-[#dcecef]"}`}>{r.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MOBILE MINI INFO BAR (xs only) ── */}
      <div className="absolute left-4 right-4 sm:hidden bottom-14 flex items-center justify-between gap-2 rounded-lg border border-[#48d7e8]/20 bg-[#071017]/90 backdrop-blur-md px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff806e] beacon shrink-0"/>
          <span className="mono text-[9px] text-[#48d7e8] font-semibold">AMB-102</span>
        </div>
        <span className="mono text-[9px] text-[#dcecef]">ETA <span className="text-[#48d7e8]">{etaStr}</span></span>
        <span className="mono text-[9px] text-[#dcecef]">{distStr}</span>
      </div>

      {/* ── BOTTOM LEGEND ── */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-white/[.07] bg-[#071017]/82 px-3 py-2 backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3 mono text-[9px] uppercase tracking-[.07em] text-[#86a5ad]">
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#48d7e8]"/>Route</span>
          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#5be6a8]"/>Cleared</span>
          <span className="hidden sm:flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ff806e]"/>Congestion</span>
          <span className="hidden sm:flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#f5ba69]"/>Queue</span>
        </div>
        <span className="mono text-[9px] text-[#48d7e8] hidden sm:inline">3.2 km² monitored</span>
      </div>
    </div>
  );
}

// ─── CorridorTimeline ─────────────────────────────────────────────
function CorridorTimeline({ junctions }: { junctions: Junction[] }) {
  return (
    <div className="panel rounded-xl p-4 sm:p-5">
      <SectionTitle eyebrow="Corridor orchestration" title="Green Corridor Status" action="Corridor" />

      {/* ── desktop stepper (sm+) ── */}
      <div className="hidden sm:block">
        {/* connector rail sits behind the nodes */}
        <div className="relative">
          {/* full-width background rail */}
          <div className="absolute top-[13px] left-[14px] right-[14px] h-px bg-white/[.08]" />
          {/* filled portion up to the last active/completed node */}
          {(() => {
            const lastActiveIdx = junctions.reduce((best, j, i) =>
              (j.state === "COMPLETED" || j.state === "ACTIVE GREEN" || j.state === "PREPARING") ? i : best, -1);
            if (lastActiveIdx < 1) return null;
            const pct = (lastActiveIdx / (junctions.length - 1)) * 100;
            const color = junctions[lastActiveIdx].state === "COMPLETED" ? "#5be6a8"
              : junctions[lastActiveIdx].state === "ACTIVE GREEN" ? "#5be6a8" : "#f5ba69";
            return (
              <div
                className="absolute top-[13px] left-[14px] h-px transition-all duration-700"
                style={{ width: `calc(${pct}% - 0px)`, background: `${color}55` }}
              />
            );
          })()}

          {/* nodes row */}
          <div className="grid grid-cols-4">
            {junctions.map((item) => {
              const tone = signalTone(item.state);
              const label = junctionStateLabel(item.state);
              return (
                <div key={item.id} className="flex flex-col items-center">
                  {/* node circle */}
                  <div className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border text-[10px] mono font-semibold transition-all
                    ${tone === "green" ? "border-[#5be6a8] bg-[#5be6a8]/15 text-[#5be6a8] shadow-[0_0_10px_rgba(91,230,168,.25)]" :
                      tone === "amber" ? "border-[#f5ba69] bg-[#f5ba69]/15 text-[#f5ba69]" :
                      tone === "muted" ? "border-white/20 bg-white/5 text-[#91aab0]" :
                                         "border-[#48d7e8] bg-[#48d7e8]/15 text-[#48d7e8]"}`}>
                    {item.state === "COMPLETED" ? "✓" : item.id}
                  </div>
                  {/* label below */}
                  <div className="mt-3 text-center px-1">
                    <p className="text-xs font-medium text-[#dcecef] leading-tight">{item.label}</p>
                    <p className={`mono mt-1 text-[9px] tracking-[.05em] leading-tight
                      ${tone === "green" ? "text-[#5be6a8]" :
                        tone === "amber" ? "text-[#f5ba69]" :
                        tone === "muted" ? "text-[#76939c]" : "text-[#48d7e8]"}`}>
                      {label}
                    </p>
                    {item.state === "ACTIVE GREEN" && (
                      <p className="mono text-[8px] text-[#5be6a8]/60 mt-0.5">{item.distance} · {item.etaSeconds}s</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── mobile list (< sm) ── */}
      <div className="grid grid-cols-2 gap-4 sm:hidden">
        {junctions.map((item) => {
          const tone = signalTone(item.state);
          const label = junctionStateLabel(item.state);
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] mono font-semibold
                ${tone === "green" ? "border-[#5be6a8] bg-[#5be6a8]/15 text-[#5be6a8]" :
                  tone === "amber" ? "border-[#f5ba69] bg-[#f5ba69]/15 text-[#f5ba69]" :
                  tone === "muted" ? "border-white/20 bg-white/5 text-[#91aab0]" :
                                     "border-[#48d7e8] bg-[#48d7e8]/15 text-[#48d7e8]"}`}>
                {item.state === "COMPLETED" ? "✓" : item.id}
              </div>
              <div>
                <p className="text-xs font-medium text-[#dcecef]">{item.label}</p>
                <p className={`mono mt-0.5 text-[9px] tracking-[.05em]
                  ${tone === "green" ? "text-[#5be6a8]" :
                    tone === "amber" ? "text-[#f5ba69]" :
                    tone === "muted" ? "text-[#76939c]" : "text-[#48d7e8]"}`}>
                  {label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AmbulanceCard ────────────────────────────────────────────────
function AmbulanceCard({
  ambulance,
  onViewDetails,
}: {
  ambulance: AmbulanceType;
  onViewDetails: () => void;
}) {
  const eta = fmtEta(ambulance.currentEta);
  return (
    <div className="panel panel-hover rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[#ff806e]/25 bg-[#ff806e]/10 p-2.5 text-[#ff806e]">
            <Ambulance size={19} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{ambulance.id}</h3>
              <StatusPill tone={ambulance.tone as any}>{ambulance.status}</StatusPill>
            </div>
            <p className="mono mt-1 text-[10px] text-[#76939c]">
              LAST SYNC {ambulance.lastSync} · {ambulance.gpsLocked ? "GPS LOCKED" : "GPS ACQUIRING"}
            </p>
          </div>
        </div>
        <button
          onClick={() => toast.success(`${ambulance.id} telemetry copied to clipboard.`)}
          className="text-[#76939c] transition-colors hover:text-white"
        >
          <MoreHorizontal size={17} />
        </button>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/[.07] py-4">
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c]">Speed</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {ambulance.speed} <span className="text-[10px] font-normal text-[#76939c]">km/h</span>
          </p>
        </div>
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c]">Distance</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {ambulance.distance.toFixed(1)} <span className="text-[10px] font-normal text-[#76939c]">km</span>
          </p>
        </div>
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c]">ETA</p>
          <p className="mt-1 text-sm font-semibold text-[#48d7e8]">{eta}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c]">Destination</p>
          <p className="mt-1 text-sm text-[#dcecef]">{ambulance.destination}</p>
        </div>
        <div className="text-right">
          <p className="mono text-[9px] uppercase text-[#76939c]">Priority</p>
          <p className={`mt-1 text-sm font-semibold ${ambulance.priority === "P1" ? "text-[#ff806e]" : ambulance.priority === "P2" ? "text-[#f5ba69]" : "text-[#48d7e8]"}`}>
            {ambulance.priority} {ambulance.priority === "P1" ? "Critical" : ambulance.priority === "P2" ? "Urgent" : "Routine"}
          </p>
        </div>
      </div>
      <button
        onClick={onViewDetails}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-[#48d7e8]/25 bg-[#48d7e8]/[.06] px-3 py-2 text-[11px] text-[#48d7e8] transition-all hover:bg-[#48d7e8]/[.12]"
      >
        <Maximize2 size={13} /> View Live Details
      </button>
    </div>
  );
}

// ─── SignalControl ────────────────────────────────────────────────
function SignalControl({
  junctions,
  onReturnToNormal,
  onExtendGreen,
  onManualOverride,
}: {
  junctions: Junction[];
  onReturnToNormal: (junctionId: string) => void;
  onExtendGreen: (junctionId: string) => void;
  onManualOverride: (junctionId: string) => void;
}) {
  // Show the first non-COMPLETED, non-NORMAL junction, else the first one
  const current = junctions.find(j => j.state === "ACTIVE GREEN" || j.state === "PREPARING") ?? junctions[0];
  const tone = signalTone(current.state);

  return (
    <div className="panel rounded-xl p-4 sm:p-5">
      <SectionTitle eyebrow="Intersection control" title="Traffic Signal Control" />
      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/10 p-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-7 flex-col items-center justify-center gap-1 rounded-md border border-white/15 bg-[#08131a]">
            <span className={`h-1.5 w-1.5 rounded-full ${tone === "coral" ? "bg-[#ff806e]" : "bg-white/15"}`}/>
            <span className={`h-1.5 w-1.5 rounded-full ${tone === "amber" ? "bg-[#f5ba69]" : "bg-white/15"}`}/>
            <span className={`h-1.5 w-1.5 rounded-full ${tone === "green" ? "bg-[#5be6a8] shadow-[0_0_8px_#5be6a8]" : "bg-white/15"}`}/>
          </div>
          <div>
            <p className="mono text-[9px] uppercase text-[#76939c]">Current junction</p>
            <p className="mt-1 text-sm font-medium text-white">{current.label}</p>
          </div>
        </div>
        <StatusPill tone={tone as any}>{junctionStateLabel(current.state)}</StatusPill>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3">
          <p className="mono text-[9px] uppercase text-[#76939c]">Ambulance distance</p>
          <p className="mt-1 text-sm font-medium text-white">{current.distance}</p>
        </div>
        <div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3">
          <p className="mono text-[9px] uppercase text-[#76939c]">Predicted ETA</p>
          <p className="mt-1 text-sm font-medium text-[#48d7e8]">{fmtEta(current.etaSeconds)}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={() => onReturnToNormal(current.id)}
          className="rounded-md border border-white/10 bg-white/[.03] px-2 py-2 text-[10px] text-[#9bb4b9] transition-all hover:border-white/25 hover:text-white"
        >
          Return to Normal
        </button>
        <button
          onClick={() => onExtendGreen(current.id)}
          className="rounded-md border border-[#5be6a8]/25 bg-[#5be6a8]/[.06] px-2 py-2 text-[10px] text-[#5be6a8] transition-all hover:bg-[#5be6a8]/[.12]"
        >
          Extend Green
        </button>
        <button
          onClick={() => onManualOverride(current.id)}
          className="rounded-md border border-[#ff806e]/25 bg-[#ff806e]/[.06] px-2 py-2 text-[10px] text-[#ff9688] transition-all hover:bg-[#ff806e]/[.12]"
        >
          Manual Override
        </button>
      </div>
    </div>
  );
}

// ─── HospitalCard ─────────────────────────────────────────────────
function HospitalCard({ hospital, ambulance }: { hospital: HospitalType; ambulance: AmbulanceType }) {
  const eta = fmtEta(ambulance.currentEta);
  const statusTone: Record<string, "green" | "amber" | "cyan" | "muted"> = {
    Acknowledged: "green",
    Ready: "green",
    Preparing: "amber",
    Standby: "cyan",
  };
  return (
    <div className="panel panel-hover rounded-xl p-4 sm:p-5">
      <SectionTitle eyebrow="Care network" title="Hospital Coordination" action="Hospital" />
      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-[#48d7e8]/20 bg-[#48d7e8]/[.08] p-2.5 text-[#48d7e8]">
          <Building2 size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{hospital.name}</p>
          <p className="mono mt-1 text-[10px] text-[#76939c]">TRAUMA INTAKE · {hospital.bay}</p>
        </div>
        <StatusPill tone={statusTone[hospital.status] ?? "cyan"}>{hospital.status}</StatusPill>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c]">Ambulance ID</p>
          <p className="mt-1 text-[#dcecef]">{ambulance.id}</p>
        </div>
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c]">Patient priority</p>
          <p className={`mt-1 ${ambulance.priority === "P1" ? "text-[#ff806e]" : ambulance.priority === "P2" ? "text-[#f5ba69]" : "text-[#48d7e8]"}`}>
            {ambulance.priority} {ambulance.priority === "P1" ? "Critical" : ambulance.priority === "P2" ? "Urgent" : "Routine"}
          </p>
        </div>
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c]">ETA</p>
          <p className="mt-1 text-[#48d7e8]">{eta}</p>
        </div>
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c]">Emergency team</p>
          <p className={`mt-1 ${hospital.emergencyTeamNotified ? "text-[#5be6a8]" : "text-[#76939c]"}`}>
            {hospital.emergencyTeamNotified ? `Notified · ${hospital.notifiedAt}` : "Awaiting alert"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Manual Override Modal ────────────────────────────────────────
function ManualOverrideModal({
  junctionId,
  onConfirm,
  onCancel,
}: {
  junctionId: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="panel relative w-full max-w-[420px] rounded-2xl p-6 z-10 toast-in">
        <div className="flex items-start gap-4">
          <div className="rounded-xl border border-[#ff806e]/30 bg-[#ff806e]/10 p-3 text-[#ff806e] shrink-0">
            <TriangleAlert size={22} />
          </div>
          <div>
            <p className="mono text-[10px] uppercase tracking-[.16em] text-[#ff806e]">Manual Override</p>
            <h3 className="mt-1.5 text-lg font-semibold text-white">Override Junction {junctionId}?</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#8daab1]">
              This will immediately force the signal to GREEN and bypass the automated corridor schedule.
              All other automated sequencing for this junction will be suspended until released.
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-white/15 bg-white/[.035] px-4 py-3 text-sm text-[#9bb4b9] transition-all hover:border-white/30 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg border border-[#ff806e]/30 bg-[#ff806e]/10 px-4 py-3 text-sm font-semibold text-[#ff806e] transition-all hover:bg-[#ff806e]/20"
          >
            Confirm Override
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Live Details Modal ───────────────────────────────────────────
function LiveDetailsModal({
  ambulance,
  junctions,
  hospital,
  onClose,
}: {
  ambulance: AmbulanceType;
  junctions: Junction[];
  hospital: HospitalType;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="panel relative w-full max-w-[620px] rounded-2xl p-5 sm:p-7 z-10 toast-in max-h-[90vh] overflow-y-auto">
        {/* header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#ff806e]/25 bg-[#ff806e]/10 p-2.5 text-[#ff806e]">
              <Ambulance size={20} />
            </div>
            <div>
              <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">Live telemetry</p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-.03em] text-white">{ambulance.id}</h2>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg border border-white/10 p-2 text-[#78959d] hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* telemetry grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Speed",       value: `${ambulance.speed} km/h`,          accent: "text-white" },
            { label: "ETA",         value: fmtEta(ambulance.currentEta),        accent: "text-[#48d7e8]" },
            { label: "Distance",    value: `${ambulance.distance.toFixed(1)} km`, accent: "text-white" },
            { label: "Priority",    value: `${ambulance.priority}`,             accent: ambulance.priority === "P1" ? "text-[#ff806e]" : ambulance.priority === "P2" ? "text-[#f5ba69]" : "text-[#48d7e8]" },
            { label: "GPS Status",  value: ambulance.gpsLocked ? "Locked" : "Acquiring", accent: ambulance.gpsLocked ? "text-[#5be6a8]" : "text-[#f5ba69]" },
            { label: "Last Sync",   value: ambulance.lastSync,                  accent: "text-white" },
          ].map(row => (
            <div key={row.label} className="rounded-lg border border-white/[.07] bg-white/[.025] p-3">
              <p className="mono text-[9px] uppercase text-[#76939c]">{row.label}</p>
              <p className={`mt-1 text-sm font-semibold ${row.accent}`}>{row.value}</p>
            </div>
          ))}
        </div>

        {/* details */}
        <div className="space-y-3 mb-5">
          <div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3">
            <p className="mono text-[9px] uppercase text-[#76939c]">Destination</p>
            <p className="mt-1 text-sm text-[#dcecef]">{ambulance.destination}</p>
          </div>
          <div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3">
            <p className="mono text-[9px] uppercase text-[#76939c]">Patient Condition</p>
            <p className="mt-1 text-sm text-[#dcecef]">{ambulance.patientCondition}</p>
          </div>
          <div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3">
            <p className="mono text-[9px] uppercase text-[#76939c]">Crew</p>
            <p className="mt-1 text-sm text-[#dcecef]">{ambulance.crew}</p>
          </div>
        </div>

        {/* corridor status */}
        <div className="mb-1">
          <p className="mono text-[10px] uppercase tracking-[.14em] text-[#48d7e8] mb-3">Corridor Status</p>
          <div className="space-y-2">
            {junctions.map(j => (
              <div key={j.id} className="flex items-center justify-between rounded-lg border border-white/[.07] bg-white/[.025] px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0
                    ${j.state === "ACTIVE GREEN" ? "bg-[#5be6a8]" :
                      j.state === "PREPARING"    ? "bg-[#f5ba69]" :
                      j.state === "COMPLETED"    ? "bg-[#92aab0]" : "bg-[#48d7e8]"}`}
                  />
                  <span className="text-xs text-[#dcecef]">{j.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="mono text-[9px] text-[#76939c]">{j.distance}</span>
                  <StatusPill tone={signalTone(j.state) as any}>{junctionStateLabel(j.state)}</StatusPill>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* hospital */}
        <div className="mt-4 rounded-lg border border-[#48d7e8]/15 bg-[#48d7e8]/[.04] p-3">
          <p className="mono text-[9px] uppercase text-[#48d7e8] mb-2">Receiving Hospital</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{hospital.name}</p>
              <p className="mono text-[10px] text-[#76939c] mt-0.5">
                {hospital.traumaLevel} · {hospital.bay} · {hospital.availableBeds} beds available
              </p>
            </div>
            <StatusPill tone={hospital.status === "Ready" || hospital.status === "Acknowledged" ? "green" : hospital.status === "Preparing" ? "amber" : "cyan"}>
              {hospital.status}
            </StatusPill>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Panel ──────────────────────────────────────────
function NotificationsPanel({
  notifications,
  onMarkAll,
  onClose,
}: {
  notifications: Notification[];
  onMarkAll: () => void;
  onClose: () => void;
}) {
  const typeIcon = (type: Notification["type"]) => {
    if (type === "critical") return <AlertTriangle size={13} className="text-[#ff806e]" />;
    if (type === "warning")  return <TriangleAlert  size={13} className="text-[#f5ba69]" />;
    if (type === "success")  return <CheckCircle2   size={13} className="text-[#5be6a8]" />;
    return <Info size={13} className="text-[#48d7e8]" />;
  };
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 pt-[80px]">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="panel relative w-full max-w-[380px] rounded-2xl overflow-hidden z-10 toast-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.07]">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-[#48d7e8]" />
            <span className="font-semibold text-[13px] text-white">Notifications</span>
            {unread > 0 && (
              <span className="mono text-[9px] bg-[#ff806e] text-white px-1.5 py-0.5 rounded-full">{unread}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAll}
              className="mono text-[9px] uppercase tracking-[.08em] text-[#48d7e8] hover:underline flex items-center gap-1"
            >
              <CheckCheck size={11} /> Mark all read
            </button>
            <button onClick={onClose} className="rounded-md border border-white/10 p-1.5 text-[#78959d] hover:text-white">
              <X size={13} />
            </button>
          </div>
        </div>
        <div className="max-h-[420px] overflow-y-auto divide-y divide-white/[.05]">
          {notifications.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <CheckCircle2 size={28} className="mx-auto text-[#5be6a8] mb-2 opacity-50" />
              <p className="text-sm text-[#76939c]">No notifications</p>
            </div>
          ) : notifications.map(n => (
            <div key={n.id} className={`px-5 py-3.5 ${!n.read ? "bg-white/[.025]" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[12px] font-medium ${!n.read ? "text-white" : "text-[#9bb4b9]"}`}>{n.title}</p>
                    <span className="mono text-[9px] text-[#4e6d76] shrink-0">{n.time}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#76939c] leading-relaxed">{n.body}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#48d7e8] shrink-0" />}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-white/[.07] mono text-[9px] text-[#4e6d76] text-center">
          LIFELANE ALERT SYSTEM · REAL-TIME FEED
        </div>
      </div>
    </div>
  );
}

// ─── LoginScreen ──────────────────────────────────────────────────
function LoginScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState("alex.smith@lifelane.city");
  const [password, setPassword] = useState("lifelane");
  const [showPassword, setShowPassword] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [liveIndex, setLiveIndex] = useState(0);
  const liveMessages = ["Dispatch uplink stable", "Signal mesh synchronized", "Emergency channels encrypted", "12 ambulances reporting"];
  useEffect(() => {
    const ticker = setInterval(() => setLiveIndex(v => (v + 1) % liveMessages.length), 2600);
    return () => clearInterval(ticker);
  }, []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Operator credentials required"); return; }
    setConnecting(true);
    window.setTimeout(() => {
      onAuthenticated();
      toast.success("Operator authenticated", { description: "Live command center uplink established." });
    }, 1150);
  };
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#071017] text-white">
      <div className="absolute inset-0 telemetry-grid opacity-50" />
      <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-[#48d7e8]/[.08] blur-[100px]" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#145565]/[.12] blur-[110px]" />
      <div className="relative hidden w-[48%] flex-col justify-between border-r border-white/[.08] p-10 lg:flex xl:p-14">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-[#48d7e8]/30 bg-[#0d2931]">
              <span className="absolute h-px w-9 rotate-[40deg] bg-[#48d7e8]"/>
              <span className="absolute h-px w-9 -rotate-[40deg] bg-[#48d7e8]"/>
              <span className="relative h-3 w-3 rotate-45 border-r-2 border-t-2 border-white"/>
            </div>
            <div>
              <p className="text-lg font-bold tracking-[.13em]">LIFELANE</p>
              <p className="mono text-[8px] tracking-[.16em] text-[#6f9099]">CITY RESPONSE SYSTEM</p>
            </div>
          </div>
          <div className="mt-28 max-w-[500px]">
            <p className="mono text-[10px] uppercase tracking-[.2em] text-[#48d7e8]">Secure operations gateway</p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-[-.05em] text-white xl:text-6xl">
              Move the city<br/><span className="text-[#48d7e8]">when seconds matter.</span>
            </h1>
            <p className="mt-6 max-w-[410px] text-sm leading-7 text-[#8daab1]">
              LIFELANE predicts ambulance arrival windows and orchestrates green corridors across the urban signal network.
            </p>
          </div>
        </div>
        <div className="max-w-[520px]">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#5be6a8] beacon"/>
            <span className="mono text-[10px] uppercase tracking-[.14em] text-[#8fb4bb]">{liveMessages[liveIndex]}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="panel rounded-lg p-3"><p className="mono text-[9px] uppercase text-[#6f8e96]">Network uptime</p><p className="mt-2 text-lg font-semibold text-white">99.98<span className="text-xs text-[#48d7e8]">%</span></p></div>
            <div className="panel rounded-lg p-3"><p className="mono text-[9px] uppercase text-[#6f8e96]">Corridors live</p><p className="mt-2 text-lg font-semibold text-[#5be6a8]">03</p></div>
            <div className="panel rounded-lg p-3"><p className="mono text-[9px] uppercase text-[#6f8e96]">Active units</p><p className="mt-2 text-lg font-semibold text-white">12</p></div>
          </div>
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-[430px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[#48d7e8]/30 bg-[#0d2931]">
              <span className="absolute h-px w-8 rotate-[40deg] bg-[#48d7e8]"/>
              <span className="absolute h-px w-8 -rotate-[40deg] bg-[#48d7e8]"/>
              <span className="relative h-2.5 w-2.5 rotate-45 border-r-2 border-t-2 border-white"/>
            </div>
            <p className="text-lg font-bold tracking-[.13em]">LIFELANE</p>
          </div>
          <div className="panel rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">Operator access</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">Sign in to command center</h2>
              </div>
              <div className="rounded-xl border border-[#48d7e8]/20 bg-[#48d7e8]/[.07] p-3 text-[#48d7e8]"><LockKeyhole size={20}/></div>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#7f9ca5]">Authenticate to access live ambulance telemetry and corridor controls.</p>
            <form onSubmit={submit} className="mt-7 space-y-5">
              <label className="block">
                <span className="mono text-[10px] uppercase tracking-[.13em] text-[#85a3aa]">Operator email</span>
                <div className="mt-2 flex items-center rounded-lg border border-white/10 bg-black/10 px-3 transition-colors focus-within:border-[#48d7e8]/45">
                  <Radio size={15} className="text-[#5a7d85]"/>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#4e6d76]" placeholder="operator@lifelane.city"/>
                </div>
              </label>
              <label className="block">
                <span className="mono text-[10px] uppercase tracking-[.13em] text-[#85a3aa]">Access key</span>
                <div className="mt-2 flex items-center rounded-lg border border-white/10 bg-black/10 px-3 transition-colors focus-within:border-[#48d7e8]/45">
                  <LockKeyhole size={15} className="text-[#5a7d85]"/>
                  <input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? "text" : "password"} className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none"/>
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="text-[#5a7d85] hover:text-white">{showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}</button>
                </div>
              </label>
              <div className="flex items-center justify-between text-[11px] text-[#76939c]">
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#48d7e8]"/> Remember this terminal</label>
                <button type="button" onClick={() => toast.info("Contact the shift lead to rotate your access key.")} className="text-[#48d7e8] hover:underline">Access help</button>
              </div>
              <button disabled={connecting} className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#48d7e8] px-4 py-3.5 text-sm font-semibold text-[#071017] transition-all hover:bg-[#70e4ee] disabled:cursor-wait disabled:opacity-80">
                {connecting ? <><Activity size={16} className="animate-pulse"/> Establishing secure uplink…</> : <>Enter command center <ChevronRight size={16} className="transition-transform group-hover:translate-x-1"/></>}
              </button>
            </form>
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/[.07] pt-5">
              <CheckCircle2 size={13} className="text-[#5be6a8]"/>
              <span className="mono text-[9px] uppercase tracking-[.1em] text-[#6f8e96]">256-bit encrypted · terminal verified</span>
            </div>
          </div>
          <p className="mt-5 text-center mono text-[9px] uppercase tracking-[.12em] text-[#4e6d76]">LIFELANE OPS / AUTH GATEWAY 2.4.08</p>
        </div>
      </div>
    </div>
  );
}

// ─── Home (main export) ───────────────────────────────────────────
export default function Home() {
  // ── settings (must be first — used by effects below) ────────────
  const { settings, commit: commitSettings } = useSettings();

  // ── auth ────────────────────────────────────────────────────────
  const [authenticated, setAuthenticated] = useState(false);

  // ── nav ─────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<NavSection>("Command Center");
  const [mobileNav, setMobileNav] = useState(false);

  // ── clock ───────────────────────────────────────────────────────
  const [clock, setClock] = useState(new Date());

  // ── ambulances ──────────────────────────────────────────────────
  const [ambulances, setAmbulances] = useState<AmbulanceType[]>(INITIAL_AMBULANCES);
  const [selectedId, setSelectedId] = useState<string>("AMB-102");

  // ── junctions for selected ambulance ────────────────────────────
  const [junctions, setJunctions] = useState<Junction[]>(INITIAL_JUNCTIONS);

  // ── hospitals ───────────────────────────────────────────────────
  const [hospitals, setHospitals] = useState<HospitalType[]>(INITIAL_HOSPITALS);

  // ── signals (full mesh) ─────────────────────────────────────────
  const [signals, setSignals] = useState<SignalNode[]>(INITIAL_SIGNALS);

  // ── corridor operations ─────────────────────────────────────────
  const [corridors, setCorridors] = useState<CorridorOp[]>(INITIAL_CORRIDORS);

  // ── notifications ───────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);

  // ── modals ──────────────────────────────────────────────────────
  const [overrideJunctionId, setOverrideJunctionId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // ── derived ─────────────────────────────────────────────────────
  const selectedAmbulance = ambulances.find(a => a.id === selectedId) ?? ambulances[0];
  const selectedHospital  = hospitals.find(h => h.name === selectedAmbulance.destination) ?? hospitals[0];
  const unreadCount       = notifications.filter(n => !n.read).length;

  // ── push a new notification helper ──────────────────────────────
  const pushNotification = useCallback((type: Notification["type"], title: string, body: string) => {
    // Respect notification filter settings
    // Determine category from title/type to decide whether to suppress
    const s = settings;
    if (type === "critical" && !s.p1Alerts) return;
    // signal-state alerts
    const isSignalAlert = title.toLowerCase().includes("junction") || title.toLowerCase().includes("signal") || title.toLowerCase().includes("green") || title.toLowerCase().includes("corridor");
    if (isSignalAlert && !s.signalAlerts) return;
    // hospital alerts
    const isHospitalAlert = title.toLowerCase().includes("hospital") || title.toLowerCase().includes("ready") || title.toLowerCase().includes("preparing");
    if (isHospitalAlert && !s.hospitalAlerts) return;
    // P2/P3 info alerts
    if (type === "info" && !s.p2Alerts && !s.p1Alerts) return;
    if (type === "info" && title.toLowerCase().includes("p3") && !s.p3Alerts) return;

    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    setNotifications(prev => [{
      id: `n-${Date.now()}`, type, title, body, time, read: false,
    }, ...prev].slice(0, 20));

    // Also fire a toast for critical events when channel includes Toast
    if ((s.alertChannel === "In-app + Toast" || s.alertChannel === "Toast only") && type === "critical") {
      toast.error(title, { description: body });
    }
  }, [settings]);

  // ── when ambulance is selected, rebuild junctions ────────────────
  useEffect(() => {
    // Reset junctions with ETA relative to the newly selected ambulance
    const amb = ambulances.find(a => a.id === selectedId);
    if (!amb) return;
    const base = amb.currentEta;
    setJunctions([
      { id: "01", label: "Junction 01", state: "ACTIVE GREEN", etaSeconds: Math.round(base * 0.11), greenDuration: 45, greenElapsed: 0, distance: "420 m" },
      { id: "02", label: "Junction 02", state: "PREPARING",    etaSeconds: Math.round(base * 0.28), greenDuration: 40, greenElapsed: 0, distance: "1.1 km" },
      { id: "03", label: "Junction 03", state: "NORMAL",       etaSeconds: Math.round(base * 0.61), greenDuration: 40, greenElapsed: 0, distance: "1.8 km" },
      { id: "04", label: "Junction 04", state: "NORMAL",       etaSeconds: Math.round(base * 0.95), greenDuration: 35, greenElapsed: 0, distance: "2.6 km" },
    ]);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── main simulation tick (1 second) ─────────────────────────────
  useEffect(() => {
    if (!authenticated) return;
    if (!settings.simEnabled) return; // Simulation disabled in Settings

    // Convert speed setting to a tick multiplier
    const speedMultiplier: Record<string, number> = { "0.5×": 0.5, "1×": 1, "2×": 2, "5×": 5, "10×": 10 };
    const ticksPerSecond = speedMultiplier[settings.simSpeed] ?? 1;
    // We run one setInterval per second but advance state by ticksPerSecond steps
    const advanceSteps = Math.max(1, Math.round(ticksPerSecond));

    const timer = setInterval(() => {
      setClock(new Date());

      // 1. Decrement ETA for all active ambulances
      setAmbulances(prev => prev.map(amb => {
        if (amb.currentEta <= 0) return amb;
        const next = Math.max(0, amb.currentEta - advanceSteps);
        const speedDelta = (Math.random() - 0.5) * 2;
        const nextSpeed  = Math.max(10, Math.min(80, amb.speed + speedDelta));
        return {
          ...amb,
          currentEta: next,
          distance: parseFloat(Math.max(0, amb.distance - (amb.speed / 3600) * advanceSteps).toFixed(3)),
          speed: parseFloat(nextSpeed.toFixed(0)),
          status: next === 0 ? "Completed" as any : amb.status,
        };
      }));

      // 2. Update junction ETAs and advance states
      setJunctions(prev => prev.map(j => {
        if (j.state === "COMPLETED") return j;
        const nextEta = Math.max(0, j.etaSeconds - advanceSteps);

        // NORMAL → PREPARING (configurable window, default 90s)
        if (j.state === "NORMAL" && nextEta <= settings.prepareWindow) {
          pushNotification("info", `Junction ${j.id} Preparing`, `${j.label} entering PREPARING state. Green window in ~${nextEta}s.`);
          return { ...j, etaSeconds: nextEta, state: "PREPARING" };
        }
        // PREPARING → ACTIVE GREEN (configurable window, default 30s)
        if (j.state === "PREPARING" && nextEta <= settings.activeWindow) {
          pushNotification("success", `Green Active – Junction ${j.id}`, `${j.label} is now ACTIVE GREEN. Corridor clear.`);
          return { ...j, etaSeconds: nextEta, state: "ACTIVE GREEN", greenElapsed: 0 };
        }
        // ACTIVE GREEN → COMPLETED after ambulance passes (etaSeconds reaches 0)
        if (j.state === "ACTIVE GREEN") {
          const nextGreenElapsed = j.greenElapsed + 1;
          if (nextEta === 0) {
            pushNotification("info", `Junction ${j.id} Completed`, `${j.label} returning to normal signal cycle.`);
            return { ...j, etaSeconds: 0, state: "COMPLETED", greenElapsed: nextGreenElapsed };
          }
          return { ...j, etaSeconds: nextEta, greenElapsed: nextGreenElapsed };
        }
        return { ...j, etaSeconds: nextEta };
      }));

      // 3. Sync corridor cleared-signal count with junction states
      setCorridors(prev => prev.map(cor => {
        if (cor.status !== "Active") return cor;
        const cleared = junctions.filter(j => j.state === "COMPLETED").length;
        const done    = cleared >= cor.totalSignals;
        return { ...cor, clearedSignals: Math.min(cleared, cor.totalSignals), status: done ? "Completed" : "Active", completedAt: done ? new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", hour12:false }) : null };
      }));

      // 4. Update hospital status based on selected ambulance ETA
      setHospitals(prev => prev.map(h => {
        // Find ambulance going to this hospital
        const matchAmb = INITIAL_AMBULANCES.find(a => a.destination === h.name);
        if (!matchAmb) return h;
        // We read from ambulances state, but we have closure over prev ambulances state
        // So we derive from the ambulance we will update
        return h; // updated in a separate effect below
      }));
    }, 1000);

    // First corridor toast
    const first = setTimeout(() => toast("Corridor recalculated", {
      description: "Junction 02 is staging for the next ETA window.",
      icon: <Sparkles size={15} className="text-[#48d7e8]" />,
    }), 1800);

    return () => { clearInterval(timer); clearTimeout(first); };
  }, [authenticated, pushNotification, settings.simEnabled, settings.simSpeed, settings.prepareWindow, settings.activeWindow]);

  // ── hospital status based on ambulance ETA ───────────────────────
  useEffect(() => {
    setHospitals(prev => prev.map(h => {
      const amb = ambulances.find(a => a.destination === h.name);
      if (!amb) return h;
      const eta = amb.currentEta;
      let status = h.status;
      let teamNotified = h.emergencyTeamNotified;
      let notifiedAt   = h.notifiedAt;

      if (eta <= 0) {
        status = "Ready";
      } else if (eta <= 120 && status !== "Ready") {
        status = "Ready";
        if (!teamNotified) {
          teamNotified = true;
          notifiedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
          pushNotification("success", `${h.shortName} Ready`, `${h.name} trauma bay ready. Team notified.`);
        }
      } else if (eta <= 300 && status === "Standby") {
        status = "Preparing";
        if (!teamNotified) {
          teamNotified = true;
          notifiedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
          pushNotification("info", `${h.shortName} Preparing`, `${h.name} notified. Preparing trauma bay.`);
        }
      } else if (eta <= 600 && status === "Standby") {
        status = "Acknowledged";
      }

      return { ...h, status, emergencyTeamNotified: teamNotified, notifiedAt };
    }));
  }, [ambulances, pushNotification]);

  // ── signal control handlers ──────────────────────────────────────
  const handleReturnToNormal = (junctionId: string) => {
    setJunctions(prev => prev.map(j =>
      j.id === junctionId
        ? { ...j, state: "NORMAL" as SignalState }
        : j
    ));
    toast.success("Signal returned to normal", {
      description: `Junction ${junctionId} reverted to standard signal cycle.`,
    });
    pushNotification("info", `Junction ${junctionId} Reset`, `${junctionId} returned to normal signal cycle by operator.`);
  };

  const handleExtendGreen = (junctionId: string) => {
    setJunctions(prev => prev.map(j =>
      j.id === junctionId
        ? { ...j, greenDuration: j.greenDuration + settings.extendStep, etaSeconds: j.etaSeconds + settings.extendStep }
        : j
    ));
    toast.success(`Green window extended by ${settings.extendStep} seconds`, {
      description: `Junction ${junctionId} green phase extended.`,
    });
    pushNotification("success", `Green Extended – Junction ${junctionId}`, `Green window extended by ${settings.extendStep}s at Junction ${junctionId}.`);
  };

  const handleManualOverride = (junctionId: string) => {
    setOverrideJunctionId(junctionId);
  };

  const confirmOverride = () => {
    if (!overrideJunctionId) return;
    setJunctions(prev => prev.map(j =>
      j.id === overrideJunctionId
        ? { ...j, state: "ACTIVE GREEN" as SignalState }
        : j
    ));
    toast.success("Manual override applied", {
      description: `Junction ${overrideJunctionId} forced to ACTIVE GREEN.`,
    });
    pushNotification("warning", `Manual Override – Junction ${overrideJunctionId}`, `Operator forced ACTIVE GREEN on Junction ${overrideJunctionId}. Automation suspended.`);
    setOverrideJunctionId(null);
  };

  // ── ambulance selection ──────────────────────────────────────────
  const handleSelectAmbulance = (id: string) => {
    setSelectedId(id);
    const amb = ambulances.find(a => a.id === id);
    if (amb) toast.info(`${id} selected`, { description: `Opening live telemetry for ${amb.destination}.` });
  };

  // ── operator profile — kept in sync with settings context ────────
  // Read from settings so header always reflects saved profile.
  const profile = {
    name:  settings.operatorName,
    email: settings.email,
    shift: settings.shift,
  };
  const setProfile = (p: { name: string; email: string; shift: string }) => {
    commitSettings({ ...settings, operatorName: p.name, email: p.email, shift: p.shift });
  };

  // ── notification handlers ────────────────────────────────────────
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ── render: login gate ───────────────────────────────────────────
  if (!authenticated) return <LoginScreen onAuthenticated={() => setAuthenticated(true)} />;

  // ── render: dashboard ────────────────────────────────────────────
  return (
    <div className={`lifelane-shell flex min-h-screen${settings.reducedMotion ? " motion-reduce" : ""}`}>
      {/* ── sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[246px] shrink-0 -translate-x-full flex-col border-r border-white/[.08] bg-[#08131a] px-4 py-5 transition-transform duration-300 lg:relative lg:translate-x-0 ${mobileNav ? "translate-x-0" : ""}`}>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[#48d7e8]/30 bg-[#0d2931]">
              <span className="absolute h-px w-8 rotate-[40deg] bg-[#48d7e8]"/>
              <span className="absolute h-px w-8 -rotate-[40deg] bg-[#48d7e8]"/>
              <span className="relative h-2.5 w-2.5 rotate-45 border-r-2 border-t-2 border-white"/>
            </div>
            <div>
              <p className="text-[17px] font-bold tracking-[.13em] text-white">LIFELANE</p>
              <p className="mono text-[8px] tracking-[.16em] text-[#6f9099]">CITY RESPONSE SYSTEM</p>
            </div>
          </div>
          <button className="text-[#78959d] lg:hidden" onClick={() => setMobileNav(false)}><X size={18}/></button>
        </div>

        <div className="mt-10 px-2">
          <p className="mono mb-3 text-[9px] uppercase tracking-[.18em] text-[#52727b]">Operations</p>
          {navItems.map(({ label, icon: Icon }) => {
            const active = activeSection === label;
            return (
              <button
                key={label}
                onClick={() => { setActiveSection(label); setMobileNav(false); }}
                className={`group mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition-all
                  ${active
                    ? "border border-[#48d7e8]/20 bg-[#48d7e8]/[.09] text-[#e7fdff] shadow-[inset_3px_0_0_#48d7e8]"
                    : "text-[#809ba3] hover:bg-white/[.04] hover:text-[#dcecef]"}`}
              >
                <Icon size={16} strokeWidth={active ? 2 : 1.6} className={active ? "text-[#48d7e8]" : "text-[#6d8991] group-hover:text-[#48d7e8]"} />
                {label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#48d7e8] beacon" />}
              </button>
            );
          })}
        </div>

        <div className="mt-auto rounded-xl border border-[#48d7e8]/15 bg-[#48d7e8]/[.045] p-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#5be6a8]"/>
            <span className="mono text-[9px] uppercase tracking-[.12em] text-[#9cc0c5]">Network protected</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-[#6f8e96]">All corridors are encrypted and monitored across the city grid.</p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[82%] rounded-full bg-[#48d7e8]"/>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between px-2 mono text-[9px] text-[#4e6d76]">
          <span>v2.4.08</span><span>OPS-01</span>
        </div>
      </aside>

      {mobileNav && <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}

      {/* ── main ── */}
      <main className="min-w-0 flex-1 pb-[64px] lg:pb-0">
        {/* header */}
        <header className="flex h-[72px] items-center justify-between border-b border-white/[.08] bg-[#071017]/80 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-white/10 p-2 text-[#8ca8af] lg:hidden" onClick={() => setMobileNav(true)}><Menu size={18}/></button>
            <div>
              <p className="mono text-[9px] uppercase tracking-[.18em] text-[#48d7e8]">Live corridor orchestration</p>
              <h1 className="mt-1 text-lg font-semibold tracking-[-.025em] text-white sm:text-xl">Emergency traffic state is active.</h1>
              <p className="mono mt-1 text-[9px] uppercase tracking-[.1em] text-[#6f8e96]">
                {ambulances.filter(a => a.currentEta > 0).length} events · {junctions.filter(j => j.state === "ACTIVE GREEN").length} corridors · metro grid synchronized
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#5be6a8] beacon"/>
              <span className="mono text-[10px] uppercase tracking-[.12em] text-[#acd2d5]">System online</span>
            </div>
            <div className="hidden h-5 w-px bg-white/10 sm:block"/>
            <div className="mono hidden items-center gap-2 text-[11px] text-[#89a5ac] md:flex">
              <Clock3 size={14} className="text-[#48d7e8]"/>
              {clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </div>
            {/* notification bell */}
            <button
              onClick={() => setShowNotifications(v => !v)}
              className="relative rounded-lg border border-white/10 bg-white/[.025] p-2.5 text-[#91aab0] transition-colors hover:text-white"
            >
              <Bell size={16}/>
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#ff806e]"/>
              )}
            </button>
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#48d7e8]/25 bg-[#12333b] text-xs font-semibold text-[#9beaf0]">
                {profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-white">{profile.name}</p>
                <p className="mono text-[9px] text-[#6f8e96]">ADMIN · {profile.shift.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* content area — switches by nav section */}
        <div className="mx-auto max-w-[1560px] px-4 py-5 sm:px-7 sm:py-7">
          {activeSection === "Ambulances" ? (
            <AmbulancesPage ambulances={ambulances} />
          ) : activeSection === "Traffic Signals" ? (
            <TrafficSignalsPage signals={signals} onSignalChange={setSignals} />
          ) : activeSection === "Green Corridors" ? (
            <GreenCorridorsPage corridors={corridors} ambulances={ambulances} />
          ) : activeSection === "Hospitals" ? (
            <HospitalsPage hospitals={hospitals} ambulances={ambulances} />
          ) : activeSection === "Analytics" ? (
            <AnalyticsPage />
          ) : activeSection === "Settings" ? (
            <SettingsPage profile={profile} onProfileChange={setProfile} />
          ) : activeSection === "Live Operations" ? (
            <LiveOperationsPage
              ambulances={ambulances}
              junctions={junctions}
              signals={signals}
              notifications={notifications}
              selectedId={selectedId}
              onSelectAmbulance={handleSelectAmbulance}
            />
          ) : (
            <>
              {/* KPI cards */}
              <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <MetricCard icon={Siren}     label="Active emergencies"    value={String(ambulances.filter(a => a.currentEta > 0).length).padStart(2, "0")} detail="1 critical response" accent="coral"/>
                <MetricCard icon={Ambulance} label="Active ambulances"     value="12"  detail="3 units in motion"/>
                <MetricCard icon={Navigation} label="Active green corridors" value={String(junctions.filter(j => j.state === "ACTIVE GREEN").length).padStart(2, "0")} detail="Junctions synchronized" accent="green"/>
                <MetricCard icon={Timer}     label="Average time saved"    value="07:42" detail="+18% vs. baseline"/>
              </div>

              {/* main grid */}
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(350px,.8fr)]">
                {/* left: map + timeline */}
                <section className="min-w-0">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">Live operations / metro grid</p>
                      <h2 className="mt-1 text-xl font-semibold tracking-[-.03em] text-white sm:text-2xl">Corridor overview</h2>
                    </div>
                    <StatusPill tone="green">Realtime feed</StatusPill>
                  </div>
                  <LiveMap ambulance={selectedAmbulance} junctions={junctions} />
                  <div className="mt-5">
                    <CorridorTimeline junctions={junctions} />
                  </div>
                </section>

                {/* right: ambulance + signal + hospital */}
                <aside className="space-y-5">
                  <AmbulanceCard
                    ambulance={selectedAmbulance}
                    onViewDetails={() => setShowDetails(true)}
                  />
                  <SignalControl
                    junctions={junctions}
                    onReturnToNormal={handleReturnToNormal}
                    onExtendGreen={handleExtendGreen}
                    onManualOverride={handleManualOverride}
                  />
                  <HospitalCard hospital={selectedHospital} ambulance={selectedAmbulance} />
                </aside>
              </div>

              {/* Active Emergencies table */}
              <section className="mt-5 panel rounded-xl p-4 sm:p-5">
                <SectionTitle eyebrow="Response queue" title="Active Emergencies" action="Emergency queue" />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left">
                    <thead>
                      <tr className="border-b border-white/[.07] mono text-[9px] uppercase tracking-[.14em] text-[#6f8e96]">
                        <th className="pb-3 pl-2 font-normal">Priority</th>
                        <th className="pb-3 font-normal">Ambulance ID</th>
                        <th className="pb-3 font-normal">Destination</th>
                        <th className="pb-3 font-normal">ETA</th>
                        <th className="pb-3 font-normal">Status</th>
                        <th className="pb-3 pr-2 text-right font-normal">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ambulances.map(row => (
                        <tr
                          key={row.id}
                          onClick={() => handleSelectAmbulance(row.id)}
                          className={`border-b border-white/[.05] text-xs last:border-0 cursor-pointer transition-colors
                            ${row.id === selectedId ? "bg-[#48d7e8]/[.04]" : "hover:bg-white/[.018]"}`}
                        >
                          <td className="py-3.5 pl-2">
                            <span className={`mono text-[10px] font-semibold ${row.priority === "P1" ? "text-[#ff806e]" : row.priority === "P2" ? "text-[#f5ba69]" : "text-[#48d7e8]"}`}>
                              {row.priority}
                            </span>
                          </td>
                          <td className="py-3.5 mono text-[#dcecef]">
                            <span className="flex items-center gap-1.5">
                              {row.id === selectedId && <span className="h-1.5 w-1.5 rounded-full bg-[#48d7e8] beacon" />}
                              {row.id}
                            </span>
                          </td>
                          <td className="py-3.5 text-[#abc4c9]">{row.destination}</td>
                          <td className="py-3.5 mono text-[#48d7e8]">{fmtEta(row.currentEta)}</td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full ${row.tone === "coral" ? "bg-[#ff806e] beacon" : row.tone === "amber" ? "bg-[#f5ba69]" : "bg-[#48d7e8]"}`} />
                              <StatusPill tone={row.tone as any}>{row.status}</StatusPill>
                            </div>
                          </td>
                          <td className="py-3.5 pr-2 text-right">
                            <button
                              onClick={e => { e.stopPropagation(); handleSelectAmbulance(row.id); setShowDetails(true); }}
                              className="rounded-md p-1.5 text-[#708e96] transition-colors hover:bg-white/5 hover:text-[#48d7e8]"
                              title="View live details"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* footer */}
              <footer className="flex flex-col gap-2 py-5 mono text-[9px] uppercase tracking-[.1em] text-[#4f6e77] sm:flex-row sm:items-center sm:justify-between">
                <span>Signal Noir interface · LIFELANE operations network</span>
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#5be6a8]"/>All systems nominal</span>
              </footer>
            </>
          )}
        </div>
      </main>

      {/* ── overlays ── */}
      {showNotifications && (
        <NotificationsPanel
          notifications={notifications}
          onMarkAll={handleMarkAllRead}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {overrideJunctionId && (
        <ManualOverrideModal
          junctionId={overrideJunctionId}
          onConfirm={confirmOverride}
          onCancel={() => setOverrideJunctionId(null)}
        />
      )}

      {showDetails && (
        <LiveDetailsModal
          ambulance={selectedAmbulance}
          junctions={junctions}
          hospital={selectedHospital}
          onClose={() => setShowDetails(false)}
        />
      )}

      {/* ── Mobile bottom navigation bar ── */}
      {/* Visible only below lg breakpoint, sits above safe-area */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex lg:hidden border-t border-white/[.08] bg-[#08131a]/95 backdrop-blur-xl"
           style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {([ 
          { label: "Command Center",  icon: LayoutDashboard },
          { label: "Live Operations", icon: Radio },
          { label: "Ambulances",      icon: Ambulance },
          { label: "Hospitals",       icon: Hospital },
          { label: "Settings",        icon: Settings },
        ] as { label: NavSection; icon: any }[]).map(({ label, icon: Icon }) => {
          const active = activeSection === label;
          return (
            <button
              key={label}
              onClick={() => setActiveSection(label)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors
                ${active ? "text-[#48d7e8]" : "text-[#4e6d76] hover:text-[#8cb5bc]"}`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
              <span className={`mono text-[8px] uppercase tracking-[.06em] leading-none ${active ? "text-[#48d7e8]" : "text-[#4e6d76]"}`}>
                {label === "Command Center" ? "Home" :
                 label === "Live Operations" ? "Live" :
                 label === "Ambulances" ? "Fleet" :
                 label === "Hospitals" ? "Hospitals" : "Settings"}
              </span>
              {active && <span className="h-0.5 w-4 rounded-full bg-[#48d7e8] mt-0.5" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
