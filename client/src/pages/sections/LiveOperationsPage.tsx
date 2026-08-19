// ─────────────────────────────────────────────────────────────────
// LifeLane – Live Operations Page
// Real-time emergency operations monitor. All data flows from the
// shared Home state so selecting a mission here updates the whole app.
// ─────────────────────────────────────────────────────────────────
import {
  Ambulance, Signal, Navigation, Clock3, Gauge, MapPin,
  Radio, Crosshair, Activity, ChevronRight, Wifi, WifiOff,
  AlertTriangle, CheckCircle2, Info, Zap,
} from "lucide-react";
import { fmtEta, signalTone, junctionStateLabel, type Ambulance as AmbulanceType, type Junction, type SignalNode, type Notification } from "../../data/mockData";

// ── shared primitives ─────────────────────────────────────────────
function Pill({ children, tone }: { children: React.ReactNode; tone: "coral"|"amber"|"cyan"|"green"|"muted" }) {
  const c = { coral:"border-[#ff806e]/25 bg-[#ff806e]/[.08] text-[#ff9688]", amber:"border-[#f5ba69]/25 bg-[#f5ba69]/[.08] text-[#f5ba69]", cyan:"border-[#48d7e8]/25 bg-[#48d7e8]/[.08] text-[#72e2ed]", green:"border-[#5be6a8]/25 bg-[#5be6a8]/[.08] text-[#5be6a8]", muted:"border-white/10 bg-white/[.04] text-[#92aab0]" };
  const dot = { coral:"bg-[#ff806e]", amber:"bg-[#f5ba69]", cyan:"bg-[#48d7e8]", green:"bg-[#5be6a8]", muted:"bg-[#92aab0]" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 mono text-[9px] uppercase tracking-[.08em] ${c[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`}/>{children}
    </span>
  );
}

function SectionHead({ eyebrow, title, right }: { eyebrow: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">{eyebrow}</p>
        <h3 className="mt-1 text-[17px] font-semibold tracking-[-.02em] text-white">{title}</h3>
      </div>
      {right}
    </div>
  );
}

// ── ETA Progress bar ──────────────────────────────────────────────
function EtaBar({ current, initial, color }: { current: number; initial: number; color: string }) {
  const pct = initial > 0 ? Math.max(2, ((initial - current) / initial) * 100) : 100;
  return (
    <div className="mt-2 h-1 rounded-full bg-white/[.07] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ── Mission Card ──────────────────────────────────────────────────
function MissionCard({ amb, isSelected, onClick }: { amb: AmbulanceType; isSelected: boolean; onClick: () => void }) {
  const active = amb.currentEta > 0;
  const toneMap: Record<string, "coral"|"amber"|"cyan"|"green"|"muted"> = {
    "Emergency active": "coral", "En route": "amber", "Preparing route": "amber",
    "Monitoring": "cyan", "Available": "green", "Completed": "muted", "Offline": "muted",
  };
  const tone = toneMap[amb.status] ?? "cyan";
  const barColor = tone === "coral" ? "#ff806e" : tone === "amber" ? "#f5ba69" : tone === "green" ? "#5be6a8" : "#48d7e8";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all group
        ${isSelected
          ? "border-[#48d7e8]/45 bg-[#48d7e8]/[.05] shadow-[0_0_20px_rgba(72,215,232,.06)]"
          : tone === "coral"
            ? "border-[#ff806e]/20 bg-[#ff806e]/[.025] hover:border-[#ff806e]/35"
            : "border-white/[.07] bg-white/[.015] hover:border-white/15 hover:bg-white/[.03]"}`}
    >
      {/* top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl border p-2.5 shrink-0 transition-colors
            ${tone === "coral" ? "border-[#ff806e]/25 bg-[#ff806e]/10 text-[#ff806e]"
            : tone === "amber" ? "border-[#f5ba69]/25 bg-[#f5ba69]/10 text-[#f5ba69]"
            : tone === "green" ? "border-[#5be6a8]/25 bg-[#5be6a8]/10 text-[#5be6a8]"
            : "border-[#48d7e8]/20 bg-[#48d7e8]/[.08] text-[#48d7e8]"}`}>
            <Ambulance size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm">{amb.id}</span>
              {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#48d7e8] beacon" />}
            </div>
            <p className="mono text-[10px] text-[#76939c] mt-0.5">
              {amb.gpsLocked ? <span className="text-[#5be6a8]">GPS LOCKED</span> : <span className="text-[#f5ba69]">GPS ACQUIRING</span>}
              {" · "}{amb.zone} zone
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`mono text-[11px] font-bold ${amb.priority === "P1" ? "text-[#ff806e]" : amb.priority === "P2" ? "text-[#f5ba69]" : "text-[#48d7e8]"}`}>
            {amb.priority}
          </span>
          <Pill tone={tone}>{amb.status}</Pill>
        </div>
      </div>

      {/* telemetry grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="rounded-lg border border-white/[.06] bg-white/[.02] px-3 py-2">
          <p className="mono text-[9px] uppercase text-[#76939c]">ETA</p>
          <p className={`mt-0.5 text-sm font-semibold ${active ? "text-[#48d7e8]" : "text-[#76939c]"}`}>{active ? fmtEta(amb.currentEta) : "—"}</p>
        </div>
        <div className="rounded-lg border border-white/[.06] bg-white/[.02] px-3 py-2">
          <p className="mono text-[9px] uppercase text-[#76939c]">Speed</p>
          <p className="mt-0.5 text-sm font-semibold text-white mono">{active ? `${Math.round(amb.speed)} km/h` : "—"}</p>
        </div>
        <div className="rounded-lg border border-white/[.06] bg-white/[.02] px-3 py-2">
          <p className="mono text-[9px] uppercase text-[#76939c]">Distance</p>
          <p className="mt-0.5 text-sm font-semibold text-white mono">{active ? `${amb.distance.toFixed(1)} km` : "—"}</p>
        </div>
      </div>

      {/* destination + ETA bar */}
      <div className="flex items-center gap-2 text-xs text-[#abc4c9]">
        <MapPin size={11} className="text-[#5be6a8] shrink-0" />
        <span className="truncate">{active ? amb.destination : "—"}</span>
      </div>
      {active && <EtaBar current={amb.currentEta} initial={amb.initialEta} color={barColor} />}

      {/* crew */}
      <p className="mt-2 mono text-[9px] text-[#56737a] truncate">{amb.crew !== "—" ? amb.crew : "No crew assigned"}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="mono text-[9px] text-[#4e6d76]">Last sync {amb.lastSync}</span>
        <ChevronRight size={13} className={`transition-all ${isSelected ? "text-[#48d7e8] translate-x-0.5" : "text-[#4e6d76] group-hover:text-[#76939c]"}`} />
      </div>
    </button>
  );
}

// ── Signal Row ────────────────────────────────────────────────────
function SignalRow({ node }: { node: SignalNode }) {
  const tone = signalTone(node.state);
  const dotColor = tone === "green" ? "bg-[#5be6a8]" : tone === "amber" ? "bg-[#f5ba69]" : tone === "coral" ? "bg-[#ff806e]" : tone === "muted" ? "bg-[#92aab0]" : "bg-[#48d7e8]";
  const glowClass = node.state === "ACTIVE GREEN" ? "beacon" : "";
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[.05] last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor} ${glowClass}`} />
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#dcecef] truncate">{node.name}</p>
          <p className="mono text-[9px] text-[#56737a]">{node.zone} zone</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-2">
        {node.priorityFor && (
          <span className="mono text-[9px] text-[#ff806e]">{node.priorityFor}</span>
        )}
        <Pill tone={tone as any}>{node.state}</Pill>
      </div>
    </div>
  );
}

// ── Notification Row ──────────────────────────────────────────────
function NotifRow({ n }: { n: Notification }) {
  const icon = n.type === "critical" ? <AlertTriangle size={12} className="text-[#ff806e]" />
             : n.type === "warning"  ? <AlertTriangle size={12} className="text-[#f5ba69]" />
             : n.type === "success"  ? <CheckCircle2  size={12} className="text-[#5be6a8]" />
             : <Info size={12} className="text-[#48d7e8]" />;
  return (
    <div className={`flex items-start gap-3 py-2.5 border-b border-white/[.05] last:border-0 ${!n.read ? "opacity-100" : "opacity-60"}`}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[11px] font-medium ${!n.read ? "text-white" : "text-[#9bb4b9]"}`}>{n.title}</p>
          <span className="mono text-[9px] text-[#4e6d76] shrink-0">{n.time}</span>
        </div>
        <p className="mt-0.5 text-[10px] text-[#76939c] leading-snug">{n.body}</p>
      </div>
      {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#48d7e8] shrink-0" />}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────
export default function LiveOperationsPage({
  ambulances,
  junctions,
  signals,
  notifications,
  selectedId,
  onSelectAmbulance,
}: {
  ambulances: AmbulanceType[];
  junctions: Junction[];
  signals: SignalNode[];
  notifications: Notification[];
  selectedId: string;
  onSelectAmbulance: (id: string) => void;
}) {
  // Only missions that are actively dispatched (ETA > 0)
  const missions = ambulances.filter(a => a.currentEta > 0);

  // Priority signals (in active corridor mode)
  const prioritySignals = signals.filter(s => s.state === "ACTIVE GREEN" || s.state === "PREPARING");
  const normalSignals   = signals.filter(s => s.state === "NORMAL");
  const offlineSignals  = signals.filter(s => s.state === "OFFLINE");

  const activeCorridors = junctions.filter(j => j.state === "ACTIVE GREEN" || j.state === "PREPARING").length;

  return (
    <div className="space-y-5">
      {/* page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">Live dispatch feed</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-.03em] text-white">Live Operations</h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.025] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#5be6a8] beacon" />
          <span className="mono text-[10px] uppercase tracking-[.12em] text-[#acd2d5]">System online</span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { icon: Ambulance,  label: "Active missions",      value: String(missions.length).padStart(2,"0"),         accent: "coral" },
          { icon: Navigation, label: "Active corridors",     value: String(activeCorridors).padStart(2,"0"),          accent: "green" },
          { icon: Signal,     label: "Priority signals",     value: String(prioritySignals.length).padStart(2,"0"),   accent: "amber" },
          { icon: Radio,      label: "Offline nodes",        value: String(offlineSignals.length).padStart(2,"0"),    accent: "muted" },
        ].map(c => (
          <div key={c.label} className="panel panel-hover relative overflow-hidden rounded-xl p-4 sm:p-5">
            <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-[#48d7e8]/5 blur-2xl" />
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="mono text-[10px] uppercase tracking-[.16em] text-[#76939c]">{c.label}</p>
                <p className="mt-2 text-[28px] font-semibold tracking-tight text-white">{c.value}</p>
              </div>
              <div className={`rounded-lg border border-white/10 bg-white/[.035] p-2
                ${c.accent === "coral" ? "text-[#ff806e]" : c.accent === "green" ? "text-[#5be6a8]" : c.accent === "amber" ? "text-[#f5ba69]" : "text-[#92aab0]"}`}>
                <c.icon size={17} strokeWidth={1.7} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[#76939c]">
              <span className={`h-1.5 w-1.5 rounded-full ${c.accent === "coral" ? "bg-[#ff806e]" : c.accent === "green" ? "bg-[#5be6a8]" : c.accent === "amber" ? "bg-[#f5ba69]" : "bg-[#92aab0]"}`} />
              {c.label}
              <span className="mono text-[9px] text-[#496d76] ml-auto">LIVE / 01s</span>
            </div>
          </div>
        ))}
      </div>

      {/* main two-column layout */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,.9fr)]">

        {/* ── LEFT: active missions ── */}
        <section className="space-y-3">
          <SectionHead
            eyebrow="Emergency dispatch"
            title="Active Emergency Missions"
            right={
              <span className="mono text-[10px] text-[#76939c]">
                {missions.length} active · click to select
              </span>
            }
          />

          {missions.length === 0 ? (
            <div className="panel rounded-xl py-12 text-center">
              <CheckCircle2 size={28} className="mx-auto text-[#5be6a8] mb-3 opacity-40" />
              <p className="text-sm text-[#76939c]">No active emergency missions</p>
              <p className="mono text-[10px] text-[#4e6d76] mt-1">All units standing by</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {missions.map(amb => (
                <MissionCard
                  key={amb.id}
                  amb={amb}
                  isSelected={amb.id === selectedId}
                  onClick={() => onSelectAmbulance(amb.id)}
                />
              ))}
            </div>
          )}

          {/* corridor junction state for selected ambulance */}
          {junctions.length > 0 && (
            <div className="panel rounded-xl p-4 sm:p-5 mt-2">
              <SectionHead eyebrow="Active corridor · selected unit" title="Junction Status" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {junctions.map(j => {
                  const tone = signalTone(j.state);
                  const label = junctionStateLabel(j.state);
                  return (
                    <div key={j.id} className={`rounded-lg border px-3 py-3 transition-all
                      ${tone === "green" ? "border-[#5be6a8]/25 bg-[#5be6a8]/[.04]" : tone === "amber" ? "border-[#f5ba69]/20 bg-[#f5ba69]/[.03]" : "border-white/[.07] bg-white/[.015]"}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0
                          ${tone === "green" ? "bg-[#5be6a8] beacon" : tone === "amber" ? "bg-[#f5ba69]" : tone === "muted" ? "bg-[#92aab0]" : "bg-[#48d7e8]"}`} />
                        <span className="mono text-[10px] text-[#76939c]">{j.label}</span>
                      </div>
                      <p className={`mono text-[9px] uppercase tracking-[.06em] font-medium
                        ${tone === "green" ? "text-[#5be6a8]" : tone === "amber" ? "text-[#f5ba69]" : tone === "muted" ? "text-[#76939c]" : "text-[#48d7e8]"}`}>
                        {label}
                      </p>
                      <p className="mono text-[9px] text-[#4e6d76] mt-0.5">{j.distance}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ── RIGHT: signals feed + notifications ── */}
        <aside className="space-y-5">

          {/* priority signal feed */}
          <div className="panel rounded-xl p-4 sm:p-5">
            <SectionHead
              eyebrow="Signal mesh"
              title="Priority Signals"
              right={<span className="mono text-[9px] text-[#76939c]">{prioritySignals.length} active</span>}
            />
            {prioritySignals.length === 0 ? (
              <p className="text-xs text-[#76939c] py-2">No signals in priority mode.</p>
            ) : (
              prioritySignals.map(s => <SignalRow key={s.id} node={s} />)
            )}
            {normalSignals.length > 0 && (
              <>
                <p className="mono text-[9px] uppercase tracking-[.1em] text-[#4e6d76] mt-3 mb-1">Normal cycle</p>
                {normalSignals.slice(0, 3).map(s => <SignalRow key={s.id} node={s} />)}
                {normalSignals.length > 3 && (
                  <p className="mono text-[9px] text-[#4e6d76] mt-1.5">+{normalSignals.length - 3} more on normal cycle</p>
                )}
              </>
            )}
          </div>

          {/* live event log */}
          <div className="panel rounded-xl p-4 sm:p-5">
            <SectionHead
              eyebrow="System alerts"
              title="Live Event Log"
              right={
                notifications.filter(n => !n.read).length > 0
                  ? <span className="mono text-[9px] bg-[#ff806e] text-white px-1.5 py-0.5 rounded-full">{notifications.filter(n => !n.read).length} new</span>
                  : undefined
              }
            />
            <div className="max-h-[340px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-[#76939c] py-2">No events logged.</p>
              ) : notifications.slice(0, 12).map(n => <NotifRow key={n.id} n={n} />)}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
