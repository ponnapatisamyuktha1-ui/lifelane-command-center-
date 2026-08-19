import { useState } from "react";
import { Navigation, CheckCircle2, Clock3, Zap, ChevronRight, X, Signal } from "lucide-react";
import { fmtEta, fmtMins, type CorridorOp, type Ambulance } from "../../data/mockData";

function Pill({ children, tone }: { children: React.ReactNode; tone: "green"|"amber"|"cyan"|"coral"|"muted" }) {
  const c = { green:"border-[#5be6a8]/25 bg-[#5be6a8]/[.08] text-[#5be6a8]", amber:"border-[#f5ba69]/25 bg-[#f5ba69]/[.08] text-[#f5ba69]", cyan:"border-[#48d7e8]/25 bg-[#48d7e8]/[.08] text-[#72e2ed]", coral:"border-[#ff806e]/25 bg-[#ff806e]/[.08] text-[#ff9688]", muted:"border-white/10 bg-white/[.04] text-[#92aab0]" };
  const dot = { green:"bg-[#5be6a8]", amber:"bg-[#f5ba69]", cyan:"bg-[#48d7e8]", coral:"bg-[#ff806e]", muted:"bg-[#92aab0]" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 mono text-[9px] uppercase tracking-[.08em] ${c[tone]}`}><span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`}/>{children}</span>;
}

// Progress step bar: DISPATCHED → PREPARING → ACTIVE → COMPLETED
function CorridorSteps({ op }: { op: CorridorOp }) {
  type Step = { label: string; done: boolean; active: boolean };
  const steps: Step[] =
    op.status === "Completed"
      ? [
          { label:"Dispatched", done:true,  active:false },
          { label:"Preparing",  done:true,  active:false },
          { label:"Active",     done:true,  active:false },
          { label:"Completed",  done:true,  active:false },
        ]
      : op.status === "Active"
      ? [
          { label:"Dispatched", done:true,  active:false },
          { label:"Preparing",  done:true,  active:false },
          { label:"Active",     done:false, active:true  },
          { label:"Completed",  done:false, active:false },
        ]
      : [
          { label:"Dispatched", done:true,  active:false },
          { label:"Preparing",  done:false, active:true  },
          { label:"Active",     done:false, active:false },
          { label:"Completed",  done:false, active:false },
        ];
  return (
    // On very small screens, show as a 2×2 grid of step badges instead of a cramped 4-col row.
    // At sm+ the normal horizontal stepper is used.
    <>
      {/* Mobile: compact 2×2 badge grid */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {steps.map((step, i) => (
          <div key={step.label} className={`flex items-center gap-2 rounded-lg border px-2.5 py-2
            ${step.done ? "border-[#5be6a8]/25 bg-[#5be6a8]/[.06]" : step.active ? "border-[#48d7e8]/25 bg-[#48d7e8]/[.06]" : "border-white/[.07] bg-white/[.02]"}`}>
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold
              ${step.done ? "border-[#5be6a8] bg-[#5be6a8]/15 text-[#5be6a8]" : step.active ? "border-[#48d7e8] bg-[#48d7e8]/15 text-[#48d7e8]" : "border-white/20 bg-white/5 text-[#76939c]"}`}>
              {step.done ? "✓" : i + 1}
            </div>
            <p className={`mono text-[9px] uppercase tracking-[.06em]
              ${step.done ? "text-[#5be6a8]" : step.active ? "text-[#48d7e8]" : "text-[#56737a]"}`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>

      {/* sm+: horizontal stepper */}
      <div className="relative hidden sm:grid grid-cols-4">
        {steps.map((step, i) => (
          <div key={step.label} className="relative flex flex-col items-center">
            {i < 3 && (
              <div className={`absolute left-1/2 top-3 h-px w-full transition-colors ${step.done ? "bg-[#5be6a8]" : "bg-white/10"}`} />
            )}
            <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-semibold transition-all
              ${step.done ? "border-[#5be6a8] bg-[#5be6a8]/15 text-[#5be6a8]" : step.active ? "border-[#48d7e8] bg-[#48d7e8]/15 text-[#48d7e8]" : "border-white/20 bg-white/5 text-[#76939c]"}`}>
              {step.done ? "✓" : i + 1}
            </div>
            <p className={`mt-1.5 text-center text-[9px] mono uppercase tracking-[.06em]
              ${step.done ? "text-[#5be6a8]" : step.active ? "text-[#48d7e8]" : "text-[#56737a]"}`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

// Signal progress strip
function SignalProgress({ cleared, total }: { cleared: number; total: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="mono text-[9px] uppercase text-[#76939c]">Signals cleared</p>
        <p className="mono text-[10px] text-[#dcecef]">{cleared}/{total}</p>
      </div>
      <div className="flex gap-1">
        {Array.from({length:total}).map((_,i)=>(
          <div key={i} className={`flex-1 h-2 rounded-sm transition-colors ${i<cleared ? "bg-[#5be6a8]" : "bg-white/10"}`}/>
        ))}
      </div>
    </div>
  );
}

function CorridorCard({ op, isSelected, onClick }: { op: CorridorOp; isSelected: boolean; onClick: ()=>void }) {
  const tone: "green"|"amber"|"muted" = op.status==="Active"?"green":op.status==="Pending"?"amber":"muted";
  const pTone: "coral"|"amber"|"cyan" = op.priority==="P1"?"coral":op.priority==="P2"?"amber":"cyan";
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-4 transition-all
        ${isSelected ? "border-[#48d7e8]/40 bg-[#48d7e8]/[.04]" : op.status==="Active" ? "border-[#5be6a8]/20 bg-[#5be6a8]/[.03] hover:border-[#5be6a8]/35" : "border-white/[.07] bg-white/[.015] hover:border-white/15"}`}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="mono text-[11px] font-semibold text-white">{op.id}</p>
            <Pill tone={tone}>{op.status}</Pill>
            <span className={`mono text-[10px] font-semibold ${op.priority==="P1"?"text-[#ff806e]":op.priority==="P2"?"text-[#f5ba69]":"text-[#48d7e8]"}`}>{op.priority}</span>
          </div>
          <p className="mono text-[10px] text-[#76939c] mt-0.5">{op.ambulanceId}</p>
        </div>
        <ChevronRight size={14} className={`shrink-0 mt-0.5 transition-transform ${isSelected?"rotate-90 text-[#48d7e8]":"text-[#4e6d76]"}`}/>
      </div>
      {/* route */}
      <p className="text-xs text-[#abc4c9] mb-3 leading-relaxed">{op.route}</p>
      {/* steps */}
      <CorridorSteps op={op}/>
      {/* signals + time saved */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <SignalProgress cleared={op.clearedSignals} total={op.totalSignals}/>
        </div>
        <div className="text-right">
          <p className="mono text-[9px] uppercase text-[#76939c]">Time saved</p>
          <p className="mono text-[11px] font-semibold text-[#5be6a8] mt-0.5">{fmtMins(op.timeSavedSeconds)} min</p>
        </div>
      </div>
    </button>
  );
}

function DetailPanel({ op, ambulances, onClose }: { op: CorridorOp; ambulances: Ambulance[]; onClose: ()=>void }) {
  const amb = ambulances.find(a=>a.id===op.ambulanceId);
  return (
    <div className="panel rounded-xl flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.07]">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.14em] text-[#48d7e8]">Corridor detail</p>
          <h3 className="text-sm font-semibold text-white">{op.id}</h3>
        </div>
        <button onClick={onClose} className="rounded-lg border border-white/10 p-1.5 text-[#78959d] hover:text-white"><X size={14}/></button>
      </div>
      <div className="px-5 py-4 space-y-4 overflow-y-auto">
        <CorridorSteps op={op}/>
        <div className="grid grid-cols-2 gap-3">
          {[
            { l:"Ambulance",    v: op.ambulanceId },
            { l:"Priority",     v: op.priority },
            { l:"Origin",       v: op.origin },
            { l:"Destination",  v: op.destination },
            { l:"Started at",   v: op.startedAt },
            { l:"Completed at", v: op.completedAt ?? "In progress" },
            { l:"Total signals",v: String(op.totalSignals) },
            { l:"Cleared",      v: String(op.clearedSignals) },
          ].map(r=>(
            <div key={r.l} className="rounded-lg border border-white/[.07] bg-white/[.025] p-2.5">
              <p className="mono text-[9px] uppercase text-[#76939c]">{r.l}</p>
              <p className={`mt-0.5 text-xs font-medium ${r.l==="Priority"?op.priority==="P1"?"text-[#ff806e]":"text-[#f5ba69]":"text-[#dcecef]"}`}>{r.v}</p>
            </div>
          ))}
        </div>
        <SignalProgress cleared={op.clearedSignals} total={op.totalSignals}/>
        <div className="rounded-lg border border-[#5be6a8]/15 bg-[#5be6a8]/[.04] p-3">
          <p className="mono text-[9px] uppercase text-[#5be6a8] mb-1">Time saved</p>
          <p className="text-2xl font-semibold text-[#5be6a8]">{fmtMins(op.timeSavedSeconds)} <span className="text-sm font-normal text-[#5be6a8]/70">min</span></p>
        </div>
        {amb && op.status==="Active" && (
          <div className="rounded-lg border border-[#48d7e8]/15 bg-[#48d7e8]/[.04] p-3">
            <p className="mono text-[9px] uppercase text-[#48d7e8] mb-1">Live ambulance ETA</p>
            <p className="text-2xl font-semibold text-[#48d7e8]">{fmtEta(amb.currentEta)}</p>
          </div>
        )}
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c] mb-2">Full route</p>
          <p className="text-xs text-[#abc4c9] leading-relaxed">{op.route}</p>
        </div>
      </div>
    </div>
  );
}

export default function GreenCorridorsPage({ corridors, ambulances }: { corridors: CorridorOp[]; ambulances: Ambulance[] }) {
  const [selected, setSelected] = useState<CorridorOp|null>(null);
  const [filter, setFilter] = useState<"All"|"Active"|"Completed">("All");

  const filtered = corridors.filter(c => filter==="All" || c.status===filter);
  const active    = corridors.filter(c=>c.status==="Active").length;
  const completed = corridors.filter(c=>c.status==="Completed").length;
  const totalSaved = corridors.reduce((s,c)=>s+c.timeSavedSeconds,0);
  const signalsCl  = corridors.reduce((s,c)=>s+c.clearedSignals,0);

  return (
    <div className="space-y-5">
      <div>
        <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">Corridor orchestration</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-.03em] text-white">Green Corridors</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { icon:Navigation,   label:"Active corridors",  value:String(active).padStart(2,"0"),     accent:"green" },
          { icon:CheckCircle2, label:"Completed today",   value:String(completed).padStart(2,"0"),   accent:"cyan" },
          { icon:Signal,       label:"Signals cleared",   value:String(signalsCl).padStart(2,"0"),   accent:"cyan" },
          { icon:Clock3,       label:"Total time saved",  value:fmtMins(totalSaved)+" min",          accent:"green" },
        ].map(c=>(
          <div key={c.label} className="panel panel-hover relative overflow-hidden rounded-xl p-4 sm:p-5">
            <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-[#48d7e8]/5 blur-2xl"/>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="mono text-[10px] uppercase tracking-[.16em] text-[#76939c]">{c.label}</p>
                <p className="mt-2 text-[26px] font-semibold tracking-tight text-white">{c.value}</p>
              </div>
              <div className={`rounded-lg border border-white/10 bg-white/[.035] p-2 ${c.accent==="green"?"text-[#5be6a8]":"text-[#48d7e8]"}`}><c.icon size={17} strokeWidth={1.7}/></div>
            </div>
          </div>
        ))}
      </div>

      {/* filter */}
      <div className="flex gap-2">
        {(["All","Active","Completed"] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`mono px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-[.1em] border transition-all ${filter===f?"border-[#48d7e8]/40 bg-[#48d7e8]/[.1] text-[#48d7e8]":"border-white/10 text-[#76939c] hover:text-white"}`}>{f}</button>
        ))}
      </div>

      <div className={`grid gap-5 ${selected?"xl:grid-cols-[1fr_360px]":""}`}>
        <div className="space-y-3">
          {filtered.length===0 ? (
            <div className="panel rounded-xl py-12 text-center text-sm text-[#76939c]">No corridors match this filter.</div>
          ) : filtered.map(op=>(
            <CorridorCard
              key={op.id}
              op={op}
              isSelected={selected?.id===op.id}
              onClick={()=>setSelected(selected?.id===op.id?null:op)}
            />
          ))}
        </div>
        {selected && <DetailPanel op={selected} ambulances={ambulances} onClose={()=>setSelected(null)}/>}
      </div>
    </div>
  );
}
