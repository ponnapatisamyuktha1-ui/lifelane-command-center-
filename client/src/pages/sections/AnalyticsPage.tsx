import { useState } from "react";
import { TrendingUp, Clock3, Zap, Navigation, Activity, Timer } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ANALYTICS_TREND } from "../../data/mockData";

// ── recharts custom tooltip ───────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="panel rounded-lg px-3 py-2.5 text-xs space-y-1">
      <p className="mono text-[10px] uppercase text-[#48d7e8] mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: p.color }}/>
          <span className="text-[#abc4c9]">{p.name}:</span>
          <span className="text-white font-semibold">{p.value}{p.name.includes("time")||p.name.includes("Time") ? " min" : p.name.includes("Rate") ? "%" : ""}</span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, accent = "cyan" }: { icon: any; label: string; value: string; sub: string; accent?: string }) {
  const col = accent==="coral"?"text-[#ff806e]":accent==="green"?"text-[#5be6a8]":accent==="amber"?"text-[#f5ba69]":"text-[#48d7e8]";
  const dot = accent==="coral"?"bg-[#ff806e]":accent==="green"?"bg-[#5be6a8]":accent==="amber"?"bg-[#f5ba69]":"bg-[#48d7e8]";
  return (
    <div className="panel panel-hover relative overflow-hidden rounded-xl p-4 sm:p-5">
      <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-[#48d7e8]/5 blur-2xl"/>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.16em] text-[#76939c]">{label}</p>
          <p className="mt-2 text-[28px] font-semibold tracking-tight text-white">{value}</p>
        </div>
        <div className={`rounded-lg border border-white/10 bg-white/[.035] p-2 ${col}`}><Icon size={17} strokeWidth={1.7}/></div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-[#76939c]">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`}/>{sub}
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">{eyebrow}</p>
      <h3 className="mt-1 text-[17px] font-semibold tracking-[-.02em] text-white">{title}</h3>
    </div>
  );
}

const RANGES = ["Last 7 days", "Last 30 days", "Last 90 days"] as const;
type Range = typeof RANGES[number];

// Multiply trend data for longer ranges
function getTrend(range: Range) {
  if (range === "Last 7 days") return ANALYTICS_TREND;
  const base = [...ANALYTICS_TREND];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];
  if (range === "Last 30 days") {
    return Array.from({length:30},(_,i)=>({
      label: `${i+1}`,
      avgResponseTime: parseFloat((9 + Math.sin(i/3)*2 + Math.random()).toFixed(1)),
      timeSaved:       parseFloat((7 + Math.cos(i/4)*1.5 + Math.random()).toFixed(1)),
      trips:           Math.round(8 + Math.random()*8),
      signalsPrioritized: Math.round(22 + Math.random()*20),
    }));
  }
  return Array.from({length:12},(_,i)=>({
    label: months[i],
    avgResponseTime: parseFloat((10 + Math.sin(i/2)*2).toFixed(1)),
    timeSaved:       parseFloat((7.5 + Math.cos(i/2)*1.5).toFixed(1)),
    trips:           Math.round(200 + Math.random()*100),
    signalsPrioritized: Math.round(600 + Math.random()*300),
  }));
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>("Last 7 days");
  const data = getTrend(range);
  const totalTrips = data.reduce((s,d)=>s+d.trips,0);
  const avgResponse = (data.reduce((s,d)=>s+d.avgResponseTime,0)/data.length).toFixed(1);
  const avgSaved    = (data.reduce((s,d)=>s+d.timeSaved,0)/data.length).toFixed(1);
  const totalSigs   = data.reduce((s,d)=>s+d.signalsPrioritized,0);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">Performance insights</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-.03em] text-white">Analytics</h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} className={`mono px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-[.1em] border transition-all ${range === r ? "border-[#48d7e8]/40 bg-[#48d7e8]/[.1] text-[#48d7e8]" : "border-white/10 text-[#76939c] hover:text-white"}`}>{r}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={Activity}   label="Total trips"          value={String(totalTrips)}       sub="emergency responses"   accent="coral"/>
        <KpiCard icon={Clock3}     label="Avg response time"    value={`${avgResponse} min`}     sub="from dispatch to arrival" />
        <KpiCard icon={Timer}      label="Avg time saved"       value={`${avgSaved} min`}        sub="vs. no corridor"       accent="green"/>
        <KpiCard icon={Zap}        label="Signals prioritized"  value={String(totalSigs)}        sub="pre-emption events"    accent="cyan"/>
      </div>

      {/* row 1: response time + time saved area chart */}
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="panel rounded-xl p-5">
          <SectionHead eyebrow="Response performance" title="Avg Response Time (min)"/>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{top:4,right:4,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gResponse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#48d7e8" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="#48d7e8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
              <XAxis dataKey="label" tick={{fill:"#76939c",fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#76939c",fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Area type="monotone" dataKey="avgResponseTime" name="Response time" stroke="#48d7e8" strokeWidth={2} fill="url(#gResponse)" dot={false} activeDot={{r:4,fill:"#48d7e8"}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel rounded-xl p-5">
          <SectionHead eyebrow="Corridor benefit" title="Avg Time Saved (min)"/>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{top:4,right:4,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="gSaved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#5be6a8" stopOpacity={0.18}/>
                  <stop offset="95%" stopColor="#5be6a8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
              <XAxis dataKey="label" tick={{fill:"#76939c",fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#76939c",fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Area type="monotone" dataKey="timeSaved" name="Time saved" stroke="#5be6a8" strokeWidth={2} fill="url(#gSaved)" dot={false} activeDot={{r:4,fill:"#5be6a8"}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* row 2: trips bar + signals bar */}
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="panel rounded-xl p-5">
          <SectionHead eyebrow="Emergency activity" title="Trips per Period"/>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{top:4,right:4,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
              <XAxis dataKey="label" tick={{fill:"#76939c",fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#76939c",fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Bar dataKey="trips" name="Trips" fill="#48d7e8" fillOpacity={0.7} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel rounded-xl p-5">
          <SectionHead eyebrow="Signal pre-emption" title="Signals Prioritized"/>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{top:4,right:4,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
              <XAxis dataKey="label" tick={{fill:"#76939c",fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#76939c",fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Bar dataKey="signalsPrioritized" name="Signals" fill="#5be6a8" fillOpacity={0.7} radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* row 3: combined overlay line chart */}
      <div className="panel rounded-xl p-5">
        <SectionHead eyebrow="Dual metric overlay" title="Response Time vs. Time Saved"/>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{top:4,right:4,left:-20,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
            <XAxis dataKey="label" tick={{fill:"#76939c",fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#76939c",fontSize:10,fontFamily:"IBM Plex Mono"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<ChartTooltip/>}/>
            <Legend wrapperStyle={{paddingTop:"12px",fontFamily:"IBM Plex Mono",fontSize:"10px",color:"#76939c",textTransform:"uppercase",letterSpacing:"0.08em"}}/>
            <Line type="monotone" dataKey="avgResponseTime" name="Response time" stroke="#48d7e8" strokeWidth={2} dot={false} activeDot={{r:4}}/>
            <Line type="monotone" dataKey="timeSaved"       name="Time saved"    stroke="#5be6a8" strokeWidth={2} dot={false} activeDot={{r:4}} strokeDasharray="5 3"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* summary table */}
      <div className="panel rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[.07]">
          <p className="mono text-[10px] uppercase tracking-[.18em] text-[#48d7e8]">Period breakdown</p>
          <h3 className="mt-1 text-[17px] font-semibold text-white">Detailed Statistics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-white/[.07] mono text-[9px] uppercase tracking-[.14em] text-[#6f8e96]">
                {["Period","Avg Response (min)","Avg Time Saved (min)","Trips","Signals Prioritized"].map(h=>(
                  <th key={h} className="pb-3 pt-3 px-5 font-normal text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(-7).map(row=>(
                <tr key={row.label} className="border-b border-white/[.05] last:border-0 text-xs hover:bg-white/[.018]">
                  <td className="px-5 py-3 mono font-semibold text-[#dcecef]">{row.label}</td>
                  <td className="px-5 py-3 mono text-[#48d7e8]">{row.avgResponseTime}</td>
                  <td className="px-5 py-3 mono text-[#5be6a8]">{row.timeSaved}</td>
                  <td className="px-5 py-3 text-[#dcecef]">{row.trips}</td>
                  <td className="px-5 py-3 text-[#dcecef]">{row.signalsPrioritized}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
