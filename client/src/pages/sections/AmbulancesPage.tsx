import { useState } from "react";
import {
  Ambulance, Search, MapPin, Gauge, Clock3, User, Wifi, WifiOff,
  ChevronRight, X, Activity, Navigation, Crosshair,
} from "lucide-react";
import { fmtEta, type Ambulance as AmbulanceType } from "../../data/mockData";

// ── shared mini-components ────────────────────
function Pill({ children, tone }: { children: React.ReactNode; tone: "coral" | "amber" | "cyan" | "green" | "muted" }) {
  const c = {
    coral: "border-[#ff806e]/25 bg-[#ff806e]/[.08] text-[#ff9688]",
    amber: "border-[#f5ba69]/25 bg-[#f5ba69]/[.08] text-[#f5ba69]",
    cyan:  "border-[#48d7e8]/25 bg-[#48d7e8]/[.08] text-[#72e2ed]",
    green: "border-[#5be6a8]/25 bg-[#5be6a8]/[.08] text-[#5be6a8]",
    muted: "border-white/10 bg-white/[.04] text-[#92aab0]",
  };
  const dot = { coral:"bg-[#ff806e]", amber:"bg-[#f5ba69]", cyan:"bg-[#48d7e8]", green:"bg-[#5be6a8]", muted:"bg-[#92aab0]" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 mono text-[9px] uppercase tracking-[.08em] ${c[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`} />{children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent = "cyan" }: { icon: any; label: string; value: string; sub: string; accent?: string }) {
  const col = accent === "coral" ? "text-[#ff806e]" : accent === "green" ? "text-[#5be6a8]" : accent === "amber" ? "text-[#f5ba69]" : "text-[#48d7e8]";
  const dot = accent === "coral" ? "bg-[#ff806e]" : accent === "green" ? "bg-[#5be6a8]" : accent === "amber" ? "bg-[#f5ba69]" : "bg-[#48d7e8]";
  return (
    <div className="panel panel-hover relative overflow-hidden rounded-xl p-4 sm:p-5">
      <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-[#48d7e8]/5 blur-2xl" />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.16em] text-[#76939c]">{label}</p>
          <p className="mt-2 text-[28px] font-semibold tracking-tight text-white">{value}</p>
        </div>
        <div className={`rounded-lg border border-white/10 bg-white/[.035] p-2 ${col}`}><Icon size={17} strokeWidth={1.7} /></div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-[#76939c]">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{sub}
      </div>
    </div>
  );
}

function toneFor(status: AmbulanceType["status"]): "coral" | "amber" | "cyan" | "green" | "muted" {
  if (status === "Emergency active") return "coral";
  if (status === "En route" || status === "Preparing route") return "amber";
  if (status === "Monitoring") return "cyan";
  if (status === "Available") return "green";
  return "muted";
}

// ── Detail Panel ──────────────────────────────
function DetailPanel({ amb, onClose }: { amb: AmbulanceType; onClose: () => void }) {
  const tone = toneFor(amb.status);
  const isActive = amb.currentEta > 0;
  const rows = [
    { label: "Vehicle No.", value: amb.vehicleNumber },
    { label: "Zone",        value: amb.zone },
    { label: "Dispatched",  value: amb.dispatchedAt === "—" ? "—" : amb.dispatchedAt },
    { label: "Last Sync",   value: amb.lastSync },
    { label: "GPS",         value: amb.gpsLocked ? "Locked" : "Acquiring" },
    { label: "Speed",       value: isActive ? `${Math.round(amb.speed)} km/h` : "—" },
    { label: "Distance",    value: isActive ? `${amb.distance.toFixed(1)} km` : "—" },
    { label: "ETA",         value: isActive ? fmtEta(amb.currentEta) : "—" },
    { label: "Condition",   value: amb.patientCondition },
    { label: "Crew",        value: amb.crew },
    { label: "Destination", value: amb.destination },
  ];
  return (
    <div className="panel rounded-xl flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.07]">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl border p-2.5 ${tone === "coral" ? "border-[#ff806e]/25 bg-[#ff806e]/10 text-[#ff806e]" : tone === "amber" ? "border-[#f5ba69]/25 bg-[#f5ba69]/10 text-[#f5ba69]" : tone === "green" ? "border-[#5be6a8]/25 bg-[#5be6a8]/10 text-[#5be6a8]" : "border-white/10 bg-white/[.04] text-[#92aab0]"}`}>
            <Ambulance size={18} />
          </div>
          <div>
            <p className="mono text-[10px] uppercase tracking-[.14em] text-[#48d7e8]">Live telemetry</p>
            <h3 className="text-base font-semibold text-white">{amb.id}</h3>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg border border-white/10 p-1.5 text-[#78959d] hover:text-white"><X size={14} /></button>
      </div>

      {/* priority + status */}
      <div className="px-5 pt-4 flex items-center gap-2 flex-wrap">
        <Pill tone={tone}>{amb.status}</Pill>
        <span className={`mono text-[11px] font-semibold ${amb.priority === "P1" ? "text-[#ff806e]" : amb.priority === "P2" ? "text-[#f5ba69]" : "text-[#48d7e8]"}`}>
          {amb.priority} {amb.priority === "P1" ? "Critical" : amb.priority === "P2" ? "Urgent" : "Routine"}
        </span>
      </div>

      {/* ETA bar */}
      {isActive && (
        <div className="px-5 pt-4">
          <div className="rounded-lg border border-[#48d7e8]/15 bg-[#48d7e8]/[.04] p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="mono text-[9px] uppercase text-[#48d7e8]">ETA progress</p>
              <p className="mono text-[11px] font-semibold text-[#48d7e8]">{fmtEta(amb.currentEta)} remaining</p>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#48d7e8] transition-all duration-1000"
                style={{ width: `${Math.max(2, ((amb.initialEta - amb.currentEta) / amb.initialEta) * 100).toFixed(1)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* data rows */}
      <div className="px-5 pt-4 pb-5 grid grid-cols-2 gap-x-4 gap-y-3 overflow-y-auto">
        {rows.map(r => (
          <div key={r.label}>
            <p className="mono text-[9px] uppercase text-[#76939c]">{r.label}</p>
            <p className={`mt-0.5 text-xs font-medium ${r.label === "GPS" ? (amb.gpsLocked ? "text-[#5be6a8]" : "text-[#f5ba69]") : "text-[#dcecef]"}`}>{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────
export default function AmbulancesPage({ ambulances }: { ambulances: AmbulanceType[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selected, setSelected] = useState<AmbulanceType | null>(null);

  const statuses = ["All", "Emergency active", "En route", "Preparing route", "Monitoring", "Available", "Offline"];

  const filtered = ambulances.filter(a => {
    const matchSearch = a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.destination.toLowerCase().includes(search.toLowerCase()) ||
      a.zone.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const active   = ambulances.filter(a => a.currentEta > 0 && a.status !== "Available" && a.status !== "Offline").length;
  const available = ambulances.filter(a => a.status === "Available").length;
  const offline  = ambulances.filter(a => a.status === "Offline").length;
  const p1Count  = ambulances.filter(a => a.priority === "P1" && a.currentEta > 0).length;

  return (
    <div className="space-y-5">
      {/* page header */}
      <div>
        <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">Fleet management</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-.03em] text-white">Ambulances</h2>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard icon={Ambulance}   label="Active dispatch"    value={String(active).padStart(2,"0")}    sub="units in operation"     accent="coral" />
        <StatCard icon={Activity}    label="P1 critical"        value={String(p1Count).padStart(2,"0")}   sub="highest priority"       accent="coral" />
        <StatCard icon={Navigation}  label="Available units"    value={String(available).padStart(2,"0")} sub="ready for dispatch"     accent="green" />
        <StatCard icon={WifiOff}     label="Offline"            value={String(offline).padStart(2,"0")}   sub="maintenance / no signal" accent="muted" />
      </div>

      {/* table + detail panel */}
      <div className={`grid gap-5 ${selected ? "xl:grid-cols-[1fr_360px]" : ""}`}>
        {/* table */}
        <div className="panel rounded-xl overflow-hidden">
          {/* toolbar */}
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-white/[.07] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2 flex-1 max-w-[320px]">
              <Search size={13} className="text-[#5a7d85] shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID, destination, zone…"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#4e6d76]"
              />
              {search && <button onClick={() => setSearch("")} className="text-[#5a7d85] hover:text-white"><X size={12} /></button>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`mono px-2.5 py-1 rounded-md text-[9px] uppercase tracking-[.08em] border transition-all
                    ${statusFilter === s
                      ? "border-[#48d7e8]/40 bg-[#48d7e8]/[.12] text-[#48d7e8]"
                      : "border-white/10 bg-white/[.02] text-[#76939c] hover:text-white"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-white/[.07] mono text-[9px] uppercase tracking-[.14em] text-[#6f8e96]">
                  {["ID", "Status", "Priority", "Zone", "Speed", "Distance", "ETA", "Destination", ""].map(h => (
                    <th key={h} className={`pb-3 pt-3 px-4 font-normal text-left ${h === "" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="py-10 text-center text-sm text-[#76939c]">No ambulances match the current filter.</td></tr>
                ) : filtered.map(a => {
                  const tone = toneFor(a.status);
                  const isSelected = selected?.id === a.id;
                  return (
                    <tr
                      key={a.id}
                      onClick={() => setSelected(isSelected ? null : a)}
                      className={`border-b border-white/[.05] last:border-0 cursor-pointer text-xs transition-colors
                        ${isSelected ? "bg-[#48d7e8]/[.05]" : "hover:bg-white/[.018]"}`}
                    >
                      <td className="px-4 py-3.5 mono font-semibold text-[#dcecef] flex items-center gap-2">
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#48d7e8] beacon shrink-0" />}
                        {a.id}
                      </td>
                      <td className="px-4 py-3.5"><Pill tone={tone}>{a.status}</Pill></td>
                      <td className="px-4 py-3.5 mono font-semibold text-[11px]">
                        <span className={a.priority === "P1" ? "text-[#ff806e]" : a.priority === "P2" ? "text-[#f5ba69]" : "text-[#48d7e8]"}>
                          {a.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#abc4c9]">{a.zone}</td>
                      <td className="px-4 py-3.5 mono text-[#dcecef]">{a.currentEta > 0 ? `${Math.round(a.speed)} km/h` : "—"}</td>
                      <td className="px-4 py-3.5 mono text-[#dcecef]">{a.currentEta > 0 ? `${a.distance.toFixed(1)} km` : "—"}</td>
                      <td className="px-4 py-3.5 mono text-[#48d7e8] font-semibold">{a.currentEta > 0 ? fmtEta(a.currentEta) : "—"}</td>
                      <td className="px-4 py-3.5 text-[#abc4c9] max-w-[180px] truncate">{a.destination === "—" ? <span className="text-[#4e6d76]">—</span> : a.destination}</td>
                      <td className="px-4 py-3.5 text-right">
                        <ChevronRight size={14} className={`transition-transform ${isSelected ? "rotate-90 text-[#48d7e8]" : "text-[#4e6d76]"}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-white/[.07] mono text-[9px] text-[#4e6d76]">
            Showing {filtered.length} of {ambulances.length} units · Click a row to view details
          </div>
        </div>

        {/* detail panel */}
        {selected && (
          <DetailPanel amb={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}
