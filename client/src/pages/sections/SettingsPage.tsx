import { useState, useEffect } from "react";
import { Settings, Bell, ShieldCheck, Signal, Sliders, User, Save, RefreshCcw, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { useSettings, DEFAULTS, type AppSettings } from "../../contexts/SettingsContext";

// ── Toggle ────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full border transition-all ${checked ? "border-[#48d7e8]/50 bg-[#48d7e8]/20" : "border-white/15 bg-white/[.04]"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full border transition-all ${checked ? "left-[18px] border-[#48d7e8] bg-[#48d7e8]" : "left-0.5 border-white/30 bg-white/20"}`} />
    </button>
  );
}

// ── Select ────────────────────────────────────
function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-[#dcecef] outline-none focus:border-[#48d7e8]/40 cursor-pointer pr-7"
      >
        {options.map(o => <option key={o} value={o} className="bg-[#0e1b24]">{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-[#5a7d85] pointer-events-none" />
    </div>
  );
}

// ── NumberInput ───────────────────────────────
function NumInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number" min={min} max={max} value={value}
      onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
      className="w-20 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-[#dcecef] outline-none focus:border-[#48d7e8]/40 text-right mono"
    />
  );
}

// ── Section ───────────────────────────────────
function Section({ icon: Icon, title, eyebrow, children }: { icon: any; title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="panel rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[.07]">
        <div className="rounded-lg border border-[#48d7e8]/20 bg-[#48d7e8]/[.07] p-2 text-[#48d7e8]">
          <Icon size={15} strokeWidth={1.7} />
        </div>
        <div>
          <p className="mono text-[9px] uppercase tracking-[.16em] text-[#48d7e8]">{eyebrow}</p>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="text-[13px] text-[#dcecef]">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] text-[#76939c]">{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ── Main export ───────────────────────────────
export default function SettingsPage({
  profile,
  onProfileChange,
}: {
  profile: { name: string; email: string; shift: string };
  onProfileChange: (p: { name: string; email: string; shift: string }) => void;
}) {
  const { settings, commit, resetToDefaults } = useSettings();

  // Draft = unsaved working copy. Seeded from committed settings.
  const [draft, setDraft] = useState<AppSettings>({ ...settings });
  // Track whether draft differs from committed settings
  const [dirty, setDirty] = useState(false);

  // When committed settings change externally (e.g. reset), sync draft
  useEffect(() => {
    setDraft({ ...settings });
    setDirty(false);
  }, [settings]);

  // Helper: update a single draft field and mark dirty
  function set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setDraft(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  // Save — commit draft to context (→ localStorage) + sync profile up to Home
  const handleSave = () => {
    commit(draft);
    onProfileChange({ name: draft.operatorName, email: draft.email, shift: draft.shift });
    setDirty(false);
    toast.success("Settings saved", { description: "All changes applied and persisted." });
  };

  // Cancel — discard draft, revert to last committed settings
  const handleCancel = () => {
    setDraft({ ...settings });
    setDirty(false);
    toast.info("Changes discarded", { description: "Settings reverted to last saved state." });
  };

  // Reset — restore factory defaults in both context and draft
  const handleReset = () => {
    resetToDefaults();
    onProfileChange({ name: DEFAULTS.operatorName, email: DEFAULTS.email, shift: DEFAULTS.shift });
    toast.info("Settings reset to defaults", { description: "Factory defaults restored and saved." });
  };

  // Simulation reset (just a toast for now — Home handles state reset)
  const handleSimReset = () => {
    toast.info("Simulation reset", { description: "All ambulances and corridors reset to initial state." });
  };

  const initials = draft.operatorName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5 max-w-[860px]">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">System configuration</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-.03em] text-white">Settings</h2>
        </div>
      <div className="flex flex-wrap gap-2 items-center">
          {dirty && (
            <span className="mono text-[9px] uppercase tracking-[.08em] text-[#f5ba69] flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f5ba69]" /> Unsaved changes
            </span>
          )}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-[11px] text-[#9bb4b9] hover:text-white transition-all"
          >
            <RefreshCcw size={12} /> Reset defaults
          </button>
          {dirty && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-[11px] text-[#9bb4b9] hover:text-white transition-all"
            >
              <X size={12} /> Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="flex items-center gap-1.5 rounded-lg border border-[#48d7e8]/30 bg-[#48d7e8]/[.08] px-4 py-2 text-[11px] text-[#48d7e8] hover:bg-[#48d7e8]/[.15] transition-all font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={12} /> Save changes
          </button>
        </div>
      </div>

      {/* ── System Preferences ── */}
      <Section icon={Settings} eyebrow="Display & system" title="System Preferences">
        <Row label="Reduced motion" sub="Disable animations for accessibility">
          <Toggle checked={draft.reducedMotion} onChange={v => set("reducedMotion", v)} />
        </Row>
        <Row label="Auto-save state" sub="Persist operator selections between sessions">
          <Toggle checked={draft.autoSave} onChange={v => set("autoSave", v)} />
        </Row>
        <div className="h-px bg-white/[.06]" />
        <Row label="Telemetry refresh rate" sub="How often live data updates">
          <Select value={draft.telemetryRate} options={["0.5s", "1s", "2s", "5s"]} onChange={v => set("telemetryRate", v as AppSettings["telemetryRate"])} />
        </Row>
        <Row label="Map style" sub="Visual theme for the city grid view">
          <Select value={draft.mapStyle} options={["Signal Noir", "Satellite overlay", "Monochrome", "High contrast"]} onChange={v => set("mapStyle", v)} />
        </Row>
        <Row label="Language" sub="Interface language">
          <Select value={draft.language} options={["English", "Hindi", "Marathi"]} onChange={v => set("language", v)} />
        </Row>
      </Section>

      {/* ── Notifications ── */}
      <Section icon={Bell} eyebrow="Alerts & notifications" title="Notification Settings">
        <Row label="Alert sounds" sub="Play audio on critical events">
          <Toggle checked={draft.alertSound} onChange={v => set("alertSound", v)} />
        </Row>
        <div className="h-px bg-white/[.06]" />
        <Row label="P1 critical alerts" sub="Cardiac arrest, life-threatening">
          <Toggle checked={draft.p1Alerts} onChange={v => set("p1Alerts", v)} />
        </Row>
        <Row label="P2 urgent alerts" sub="Fractures, strokes, urgent cases">
          <Toggle checked={draft.p2Alerts} onChange={v => set("p2Alerts", v)} />
        </Row>
        <Row label="P3 routine alerts" sub="Non-critical monitoring">
          <Toggle checked={draft.p3Alerts} onChange={v => set("p3Alerts", v)} />
        </Row>
        <div className="h-px bg-white/[.06]" />
        <Row label="Signal state change alerts">
          <Toggle checked={draft.signalAlerts} onChange={v => set("signalAlerts", v)} />
        </Row>
        <Row label="Hospital status alerts">
          <Toggle checked={draft.hospitalAlerts} onChange={v => set("hospitalAlerts", v)} />
        </Row>
        <Row label="Alert delivery channel" sub="How notifications are delivered">
          <Select value={draft.alertChannel} options={["In-app + Toast", "In-app only", "Toast only", "Email + In-app"]} onChange={v => set("alertChannel", v)} />
        </Row>
      </Section>

      {/* ── Emergency Priority Rules ── */}
      <Section icon={ShieldCheck} eyebrow="Dispatch rules" title="Emergency Priority Rules">
        <Row label="Corridor mode" sub="How corridors are activated">
          <Select value={draft.corridorMode} options={["Fully automated", "Semi-automated", "Manual only"]} onChange={v => set("corridorMode", v)} />
        </Row>
        <Row label="Priority algorithm" sub="How ambulances are ranked">
          <Select value={draft.priorityMode} options={["ETA-based", "Priority-first", "Distance-based", "Mixed"]} onChange={v => set("priorityMode", v)} />
        </Row>
        <div className="h-px bg-white/[.06]" />
        <Row label="P1 green window duration (s)" sub="Seconds signal stays green for P1">
          <NumInput value={draft.p1GreenDuration} min={15} max={120} onChange={v => set("p1GreenDuration", v)} />
        </Row>
        <Row label="P2 green window duration (s)" sub="Seconds signal stays green for P2">
          <NumInput value={draft.p2GreenDuration} min={15} max={90} onChange={v => set("p2GreenDuration", v)} />
        </Row>
        <Row label="P3 green window duration (s)" sub="Seconds signal stays green for P3">
          <NumInput value={draft.p3GreenDuration} min={10} max={60} onChange={v => set("p3GreenDuration", v)} />
        </Row>
        <div className="h-px bg-white/[.06]" />
        <Row label="Auto override on P1" sub="Automatically force green on P1 corridor">
          <Toggle checked={draft.autoOverride} onChange={v => set("autoOverride", v)} />
        </Row>
      </Section>

      {/* ── Signal Control Rules ── */}
      <Section icon={Signal} eyebrow="Junction automation" title="Signal Control Rules">
        <Row label="PREPARING trigger window (s)" sub="Seconds before arrival to start preparing">
          <NumInput value={draft.prepareWindow} min={30} max={180} onChange={v => set("prepareWindow", v)} />
        </Row>
        <Row label="ACTIVE GREEN trigger window (s)" sub="Seconds before arrival to activate green">
          <NumInput value={draft.activeWindow} min={10} max={60} onChange={v => set("activeWindow", v)} />
        </Row>
        <Row label="Extend green step (s)" sub="Duration added per Extend Green action">
          <NumInput value={draft.extendStep} min={10} max={120} onChange={v => set("extendStep", v)} />
        </Row>
        <div className="h-px bg-white/[.06]" />
        <Row label="Auto-reset after ambulance passes" sub="Return signal to normal automatically">
          <Toggle checked={draft.autoReset} onChange={v => set("autoReset", v)} />
        </Row>
        <Row label="Conflict resolution" sub="When two corridors share a junction">
          <Select value={draft.conflictMode} options={["Highest priority wins", "FIFO", "Operator decision", "Shortest ETA"]} onChange={v => set("conflictMode", v)} />
        </Row>
      </Section>

      {/* ── Simulation Controls ── */}
      <Section icon={Sliders} eyebrow="Demo environment" title="Simulation Controls">
        <Row label="Simulation enabled" sub="Run live mock data simulation">
          <Toggle checked={draft.simEnabled} onChange={v => set("simEnabled", v)} />
        </Row>
        <Row label="Simulation speed" sub="Multiplier for ETA countdown">
          <Select value={draft.simSpeed} options={["0.5×", "1×", "2×", "5×", "10×"]} onChange={v => set("simSpeed", v as AppSettings["simSpeed"])} />
        </Row>
        <Row label="Traffic scenario" sub="Pre-set scenario to simulate">
          <Select value={draft.simScenario} options={["Standard city traffic", "Peak hour congestion", "Night low-traffic", "Multi-emergency event", "Corridor stress test"]} onChange={v => set("simScenario", v)} />
        </Row>
        <div className="pt-1">
          <button
            onClick={handleSimReset}
            className="w-full rounded-lg border border-white/10 bg-white/[.03] py-2.5 text-xs text-[#9bb4b9] hover:text-white hover:border-white/20 transition-all"
          >
            Reset simulation to initial state
          </button>
        </div>
      </Section>

      {/* ── Account / Profile ── */}
      <Section icon={User} eyebrow="Operator profile" title="Account & Profile">
        <Row label="Operator name">
          <input
            value={draft.operatorName}
            onChange={e => set("operatorName", e.target.value)}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-[#dcecef] outline-none focus:border-[#48d7e8]/40 w-full sm:w-48"
          />
        </Row>
        <Row label="Email address">
          <input
            value={draft.email}
            onChange={e => set("email", e.target.value)}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-[#dcecef] outline-none focus:border-[#48d7e8]/40 w-full sm:w-48"
          />
        </Row>
        <Row label="Shift" sub="Current operator shift">
          <Select value={draft.shift} options={["Shift A", "Shift B", "Shift C", "On call"]} onChange={v => set("shift", v)} />
        </Row>
        <div className="h-px bg-white/[.06]" />
        <div className="rounded-lg border border-[#48d7e8]/15 bg-[#48d7e8]/[.04] px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">{draft.operatorName || "—"}</p>
            <p className="mono text-[10px] text-[#76939c] mt-0.5">
              ADMIN · {draft.shift.toUpperCase()} · {draft.email}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#48d7e8]/25 bg-[#12333b] text-sm font-semibold text-[#9beaf0]">
            {initials || "?"}
          </div>
        </div>
      </Section>

      {/* footer */}
      <div className="mono text-[9px] text-[#4e6d76] uppercase tracking-[.1em] pb-2">
        LIFELANE OPS / CONFIG v2.4.08 · Settings persisted to local storage
      </div>
    </div>
  );
}
