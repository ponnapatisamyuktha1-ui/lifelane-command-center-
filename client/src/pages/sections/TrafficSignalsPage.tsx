import { useState } from "react";
import { Signal, Search, X, ChevronRight, TriangleAlert, RefreshCcw, Zap, ZapOff, CheckCircle2 } from "lucide-react";
import { signalTone, type SignalNode, type SignalState } from "../../data/mockData";
import { toast } from "sonner";

function Pill({ children, tone }: { children: React.ReactNode; tone: "green"|"amber"|"cyan"|"coral"|"muted" }) {
  const c = { green:"border-[#5be6a8]/25 bg-[#5be6a8]/[.08] text-[#5be6a8]", amber:"border-[#f5ba69]/25 bg-[#f5ba69]/[.08] text-[#f5ba69]", cyan:"border-[#48d7e8]/25 bg-[#48d7e8]/[.08] text-[#72e2ed]", coral:"border-[#ff806e]/25 bg-[#ff806e]/[.08] text-[#ff9688]", muted:"border-white/10 bg-white/[.04] text-[#92aab0]" };
  const dot = { green:"bg-[#5be6a8]", amber:"bg-[#f5ba69]", cyan:"bg-[#48d7e8]", coral:"bg-[#ff806e]", muted:"bg-[#92aab0]" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 mono text-[9px] uppercase tracking-[.08em] ${c[tone]}`}><span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`}/>{children}</span>;
}

function TrafficLight({ state }: { state: SignalState }) {
  return (
    <div className="flex h-10 w-6 flex-col items-center justify-center gap-[3px] rounded-md border border-white/15 bg-[#08131a] px-1">
      <span className={`h-2 w-2 rounded-full transition-colors ${state === "MANUAL OVERRIDE" ? "bg-[#ff806e] shadow-[0_0_6px_#ff806e]" : "bg-white/10"}`}/>
      <span className={`h-2 w-2 rounded-full transition-colors ${state === "PREPARING" ? "bg-[#f5ba69] shadow-[0_0_6px_#f5ba69]" : "bg-white/10"}`}/>
      <span className={`h-2 w-2 rounded-full transition-colors ${state === "ACTIVE GREEN" ? "bg-[#5be6a8] shadow-[0_0_8px_#5be6a8]" : "bg-white/10"}`}/>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent="cyan" }: { icon: any; label: string; value: string|number; accent?: string }) {
  const col = accent==="coral"?"text-[#ff806e]":accent==="green"?"text-[#5be6a8]":accent==="amber"?"text-[#f5ba69]":"text-[#48d7e8]";
  const dot = accent==="coral"?"bg-[#ff806e]":accent==="green"?"bg-[#5be6a8]":accent==="amber"?"bg-[#f5ba69]":"bg-[#48d7e8]";
  return (
    <div className="panel panel-hover relative overflow-hidden rounded-xl p-4 sm:p-5">
      <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-[#48d7e8]/5 blur-2xl"/>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.16em] text-[#76939c]">{label}</p>
          <p className="mt-2 text-[28px] font-semibold tracking-tight text-white">{String(value).padStart(2,"0")}</p>
        </div>
        <div className={`rounded-lg border border-white/10 bg-white/[.035] p-2 ${col}`}><Icon size={17} strokeWidth={1.7}/></div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-[#76939c]"><span className={`h-1.5 w-1.5 rounded-full ${dot}`}/>{label}</div>
    </div>
  );
}

function DetailPanel({ node, onClose, onAction }: { node: SignalNode; onClose: ()=>void; onAction: (id:string,action:string)=>void }) {
  const tone = signalTone(node.state);
  return (
    <div className="panel rounded-xl flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.07]">
        <div className="flex items-center gap-3">
          <TrafficLight state={node.state}/>
          <div>
            <p className="mono text-[10px] uppercase tracking-[.14em] text-[#48d7e8]">Signal detail</p>
            <h3 className="text-sm font-semibold text-white">{node.id}</h3>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg border border-white/10 p-1.5 text-[#78959d] hover:text-white"><X size={14}/></button>
      </div>
      <div className="px-5 py-4 space-y-4 overflow-y-auto">
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c] mb-1.5">Status</p>
          <Pill tone={tone as any}>{node.state}</Pill>
        </div>
        {node.priorityFor && (
          <div className="rounded-lg border border-[#ff806e]/20 bg-[#ff806e]/[.04] px-3 py-2.5">
            <p className="mono text-[9px] uppercase text-[#ff806e]">Priority corridor for</p>
            <p className="mt-1 text-sm font-semibold text-white">{node.priorityFor}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {[
            { l:"Zone",          v: node.zone },
            { l:"Last Changed",  v: node.lastChanged },
            { l:"Green Duration",v: `${node.greenDuration}s` },
            { l:"Red Duration",  v: `${node.redDuration}s` },
            { l:"Countdown",     v: node.countdown > 0 ? `${node.countdown}s` : "—" },
            { l:"Priority Mode", v: node.priorityFor ? "Active" : "None" },
          ].map(r=>(
            <div key={r.l} className="rounded-lg border border-white/[.07] bg-white/[.025] p-3">
              <p className="mono text-[9px] uppercase text-[#76939c]">{r.l}</p>
              <p className={`mt-0.5 text-xs font-medium ${r.l==="Priority Mode"&&node.priorityFor?"text-[#ff806e]":"text-[#dcecef]"}`}>{r.v}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c] mb-2">Location</p>
          <p className="text-xs text-[#abc4c9]">{node.name}</p>
          <p className="mono text-[10px] text-[#4e6d76] mt-0.5">{node.lat.toFixed(4)}, {node.lng.toFixed(4)}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button onClick={()=>onAction(node.id,"reset")}   className="rounded-md border border-white/10 bg-white/[.03] px-2 py-2 text-[10px] text-[#9bb4b9] hover:border-white/25 hover:text-white transition-all">Reset</button>
          <button onClick={()=>onAction(node.id,"green")}   className="rounded-md border border-[#5be6a8]/25 bg-[#5be6a8]/[.06] px-2 py-2 text-[10px] text-[#5be6a8] hover:bg-[#5be6a8]/[.12] transition-all">Force Green</button>
          <button onClick={()=>onAction(node.id,"override")} className="rounded-md border border-[#ff806e]/25 bg-[#ff806e]/[.06] px-2 py-2 text-[10px] text-[#ff9688] hover:bg-[#ff806e]/[.12] transition-all">Override</button>
        </div>
      </div>
    </div>
  );
}

export default function TrafficSignalsPage({ signals, onSignalChange }: {
  signals: SignalNode[];
  onSignalChange: (updated: SignalNode[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");
  const [selected, setSelected] = useState<SignalNode|null>(null);

  const zones = ["All", ...Array.from(new Set(signals.map(s=>s.zone)))];
  const states = ["All","ACTIVE GREEN","PREPARING","NORMAL","MANUAL OVERRIDE","OFFLINE"];

  const filtered = signals.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchZone  = zoneFilter==="All" || s.zone===zoneFilter;
    const matchState = stateFilter==="All" || s.state===stateFilter;
    return matchSearch && matchZone && matchState;
  });

  const handleAction = (id: string, action: string) => {
    const newState: Record<string,SignalState> = { reset:"NORMAL", green:"ACTIVE GREEN", override:"MANUAL OVERRIDE" };
    const updated = signals.map(s => s.id===id ? { ...s, state: newState[action] } : s);
    onSignalChange(updated);
    const label = { reset:"Signal reset to normal", green:"Signal forced to ACTIVE GREEN", override:"Manual override applied" };
    toast.success(label[action as keyof typeof label], { description: `Junction ${id} state updated.` });
    if (selected?.id===id) setSelected(updated.find(s=>s.id===id)??null);
  };

  const activeGreen = signals.filter(s=>s.state==="ACTIVE GREEN").length;
  const preparing   = signals.filter(s=>s.state==="PREPARING").length;
  const overridden  = signals.filter(s=>s.state==="MANUAL OVERRIDE").length;
  const offline     = signals.filter(s=>s.state==="OFFLINE").length;

  return (
    <div className="space-y-5">
      <div>
        <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">Signal mesh control</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-.03em] text-white">Traffic Signals</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard icon={Signal}       label="Total signals"      value={signals.length}  accent="cyan"/>
        <StatCard icon={Zap}          label="Active green"        value={activeGreen}     accent="green"/>
        <StatCard icon={TriangleAlert} label="Manual overrides"  value={overridden}      accent="coral"/>
        <StatCard icon={ZapOff}       label="Offline nodes"       value={offline}         accent="muted"/>
      </div>

      <div className={`grid gap-5 ${selected ? "xl:grid-cols-[1fr_340px]" : ""}`}>
        <div className="panel rounded-xl overflow-hidden">
          {/* toolbar */}
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-white/[.07] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-2 flex-1 max-w-[280px]">
              <Search size={13} className="text-[#5a7d85] shrink-0"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search junction…" className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#4e6d76]"/>
              {search && <button onClick={()=>setSearch("")} className="text-[#5a7d85] hover:text-white"><X size={12}/></button>}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {zones.map(z=>(
                <button key={z} onClick={()=>setZoneFilter(z)} className={`mono px-2.5 py-1 rounded-md text-[9px] uppercase tracking-[.08em] border transition-all ${zoneFilter===z?"border-[#48d7e8]/40 bg-[#48d7e8]/[.12] text-[#48d7e8]":"border-white/10 bg-white/[.02] text-[#76939c] hover:text-white"}`}>{z}</button>
              ))}
            </div>
          </div>

          {/* state filter pills */}
          <div className="flex flex-wrap gap-1.5 px-5 py-3 border-b border-white/[.05]">
            {states.map(s => {
              const t = s==="ACTIVE GREEN"?"green":s==="PREPARING"?"amber":s==="MANUAL OVERRIDE"?"coral":s==="OFFLINE"?"muted":"cyan";
              return (
                <button key={s} onClick={()=>setStateFilter(s)} className={`mono px-2.5 py-1 rounded-md text-[9px] uppercase tracking-[.08em] border transition-all ${stateFilter===s?`border-[#48d7e8]/40 bg-[#48d7e8]/[.12] text-[#48d7e8]`:"border-white/10 bg-white/[.02] text-[#76939c] hover:text-white"}`}>{s}</button>
              );
            })}
          </div>

          {/* grid of signal cards */}
          <div className="p-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length===0 ? (
              <div className="col-span-full py-10 text-center text-sm text-[#76939c]">No signals match filter.</div>
            ) : filtered.map(s => {
              const tone = signalTone(s.state);
              const isSelected = selected?.id===s.id;
              return (
                <button
                  key={s.id}
                  onClick={()=>setSelected(isSelected?null:s)}
                  className={`w-full text-left rounded-xl border p-4 transition-all
                    ${isSelected ? "border-[#48d7e8]/40 bg-[#48d7e8]/[.05]" : "border-white/[.07] bg-white/[.015] hover:border-white/15 hover:bg-white/[.03]"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <TrafficLight state={s.state}/>
                      <div>
                        <p className="mono text-[10px] text-[#76939c]">{s.id}</p>
                        <p className="text-xs font-medium text-[#dcecef] leading-snug mt-0.5">{s.name}</p>
                      </div>
                    </div>
                    <Pill tone={tone as any}>{s.state}</Pill>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#76939c]">
                    <span className="mono">{s.zone} zone</span>
                    <span className="mono">{s.countdown>0?`${s.countdown}s remaining`:"—"}</span>
                  </div>
                  {s.priorityFor && (
                    <div className="mt-2 flex items-center gap-1.5 mono text-[9px] text-[#ff806e]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff806e] beacon"/>
                      Priority for {s.priorityFor}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-white/[.07] mono text-[9px] text-[#4e6d76]">
            {filtered.length} of {signals.length} junctions displayed · Click a card to control
          </div>
        </div>

        {selected && (
          <DetailPanel
            node={selected}
            onClose={()=>setSelected(null)}
            onAction={handleAction}
          />
        )}
      </div>
    </div>
  );
}
