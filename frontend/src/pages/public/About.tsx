import { Link } from "react-router-dom";

export default function About() {
  const steps = [
    { name: "Data Sources", desc: "Sensors, optical cameras, tickets turnstiles, telemetry, concession gates, weather arrays" },
    { name: "Event Streaming", desc: "Real-time WebSocket server feeds, incident registers, DB transaction logs" },
    { name: "AI Intelligence Layer", desc: "Crowd density models, risk scores, incident recommendations, anomaly detectors" },
    { name: "Digital Twin", desc: "Spatial mapping meshes, live queue heatmaps, sensor overlays" },
    { name: "Decision Engine", desc: "Safety threshold gates, automated routing protocols, SOS overrides" },
    { name: "Human Approval", desc: "Certified review check gates, SLA confirmations, manual overrides" },
    { name: "Operational Action", desc: "LED signage grids updates, push alerts, response dispatches" },
  ];

  return (
    <div className="min-h-screen bg-[#060A12] text-[#F8FAFC] font-sans selection:bg-[#4F8CFF]/30 pb-20">
      {/* HEADER */}
      <header className="h-16 border-b border-[#94A3B8]/14 bg-[#0B1220]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg text-[#4F8CFF]">stadium</span>
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">StadiumOps AI</span>
          </Link>
          <div className="flex gap-4">
            <Link to="/" className="text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors">Welcome Page</Link>
            <Link to="/login" className="bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all">Sign In</Link>
          </div>
        </div>
      </header>

      {/* HERO HERO ABOUT */}
      <section className="pt-20 pb-12 px-4 max-w-4xl mx-auto text-left space-y-6">
        <span className="text-xs font-extrabold text-[#4F8CFF] uppercase tracking-widest block">Product & Mission Story</span>
        <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
          Built for the Most Complex Live Venue Environments
        </h1>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          StadiumOps AI creates a shared operational intelligence layer for venue operators, security teams, tournament managers, emergency responders, and facility crews.
        </p>
      </section>

      {/* DETAILED CONTENT SECTIONS */}
      <section className="px-4 max-w-4xl mx-auto space-y-12">
        {/* Why / Problem / Mission */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#4F8CFF]/10 flex items-center justify-center text-[#4F8CFF]">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <h3 className="text-sm font-bold text-white">Why StadiumOps Exists</h3>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Modern stadiums are complex mini-cities. Operations are frequently managed in fragmented silos, leading to blind spots, queue congestions, and slow incident response.
            </p>
          </div>

          <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444]">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <h3 className="text-sm font-bold text-white">The Core Problem</h3>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              When a gate queue surges or a medical event arises, supervisors need unified data instantly. Separate ticketing, camera feeds, and staff channels slow down resolution.
            </p>
          </div>

          <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <h3 className="text-sm font-bold text-white">Our Tactical Mission</h3>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              To consolidate all operational telemetry into one single-pane digital twin, enabling operations leaders to predict congestion, assign assets, and protect crowds.
            </p>
          </div>
        </div>

        {/* Platform Architecture */}
        <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Unified Platform Architecture</h3>
            <p className="text-xs text-[#94A3B8] mt-1">A sequential data orchestration pipeline ensuring responsible action.</p>
          </div>

          <div className="relative border-l border-[#94A3B8]/14 pl-6 ml-2 space-y-6 text-xs">
            {steps.map((s, idx) => (
              <div key={idx} className="relative">
                <div className="absolute left-[-31px] top-0 w-4 h-4 rounded-full bg-[#060A12] border border-[#4F8CFF] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF]" />
                </div>
                <h4 className="font-bold text-white">{s.name}</h4>
                <p className="text-[#94A3B8] mt-1 leading-normal">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Responsible AI, Privacy & Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-[#94A3B8]">
          <div className="space-y-3.5 bg-[#0B1220]/40 border border-[#94A3B8]/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8B5CF6]">psychology</span>
              Responsible AI Principles
            </h3>
            <p>
              StadiumOps AI does not make high-impact security, evacuation, or ticketing decisions autonomously. The AI Operations Agent highlights telemetry anomalies, calculates safety risks, and generates response plans. These are presented to managers who must authorize dispatch tasks.
            </p>
          </div>

          <div className="space-y-3.5 bg-[#0B1220]/40 border border-[#94A3B8]/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4F8CFF]">security</span>
              Security & Privacy Design
            </h3>
            <p>
              All camera streams are filtered locally on node servers. Facial details are scrubbed to protect spectator privacy; the crowd models rely solely on density coordinates and flow velocity tracking. Encrypted database layers prevent session hijacking.
            </p>
          </div>
        </div>

        {/* Technology Stack & Future Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Technology Stack</h3>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li className="flex justify-between border-b border-[#94A3B8]/10 pb-1">
                <span className="font-bold text-white">Core Framework</span>
                <span>FastAPI + Vite React SPA</span>
              </li>
              <li className="flex justify-between border-b border-[#94A3B8]/10 pb-1">
                <span className="font-bold text-white">Database System</span>
                <span>PostgreSQL + SQLite + SQLAlchemy</span>
              </li>
              <li className="flex justify-between border-b border-[#94A3B8]/10 pb-1">
                <span className="font-bold text-white">Real-Time Sockets</span>
                <span>WebSockets + event channels</span>
              </li>
              <li className="flex justify-between pb-1">
                <span className="font-bold text-white">UI Styling</span>
                <span>Tailwind CSS + Material Icons</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-6 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white">Future Roadmap</h3>
            <div className="space-y-2 text-[#94A3B8]">
              <div className="flex gap-2">
                <span className="text-[#4F8CFF] font-bold">Q3 2026:</span>
                <span>Integrate live optical LiDAR arrays for precise micro-density crowd mapping.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#8B5CF6] font-bold">Q4 2026:</span>
                <span>Deploy autonomous drone patrol schedules for parking queue optimization.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-400 font-bold">Q1 2027:</span>
                <span>Expand predictive ticket modeling using historical league weather databases.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
