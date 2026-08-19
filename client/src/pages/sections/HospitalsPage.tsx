import { useState } from "react";
import { Building2, Bed, Phone, MapPin, X, CheckCircle2, Clock3, Users, AlertTriangle } from "lucide-react";
import { fmtEta, type Hospital, type Ambulance } from "../../data/mockData";

function Pill({ children, tone }: { children: React.ReactNode; tone: "green"|"amber"|"cyan"|"coral"|"muted" }) {
  const c = { green:"border-[#5be6a8]/25 bg-[#5be6a8]/[.08] text-[#5be6a8]", amber:"border-[#f5ba69]/25 bg-[#f5ba69]/[.08] text-[#f5ba69]", cyan:"border-[#48d7e8]/25 bg-[#48d7e8]/[.08] text-[#72e2ed]", coral:"border-[#ff806e]/25 bg-[#ff806e]/[.08] text-[#ff9688]", muted:"border-white/10 bg-white/[.04] text-[#92aab0]" };
  const dot = { green:"bg-[#5be6a8]", amber:"bg-[#f5ba69]", cyan:"bg-[#48d7e8]", coral:"bg-[#ff806e]", muted:"bg-[#92aab0]" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 mono text-[9px] uppercase tracking-[.08em] ${c[tone]}`}><span className={`h-1.5 w-1.5 rounded-full ${dot[tone]}`}/>{children}</span>;
}

function statusTone(s: Hospital["status"]): "green"|"amber"|"cyan"|"muted" {
  if (s==="Ready"||s==="Acknowledged") return "green";
  if (s==="Preparing") return "amber";
  return "cyan";
}

function BedBar({ available, total }: { available: number; total: number }) {
  const pct = total > 0 ? (available/total)*100 : 0;
  const color = pct > 50 ? "bg-[#5be6a8]" : pct > 20 ? "bg-[#f5ba69]" : "bg-[#ff806e]";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="mono text-[9px] uppercase text-[#76939c]">Emergency capacity</p>
        <p className="mono text-[10px] text-[#dcecef]">{available}/{total} beds</p>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width:`${pct}%` }}/>
      </div>
    </div>
  );
}

function HospitalCard({ hospital, inboundAmb, isSelected, onClick }: {
  hospital: Hospital; inboundAmb: Ambulance|undefined; isSelected: boolean; onClick: ()=>void;
}) {
  const tone = statusTone(hospital.status);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-5 transition-all
        ${isSelected ? "border-[#48d7e8]/40 bg-[#48d7e8]/[.04]" : "border-white/[.07] bg-white/[.015] hover:border-white/15 hover:bg-white/[.03]"}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#48d7e8]/20 bg-[#48d7e8]/[.08] p-2.5 text-[#48d7e8] shrink-0">
            <Building2 size={18}/>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{hospital.name}</p>
            <p className="mono text-[10px] text-[#76939c] mt-0.5">{hospital.traumaLevel} · {hospital.bay}</p>
          </div>
        </div>
        <Pill tone={tone}>{hospital.status}</Pill>
      </div>

      <BedBar available={hospital.availableBeds} total={hospital.totalEmergencyBeds}/>

      {inboundAmb ? (
        <div className="mt-3 rounded-lg border border-[#ff806e]/15 bg-[#ff806e]/[.04] px-3 py-2.5 flex items-center justify-between">
          <div>
            <p className="mono text-[9px] uppercase text-[#ff806e]">Inbound</p>
            <p className="text-xs font-semibold text-white mt-0.5">{inboundAmb.id} · {inboundAmb.priority}</p>
          </div>
          <p className="mono text-sm font-semibold text-[#48d7e8]">{fmtEta(inboundAmb.currentEta)}</p>
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-white/[.05] bg-white/[.02] px-3 py-2 mono text-[9px] text-[#4e6d76] uppercase tracking-[.08em]">
          No inbound ambulance
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {hospital.specialties.slice(0,3).map(s=>(
          <span key={s} className="mono text-[9px] px-2 py-0.5 rounded border border-white/10 bg-white/[.03] text-[#76939c]">{s}</span>
        ))}
        {hospital.specialties.length > 3 && (
          <span className="mono text-[9px] px-2 py-0.5 rounded border border-white/10 bg-white/[.03] text-[#76939c]">+{hospital.specialties.length-3}</span>
        )}
      </div>
    </button>
  );
}

function DetailPanel({ hospital, inboundAmb, onClose }: { hospital: Hospital; inboundAmb: Ambulance|undefined; onClose: ()=>void }) {
  const tone = statusTone(hospital.status);
  return (
    <div className="panel rounded-xl flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[.07]">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#48d7e8]/20 bg-[#48d7e8]/[.08] p-2.5 text-[#48d7e8]"><Building2 size={16}/></div>
          <div>
            <p className="mono text-[10px] uppercase tracking-[.14em] text-[#48d7e8]">Hospital detail</p>
            <h3 className="text-sm font-semibold text-white leading-snug">{hospital.shortName}</h3>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg border border-white/10 p-1.5 text-[#78959d] hover:text-white"><X size={14}/></button>
      </div>
      <div className="px-5 py-4 space-y-4 overflow-y-auto">
        <div className="flex items-center gap-2 flex-wrap">
          <Pill tone={tone}>{hospital.status}</Pill>
          <span className="mono text-[10px] text-[#76939c]">{hospital.traumaLevel}</span>
        </div>

        <BedBar available={hospital.availableBeds} total={hospital.totalEmergencyBeds}/>

        {/* inbound emergency */}
        {inboundAmb ? (
          <div className="rounded-lg border border-[#ff806e]/20 bg-[#ff806e]/[.05] p-3 space-y-2">
            <p className="mono text-[9px] uppercase text-[#ff806e]">Inbound emergency</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l:"Ambulance",  v: inboundAmb.id },
                { l:"Priority",   v: inboundAmb.priority },
                { l:"ETA",        v: fmtEta(inboundAmb.currentEta) },
                { l:"Speed",      v: `${Math.round(inboundAmb.speed)} km/h` },
                { l:"Condition",  v: inboundAmb.patientCondition },
                { l:"Crew",       v: inboundAmb.crew.split(",")[0] },
              ].map(r=>(
                <div key={r.l}>
                  <p className="mono text-[9px] uppercase text-[#76939c]">{r.l}</p>
                  <p className={`mt-0.5 text-xs font-medium ${r.l==="Priority"?inboundAmb.priority==="P1"?"text-[#ff806e]":"text-[#f5ba69]":r.l==="ETA"?"text-[#48d7e8]":"text-[#dcecef]"}`}>{r.v}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3 mono text-[9px] text-[#4e6d76] uppercase">No inbound ambulance</div>
        )}

        {/* team status */}
        <div className="rounded-lg border border-white/[.07] bg-white/[.025] p-3">
          <p className="mono text-[9px] uppercase text-[#76939c] mb-2">Emergency team</p>
          {hospital.emergencyTeamNotified ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={13} className="text-[#5be6a8]"/>
              <span className="text-xs text-[#5be6a8]">Notified at {hospital.notifiedAt}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock3 size={13} className="text-[#76939c]"/>
              <span className="text-xs text-[#76939c]">Awaiting notification</span>
            </div>
          )}
        </div>

        {/* info */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin size={12} className="text-[#48d7e8] mt-0.5 shrink-0"/>
            <p className="text-xs text-[#abc4c9]">{hospital.address}</p>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={12} className="text-[#48d7e8] shrink-0"/>
            <p className="text-xs text-[#abc4c9]">{hospital.contactNumber}</p>
          </div>
        </div>

        {/* specialties */}
        <div>
          <p className="mono text-[9px] uppercase text-[#76939c] mb-2">Specialties</p>
          <div className="flex flex-wrap gap-1.5">
            {hospital.specialties.map(s=>(
              <span key={s} className="mono text-[9px] px-2 py-1 rounded border border-[#48d7e8]/15 bg-[#48d7e8]/[.04] text-[#72e2ed]">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HospitalsPage({ hospitals, ambulances }: { hospitals: Hospital[]; ambulances: Ambulance[] }) {
  const [selected, setSelected] = useState<Hospital|null>(null);

  const getInbound = (h: Hospital) => ambulances.find(a=>a.destination===h.name && a.currentEta > 0);

  const ready    = hospitals.filter(h=>h.status==="Ready"||h.status==="Acknowledged").length;
  const preparing = hospitals.filter(h=>h.status==="Preparing").length;
  const totalBeds = hospitals.reduce((s,h)=>s+h.availableBeds,0);
  const inbound   = hospitals.filter(h=>!!getInbound(h)).length;

  return (
    <div className="space-y-5">
      <div>
        <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">Care network</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-[-.03em] text-white">Hospital Coordination</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { icon:Building2,    label:"Hospitals online",  value:String(hospitals.length).padStart(2,"0"), accent:"cyan"  },
          { icon:CheckCircle2, label:"Ready / acknowledged", value:String(ready).padStart(2,"0"),         accent:"green" },
          { icon:AlertTriangle,label:"Preparing for intake", value:String(preparing).padStart(2,"0"),     accent:"amber" },
          { icon:Bed,          label:"Available beds",    value:String(totalBeds).padStart(2,"0"),        accent:"cyan"  },
        ].map(c=>(
          <div key={c.label} className="panel panel-hover relative overflow-hidden rounded-xl p-4 sm:p-5">
            <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-[#48d7e8]/5 blur-2xl"/>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="mono text-[10px] uppercase tracking-[.16em] text-[#76939c]">{c.label}</p>
                <p className="mt-2 text-[28px] font-semibold tracking-tight text-white">{c.value}</p>
              </div>
              <div className={`rounded-lg border border-white/10 bg-white/[.035] p-2 ${c.accent==="green"?"text-[#5be6a8]":c.accent==="amber"?"text-[#f5ba69]":"text-[#48d7e8]"}`}><c.icon size={17} strokeWidth={1.7}/></div>
            </div>
          </div>
        ))}
      </div>

      <div className={`grid gap-5 ${selected?"xl:grid-cols-[1fr_360px]":""}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          {hospitals.map(h=>(
            <HospitalCard
              key={h.id}
              hospital={h}
              inboundAmb={getInbound(h)}
              isSelected={selected?.id===h.id}
              onClick={()=>setSelected(selected?.id===h.id?null:h)}
            />
          ))}
        </div>
        {selected && (
          <DetailPanel
            hospital={selected}
            inboundAmb={getInbound(selected)}
            onClose={()=>setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
