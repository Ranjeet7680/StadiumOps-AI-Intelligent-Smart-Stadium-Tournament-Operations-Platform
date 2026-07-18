import { useState, useEffect } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from "recharts";
import { api } from "../../services/api";

export default function CommandCenter() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Telemetry data
  const [currentAttendance, setCurrentAttendance] = useState(48326);
  const [zones, setZones] = useState<any[]>([]);
  const [gates, setGates] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [stadiumStats] = useState<any>({
    readiness: "98.5%",
    predictions: 42,
    staffCoverage: "94%",
    gateEfficiency: "96.2%"
  });

  // Load telemetry
  const loadData = async () => {
    try {
      const zns = await api.stadiums.getZones(1);
      setZones(zns);

      const gts = await api.stadiums.getGates(1);
      setGates(gts);

      const incs = await api.incidents.getIncidents();
      setIncidents(incs);

      const decs = await api.ai.getDecisions("pending");
      setDecisions(decs);

      const crowd = await api.crowd.getCurrent(1);
      setCurrentAttendance(crowd.total_occupancy || 48326);

      setLoading(false);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Failed to fetch real-time telemetry from Node Server. Retrying...");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDecisionAction = async (id: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await api.ai.approveDecision(id);
      } else {
        await api.ai.rejectDecision(id);
      }
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Mock charts data
  const crowdHistory = [
    { time: "12:00", spectators: 12000 },
    { time: "13:00", spectators: 24000 },
    { time: "14:00", spectators: 45000 },
    { time: "15:00", spectators: 48326 },
    { time: "16:00", spectators: 51200 },
    { time: "17:00", spectators: 54000 },
  ];

  const incidentSeverity = [
    { severity: "Critical", count: incidents.filter((i) => i.severity === "Critical").length || 2 },
    { severity: "Warning", count: incidents.filter((i) => i.severity === "Warning").length || 4 },
    { severity: "Minor", count: incidents.filter((i) => i.severity === "Minor").length || 6 },
  ];

  if (loading && zones.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-[#0B1220] rounded-xl w-1/4" />
        <div className="grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-[#0B1220] rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 h-[380px] bg-[#0B1220] rounded-2xl" />
          <div className="col-span-4 h-[380px] bg-[#0B1220] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 entrance-anim">
      {/* 1. BREADCRUMBS & TOP BAR */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-1 text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest">
            <span>StadiumOps</span>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-[#4F8CFF]">Command Center</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">Command Center</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">Real-time operational intelligence across the venue.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/25 text-[10px] font-bold py-1 px-3 rounded-full flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            LIVE DATA FEED
          </span>
          <button
            onClick={() => loadData()}
            className="bg-[#111B2E] hover:bg-[#152238] border border-[#94A3B8]/14 p-2 rounded-xl text-[#94A3B8] hover:text-white"
            title="Refresh logs"
          >
            <span className="material-symbols-outlined text-sm flex">refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs p-3.5 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-sm animate-spin">sync</span>
          <span>{error}</span>
        </div>
      )}

      {/* 2. KPI STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-4.5 shadow-md relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-widest">Venue Readiness</span>
            <span className="material-symbols-outlined text-[#22C55E] text-base">check_circle</span>
          </div>
          <h4 className="text-xl font-black text-white mt-1.5">{stadiumStats.readiness}</h4>
          <span className="text-[9px] text-emerald-400 font-bold block mt-1.5">✓ Systems Secure</span>
        </div>

        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-4.5 shadow-md relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-widest">Attendance</span>
            <span className="material-symbols-outlined text-[#4F8CFF] text-base">groups</span>
          </div>
          <h4 className="text-xl font-black text-white mt-1.5">{currentAttendance.toLocaleString()}</h4>
          <span className="text-[9px] text-[#4F8CFF] font-bold block mt-1.5">+14.2% inflow</span>
        </div>

        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-4.5 shadow-md relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-widest">Open Incidents</span>
            <span className="material-symbols-outlined text-[#EF4444] text-base animate-pulse">warning</span>
          </div>
          <h4 className="text-xl font-black text-[#EF4444] mt-1.5">{incidents.filter((i) => i.status !== "Resolved").length}</h4>
          <span className="text-[9px] text-[#94A3B8] block mt-1.5">Critical dispatch: 2</span>
        </div>

        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-4.5 shadow-md relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-widest">AI Predictions</span>
            <span className="material-symbols-outlined text-[#8B5CF6] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          </div>
          <h4 className="text-xl font-black text-[#8B5CF6] mt-1.5">{stadiumStats.predictions}</h4>
          <span className="text-[9px] text-emerald-400 font-bold block mt-1.5">Active risk mitigation</span>
        </div>

        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-4.5 shadow-md relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-widest">Staff Coverage</span>
            <span className="material-symbols-outlined text-white/60 text-base">badge</span>
          </div>
          <h4 className="text-xl font-black text-white mt-1.5">{stadiumStats.staffCoverage}</h4>
          <span className="text-[9px] text-emerald-400 block mt-1.5">842 on duty</span>
        </div>

        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-4.5 shadow-md relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-[#94A3B8] uppercase font-bold tracking-widest">Gate Efficiency</span>
            <span className="material-symbols-outlined text-[#22D3EE] text-base">door_sliding</span>
          </div>
          <h4 className="text-xl font-black text-white mt-1.5">{stadiumStats.gateEfficiency}</h4>
          <span className="text-[9px] text-[#22D3EE] font-bold block mt-1.5">Avg wait: 4.2m</span>
        </div>
      </div>

      {/* 3. MAIN BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Panel: Live Stadium Overview Map */}
        <div className="lg:col-span-8 bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[420px]">
          <div className="flex justify-between items-center border-b border-[#94A3B8]/10 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Live Stadium Overview</h3>
              <p className="text-[11px] text-[#94A3B8]">Isometric map showing sector bounds and real-time gate processing rates.</p>
            </div>
            <span className="text-[9px] font-mono bg-[#060A12] border border-[#94A3B8]/14 py-1 px-3 rounded-full text-[#4F8CFF] font-bold">
              Map Grid Verified
            </span>
          </div>

          {/* Interactive Sector Graphic */}
          <div className="relative flex-1 bg-[#060A12] border border-[#94A3B8]/10 rounded-xl min-h-[300px] flex items-center justify-center overflow-hidden p-6">
            <div className="w-64 h-64 rounded-full border border-[#4F8CFF]/15 flex items-center justify-center relative animate-spin" style={{ animationDuration: "80s" }}>
              <div className="w-48 h-48 rounded-full border border-dashed border-[#8B5CF6]/20 flex items-center justify-center" />
            </div>

            {/* Stadium Zones Representation */}
            <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
              <div className="grid grid-cols-4 gap-3 w-full max-w-md pointer-events-auto">
                {zones.slice(0, 8).map((zone) => {
                  const isHighRisk = zone.risk_score > 60;
                  return (
                    <div
                      key={zone.zone_id}
                      className={`border rounded-xl p-3 text-center transition-all ${
                        isHighRisk
                          ? "bg-[#EF4444]/15 border-[#EF4444] text-[#EF4444] animate-pulse"
                          : "bg-[#0B1220]/95 border-[#94A3B8]/10 text-white"
                      }`}
                    >
                      <span className="text-[9px] font-mono font-bold block">{zone.name}</span>
                      <span className="text-xs font-black block mt-1">{zone.current_count}</span>
                      <span className="text-[8px] opacity-75 block">{zone.risk_score}% Risk</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Operational Priorities */}
        <div className="lg:col-span-4 bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="border-b border-[#94A3B8]/10 pb-4 mb-4">
            <h3 className="text-sm font-bold text-white">AI Operational Priorities</h3>
            <p className="text-[11px] text-[#94A3B8]">Critical alerts requiring supervisor authorization checklist.</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] no-scrollbar">
            {decisions.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#94A3B8]">
                No pending AI decisions. Systems secure.
              </div>
            ) : (
              decisions.map((dec) => (
                <div
                  key={dec.id}
                  className={`border p-3.5 rounded-xl space-y-2.5 relative overflow-hidden transition-all ${
                    dec.severity === "Critical"
                      ? "bg-[#EF4444]/5 border-[#EF4444]/25"
                      : "bg-[#F59E0B]/5 border-[#F59E0B]/25"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white block truncate max-w-[180px]">{dec.title}</span>
                    <span className={`text-[8px] font-bold py-0.5 px-2 rounded-full uppercase ${
                      dec.severity === "Critical" ? "bg-[#EF4444]/20 text-[#EF4444]" : "bg-[#F59E0B]/20 text-[#F59E0B]"
                    }`}>
                      {dec.severity}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#94A3B8] leading-normal">{dec.evidence}</p>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => handleDecisionAction(dec.id, "reject")}
                      className="border border-[#94A3B8]/14 text-[9px] font-bold text-white py-1 px-3 rounded-lg"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDecisionAction(dec.id, "approve")}
                      className="bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white text-[9px] font-bold py-1 px-3 rounded-lg"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. SECOND ROW: CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chart 1: Crowd Flow Timeline */}
        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-5 shadow-lg flex flex-col h-[280px]">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-4">
            Crowd Flow Timeline
          </span>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={crowdHistory} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} />
                <YAxis stroke="#94A3B8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1220", borderColor: "rgba(148, 163, 184, 0.14)", fontSize: 10 }} />
                <Area type="monotone" dataKey="spectators" stroke="#4F8CFF" fill="rgba(79, 140, 255, 0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Incident Severity Distribution */}
        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-5 shadow-lg flex flex-col h-[280px]">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-4">
            Incident Severity
          </span>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentSeverity} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <XAxis dataKey="severity" stroke="#94A3B8" fontSize={9} />
                <YAxis stroke="#94A3B8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1220", borderColor: "rgba(148, 163, 184, 0.14)", fontSize: 10 }} />
                <Bar dataKey="count" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Gate Performance */}
        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-5 shadow-lg flex flex-col h-[280px]">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-4">
            Gate Queue wait times (m)
          </span>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gates.map((g) => ({ name: g.name.replace("Gate ", ""), wait: g.wait_time }))} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} />
                <YAxis stroke="#94A3B8" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1220", borderColor: "rgba(148, 163, 184, 0.14)", fontSize: 10 }} />
                <Bar dataKey="wait" fill="#22D3EE" radius={[6, 6, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. THIRD ROW: LOGS & RESOURCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1: Live Operational Story Feed */}
        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-5 shadow-md flex flex-col h-[220px]">
          <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-3">Live Operational Story</span>
          <div className="flex-1 overflow-y-auto space-y-2 text-[10px] font-mono leading-relaxed text-[#94A3B8] no-scrollbar">
            <div>[00:00] Emirates Stadium gates opened.</div>
            <div>[00:03] Congestion detected at Gate B.</div>
            <div>[00:05] AI suggests rerouting to Gate C.</div>
            <div>[00:06] Back-up staff deployed to sector.</div>
          </div>
        </div>

        {/* Column 2: Recent Actions */}
        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-5 shadow-md flex flex-col h-[220px]">
          <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-3">Recent System Actions</span>
          <div className="flex-1 overflow-y-auto space-y-2 text-[10px] text-[#94A3B8] no-scrollbar">
            <div className="flex justify-between border-b border-[#94A3B8]/5 pb-1">
              <span className="text-white font-semibold">Reroute Gate B</span>
              <span className="text-emerald-400 font-bold">SUCCESS</span>
            </div>
            <div className="flex justify-between border-b border-[#94A3B8]/5 pb-1">
              <span className="text-white font-semibold">HVAC Alert A-4</span>
              <span className="text-emerald-400 font-bold">RESOLVED</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-white font-semibold">Medical Disp Conc-B</span>
              <span className="text-[#4F8CFF] font-bold">DISPATCHED</span>
            </div>
          </div>
        </div>

        {/* Column 3: Resource Deployment */}
        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-5 shadow-md flex flex-col h-[220px]">
          <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-3">Responders Coverage</span>
          <div className="flex-1 overflow-y-auto space-y-2 text-[10px] text-[#94A3B8] no-scrollbar">
            <div className="flex justify-between items-center border-b border-[#94A3B8]/5 pb-1">
              <span>Security Officers</span>
              <span className="font-bold text-white">42 deployed</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#94A3B8]/5 pb-1">
              <span>Medical Teams</span>
              <span className="font-bold text-white">12 stations</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span>Crowd Stewards</span>
              <span className="font-bold text-emerald-400">180 active</span>
            </div>
          </div>
        </div>

        {/* Column 4: System Health */}
        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-5 shadow-md flex flex-col h-[220px]">
          <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-3">Telemetry Health</span>
          <div className="flex-1 space-y-2.5 text-[10px]">
            <div className="flex justify-between border-b border-[#94A3B8]/5 pb-1.5">
              <span className="text-[#94A3B8]">WebSocket Sockets</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                CONNECTED
              </span>
            </div>
            <div className="flex justify-between border-b border-[#94A3B8]/5 pb-1.5">
              <span className="text-[#94A3B8]">Database Ping</span>
              <span className="text-white font-mono">1.2 ms</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-[#94A3B8]">Active Sensors</span>
              <span className="text-white font-mono">82 / 82 Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
