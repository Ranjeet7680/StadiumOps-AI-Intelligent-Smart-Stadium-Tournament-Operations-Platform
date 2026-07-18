import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  const [activeTwinLayer, setActiveTwinLayer] = useState("density");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const metrics = [
    { label: "Active Spectators", value: "68,420", color: "text-[#4F8CFF]", icon: "groups" },
    { label: "Match Readiness", value: "98.5%", color: "text-[#22C55E]", icon: "check_circle" },
    { label: "AI Predictions", value: "42", color: "text-[#8B5CF6]", icon: "psychology" },
    { label: "Active Zones", value: "16", color: "text-[#22D3EE]", icon: "grid_view" },
    { label: "Platform Uptime", value: "99.99%", color: "text-[#22C55E]", icon: "dns" },
  ];

  const capabilities = [
    {
      title: "AI Operations Agent",
      desc: "Predicts risks, optimizes logistics, and recommends operational actions in real-time.",
      icon: "psychology",
      color: "border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-[#8B5CF6]/5",
    },
    {
      title: "Stadium Digital Twin",
      desc: "Live spatial and structural representation of the complete venue, gates, and assets.",
      icon: "map",
      color: "border-[#4F8CFF]/30 text-[#4F8CFF] hover:bg-[#4F8CFF]/5",
    },
    {
      title: "Crowd Intelligence",
      desc: "Forecast congestion, bottle-necks, and exit velocities before they become critical.",
      icon: "groups",
      color: "border-[#22D3EE]/30 text-[#22D3EE] hover:bg-[#22D3EE]/5",
    },
    {
      title: "Tournament Control",
      desc: "Manage matches, teams, schedules, officials, and results in a unified console.",
      icon: "emoji_events",
      color: "border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/5",
    },
    {
      title: "Security Command",
      desc: "Unify optical cameras, restricted zones, staff patrols, and automated access systems.",
      icon: "security",
      color: "border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/5",
    },
    {
      title: "Smart Ticketing",
      desc: "Detect fraudulent transactions, analyze scanning velocity, and predict entry counts.",
      icon: "confirmation_number",
      color: "border-[#22C55E]/30 text-[#22C55E] hover:bg-[#22C55E]/5",
    },
    {
      title: "Emergency Intelligence",
      desc: "Coordinate evacuation routes, hazard containment, and emergency dispatch links.",
      icon: "emergency",
      color: "border-[#FF304F]/30 text-[#FF304F] hover:bg-[#FF304F]/5",
    },
    {
      title: "Sustainability Intelligence",
      desc: "Monitor HVAC telemetry, water flow, renewable inputs, and carbon foot printing.",
      icon: "bolt",
      color: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/5",
    },
  ];

  const twinLayers = [
    { id: "density", label: "Crowd Density", icon: "groups", color: "bg-[#4F8CFF]" },
    { id: "security", label: "Security", icon: "security", color: "bg-[#EF4444]" },
    { id: "facilities", label: "Facilities", icon: "construction", color: "bg-[#F59E0B]" },
    { id: "parking", label: "Parking", icon: "local_parking", color: "bg-[#22D3EE]" },
    { id: "energy", label: "Energy", icon: "bolt", color: "bg-emerald-400" },
    { id: "medical", label: "Medical", icon: "local_hospital", color: "bg-red-500" },
    { id: "routes", label: "Emergency Routes", icon: "emergency", color: "bg-[#FF304F]" },
  ];

  return (
    <div className="min-h-screen bg-[#060A12] text-[#F8FAFC] font-sans selection:bg-[#4F8CFF]/30">
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#0B1220]/90 backdrop-blur-md border-b border-[#94A3B8]/14 shadow-lg shadow-black/20" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-xl text-[#4F8CFF] font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>
                stadium
              </span>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">StadiumOps AI</span>
              <span className="text-[8px] text-[#4F8CFF] font-bold tracking-widest uppercase block">COMMAND CONSOLE</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#94A3B8]">
            <a href="#capabilities" className="hover:text-white transition-colors">Platform</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Solutions</a>
            <a href="#digital-twin" className="hover:text-white transition-colors">Digital Twin</a>
            <a href="#capabilities" className="hover:text-white transition-colors">AI Intelligence</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </nav>

          {/* Right Action Menu */}
          <div className="flex items-center gap-3">
            <span className="hidden lg:flex items-center gap-1.5 bg-[#0B1220] border border-[#94A3B8]/14 py-1.5 px-3 rounded-full text-[10px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              SYSTEM ONLINE
            </span>
            <Link
              to="/login"
              className="text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-[#4F8CFF]/20"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center justify-center">
        {/* Abstract grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(#4F8CFF 1px, transparent 0), radial-gradient(#8B5CF6 1px, transparent 0)", backgroundSize: "40px 40px", backgroundPosition: "0 0, 20px 20px" }} />
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#4F8CFF]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[550px] h-[550px] rounded-full bg-[#8B5CF6]/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#8B5CF6]">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              Next-Gen Autonomous Operations
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              Every Stadium.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] via-[#8B5CF6] to-[#22D3EE]">
                One Intelligent OS.
              </span>
            </h1>
            <p className="text-base text-[#94A3B8] leading-relaxed max-w-xl">
              Predict crowds, coordinate tournaments, automate operations, respond to incidents, and control your entire venue through one AI-powered command center.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate("/login")}
                className="bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white font-bold rounded-xl py-3.5 px-6 text-sm transition-all shadow-lg shadow-[#4F8CFF]/15 border border-[#4F8CFF]/20 flex items-center gap-2"
              >
                <span>Enter Command Center</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <a
                href="#digital-twin"
                className="bg-[#111B2E] hover:bg-[#152238] border border-[#94A3B8]/14 text-white font-semibold rounded-xl py-3.5 px-6 text-sm transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm text-[#4F8CFF]">play_circle</span>
                <span>Watch Live Simulation</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            {/* Interactive futuristic stadium command interface mockup */}
            <div className="w-full max-w-md bg-[#0B1220]/80 border border-[#94A3B8]/14 rounded-2xl p-4 shadow-2xl relative overflow-hidden active-border-glow">
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,rgba(79,140,255,0.4)_0,transparent_70%)] pointer-events-none" />

              <div className="flex justify-between items-center border-b border-[#94A3B8]/14 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#EF4444]">TWIN LIVE VIEW</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#152238]" />
                  <span className="w-2 h-2 rounded-full bg-[#152238]" />
                  <span className="w-2 h-2 rounded-full bg-[#152238]" />
                </div>
              </div>

              {/* Stadium Graphic */}
              <div className="relative h-64 bg-[#060A12] border border-[#94A3B8]/10 rounded-xl flex items-center justify-center overflow-hidden">
                <div className="absolute w-56 h-56 rounded-full border border-[#4F8CFF]/10 flex items-center justify-center animate-spin" style={{ animationDuration: "35s" }}>
                  <div className="w-48 h-48 rounded-full border border-dashed border-[#8B5CF6]/20 flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full border border-[#22D3EE]/10 flex items-center justify-center" />
                  </div>
                </div>

                <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-[#4F8CFF] animate-ping" />
                <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <div className="absolute top-1/2 right-1/3 w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-bounce" />
                <div className="absolute bottom-1/4 left-1/4 w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />

                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                  <path d="M 50,50 Q 150,100 200,120" stroke="#22D3EE" strokeWidth="1.5" fill="none" className="flow-line" />
                  <path d="M 350,50 Q 250,150 200,120" stroke="#FF304F" strokeWidth="1.5" fill="none" className="flow-line" />
                  <path d="M 200,220 L 200,120" stroke="#22C55E" strokeWidth="1.5" fill="none" className="flow-line" />
                </svg>

                <div className="absolute top-4 right-4 bg-[#111B2E]/95 border border-[#8B5CF6]/30 p-2.5 rounded-xl shadow-lg max-w-[160px] text-left">
                  <div className="flex items-center gap-1.5 text-[9px] text-[#8B5CF6] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[11px]">psychology</span>
                    AI Prediction
                  </div>
                  <h4 className="text-[10px] font-black text-white mt-1">Gate B queue peak</h4>
                  <p className="text-[9px] text-[#94A3B8] mt-0.5 leading-tight">Congestion probability 84% in 12m.</p>
                </div>

                <div className="z-10 text-center bg-[#0B1220]/90 border border-[#94A3B8]/20 px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-xl">
                  <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Active Egress</span>
                  <div className="text-lg font-black text-white tracking-tight mt-0.5">84.2% Flow</div>
                  <div className="text-[9px] font-semibold text-emerald-400 mt-0.5">Normal Evac Routes</div>
                </div>

                <div className="absolute bottom-3 left-3 bg-[#0B1220] border border-[#94A3B8]/10 py-1 px-2.5 rounded-lg text-[9px] font-bold text-white flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF] animate-pulse" />
                  Gate Congestion Index
                </div>
              </div>

              {/* Bottom statistics panel */}
              <div className="grid grid-cols-3 gap-2.5 mt-3 text-center">
                <div className="bg-[#111B2E] border border-[#94A3B8]/10 p-2 rounded-xl">
                  <span className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest block">Inflow rate</span>
                  <span className="text-xs font-black text-white mt-1 block">854/min</span>
                </div>
                <div className="bg-[#111B2E] border border-[#94A3B8]/10 p-2 rounded-xl">
                  <span className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest block">SLA countdown</span>
                  <span className="text-xs font-black text-[#F59E0B] mt-1 block">04:22</span>
                </div>
                <div className="bg-[#111B2E] border border-[#94A3B8]/10 p-2 rounded-xl">
                  <span className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest block">Safety state</span>
                  <span className="text-xs font-black text-emerald-400 mt-1 block">SECURE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE METRICS STRIP */}
      <section className="bg-[#0B1220] border-y border-[#94A3B8]/14 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-6">
          {metrics.map((m, idx) => (
            <div key={idx} className="flex items-center gap-3 min-w-[160px] justify-center md:justify-start">
              <div className="w-9 h-9 rounded-lg bg-[#111B2E] border border-[#94A3B8]/14 flex items-center justify-center text-[#94A3B8]">
                <span className="material-symbols-outlined text-lg">{m.icon}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block">
                  {m.label}
                </span>
                <span className={`text-lg font-black tracking-tight ${m.color} mt-0.5 block`}>
                  {m.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM CAPABILITIES */}
      <section id="capabilities" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#060A12] relative">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-[#4F8CFF] uppercase tracking-widest">Core Ecosystem</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Enterprise Capabilities Built-In</h2>
            <p className="text-xs text-[#94A3B8]">
              Unifying event logistics, safety monitoring, athlete analytics, and crowd prediction in a single command shell.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((cap, idx) => (
              <div
                key={idx}
                className={`bg-[#0B1220] border rounded-2xl p-5 hover:border-white/10 transition-all hover:scale-[1.01] duration-300 shadow-md ${cap.color.split(" ")[0]} flex flex-col justify-between h-[180px]`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="material-symbols-outlined text-2xl">{cap.icon}</span>
                    <span className="text-[9px] bg-[#111B2E] border border-[#94A3B8]/10 text-white font-bold py-0.5 px-2 rounded-full uppercase tracking-widest">
                      ACTIVE
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-3.5">{cap.title}</h3>
                  <p className="text-[11px] text-[#94A3B8] mt-1.5 leading-normal line-clamp-3">
                    {cap.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B1220] border-y border-[#94A3B8]/14">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-extrabold text-[#8B5CF6] uppercase tracking-widest">Tactical Pipeline</span>
            <h2 className="text-3xl font-black text-white tracking-tight">How the Operations Platform Works</h2>
            <p className="text-xs text-[#94A3B8]">
              A continuous, automated feedback loop that processes raw venue signals into guided actions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="bg-[#111B2E] border border-[#94A3B8]/14 rounded-2xl p-6 shadow-lg relative">
              <span className="absolute top-4 right-4 text-3xl font-black text-[#4F8CFF]/10">01</span>
              <div className="w-10 h-10 rounded-xl bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 flex items-center justify-center text-[#4F8CFF] mb-4">
                <span className="material-symbols-outlined">sensors</span>
              </div>
              <h3 className="text-sm font-bold text-white">1. Sense</h3>
              <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                Collect raw streams from optical cameras, IoT door turnstiles, ticket registries, concession points, and parking sensors.
              </p>
            </div>

            <div className="bg-[#111B2E] border border-[#94A3B8]/14 rounded-2xl p-6 shadow-lg relative">
              <span className="absolute top-4 right-4 text-3xl font-black text-[#8B5CF6]/10">02</span>
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] mb-4">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <h3 className="text-sm font-bold text-white">2. Understand</h3>
              <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                Operational AI models processes telemetry to identify anomalous bottlenecks, scan rate degradation, or security events.
              </p>
            </div>

            <div className="bg-[#111B2E] border border-[#94A3B8]/14 rounded-2xl p-6 shadow-lg relative">
              <span className="absolute top-4 right-4 text-3xl font-black text-[#22D3EE]/10">03</span>
              <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE] mb-4">
                <span className="material-symbols-outlined">insights</span>
              </div>
              <h3 className="text-sm font-bold text-white">3. Predict</h3>
              <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                Forecast queue wait times, zone densities, and emergency evacuation vectors 30 minutes in advance.
              </p>
            </div>

            <div className="bg-[#111B2E] border border-[#94A3B8]/14 rounded-2xl p-6 shadow-lg relative">
              <span className="absolute top-4 right-4 text-3xl font-black text-[#22C55E]/10">04</span>
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] mb-4">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <h3 className="text-sm font-bold text-white">4. Act</h3>
              <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
                Deliver recommended tasks to responders, update digital signage, reroute ticketing gates, or execute SOS protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DIGITAL TWIN SHOWCASE */}
      <section id="digital-twin" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#060A12] relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-extrabold text-[#22D3EE] uppercase tracking-widest">Visual Command</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Interactive Venue Digital Twin</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Explore stadium telemetry through spatial mapping layers. Toggle filters to inspect safety thresholds, crowd densities, medical tents, and parking efficiency instantly.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {twinLayers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveTwinLayer(layer.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                    activeTwinLayer === layer.id
                      ? "bg-[#152238] border-[#4F8CFF] text-white shadow-md shadow-[#4F8CFF]/5"
                      : "bg-[#0B1220] border-[#94A3B8]/10 text-[#94A3B8] hover:border-[#94A3B8]/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{layer.icon}</span>
                  <span>{layer.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-6 shadow-2xl relative min-h-[400px] flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-[#94A3B8]/14 pb-4 mb-4">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Twin Simulation Layer: {twinLayers.find((l) => l.id === activeTwinLayer)?.label}
              </span>
              <span className="bg-[#4F8CFF]/10 text-[#4F8CFF] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                Interactive Grid
              </span>
            </div>

            <div className="relative flex-1 bg-[#060A12] border border-[#94A3B8]/10 rounded-xl min-h-[300px] flex items-center justify-center overflow-hidden p-4">
              <div className="w-56 h-36 border border-white/10 rounded-xl relative flex items-center justify-center">
                <div className="w-px h-full bg-white/10 absolute left-1/2" />
                <div className="w-16 h-16 rounded-full border border-white/10 absolute" />

                {activeTwinLayer === "density" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute top-2 left-6 w-12 h-12 rounded-full bg-[#4F8CFF]/20 border border-[#4F8CFF]/40 animate-pulse" />
                    <div className="absolute bottom-4 right-10 w-16 h-16 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/40 animate-pulse" />
                    <span className="text-[10px] text-[#4F8CFF] font-bold bg-[#0B1220]/90 px-2 py-1 rounded border border-[#4F8CFF]/30">
                      Crowd Density Overlap
                    </span>
                  </div>
                )}

                {activeTwinLayer === "security" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute top-2 right-4 w-6 h-6 rounded bg-[#EF4444]/20 border border-[#EF4444] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[10px] text-[#EF4444]">lock</span>
                    </div>
                    <span className="text-[10px] text-[#EF4444] font-bold bg-[#0B1220]/90 px-2 py-1 rounded border border-[#EF4444]/30">
                      Restricted Access Zone 4 Alert
                    </span>
                  </div>
                )}

                {activeTwinLayer === "facilities" && (
                  <div className="absolute inset-0 flex items-center justify-center flex-col justify-center">
                    <div className="absolute bottom-2 left-10 text-[9px] bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">elevator</span> HVAC 2 Fault
                    </div>
                    <span className="text-[10px] text-[#F59E0B] font-bold bg-[#0B1220]/90 px-2 py-1 rounded border border-[#F59E0B]/30">
                      Infrastructure Monitoring
                    </span>
                  </div>
                )}

                {activeTwinLayer === "parking" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute top-6 left-12 text-[9px] bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 px-2 py-0.5 rounded flex items-center gap-1">
                      Lot A: 96%
                    </div>
                    <span className="text-[10px] text-[#22D3EE] font-bold bg-[#0B1220]/90 px-2 py-1 rounded border border-[#22D3EE]/30">
                      Dynamic Parking Fill Ratio
                    </span>
                  </div>
                )}

                {activeTwinLayer === "energy" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-emerald-400 font-bold bg-[#0B1220]/90 px-2 py-1 rounded border border-emerald-500/30">
                      Solar Intake: 420 kW/h
                    </span>
                  </div>
                )}

                {activeTwinLayer === "medical" && (
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-1">
                    <div className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">local_hospital</span> Medical Link A
                    </div>
                  </div>
                )}

                {activeTwinLayer === "routes" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full opacity-65">
                      <path d="M 10 70 Q 110 20 220 70" stroke="#FF304F" strokeWidth="2.5" fill="none" className="flow-line" />
                    </svg>
                    <span className="text-[10px] text-[#FF304F] font-bold bg-[#0B1220]/90 px-2 py-1 rounded border border-[#FF304F]/30 z-10">
                      Evacuation Vector Active
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 text-[10px] text-[#94A3B8] leading-relaxed border-t border-[#94A3B8]/10 pt-4 text-center">
              Click buttons on the left panel to trigger interactive telemetry overlays.
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0B1220] border-y border-[#94A3B8]/14">
        <div className="max-w-4xl mx-auto space-y-10 text-left">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-[#4F8CFF] uppercase tracking-widest">Product Integrity</span>
            <h2 className="text-3xl font-black text-white tracking-tight">Built for the Most Complex Live Environments</h2>
            <p className="text-xs text-[#94A3B8]">
              StadiumOps AI coordinates thousands of inputs to create a shared intelligence layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-[#94A3B8]">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#4F8CFF]">verified_user</span>
                Human-in-the-Loop Safeguards
              </h3>
              <p>
                We believe in responsible, safe operational governance. No high-impact, critical, or security-sensitive dispatches occur without human authorization. The AI Operations Agent proposes mitigation pathways that must be audited and verified by certified managers.
              </p>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#8B5CF6]">psychology</span>
                Responsible AI & Privacy
              </h3>
              <p>
                Evacuation planning, safety overrides, and staff deployment utilize anonymized queue and coordinate datasets. Facial analytics, video telemetry streams, and ticketing metadata adhere to WCAG and local safety compliance codes.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#22D3EE]">dns</span>
                Resilient Architecture
              </h3>
              <p>
                Our server backend leverages uvicorn-powered FastAPI routers, SQLAlchemy database connection pools, and Redis events queuing. In the event of network disruption, local node cache and WebSocket heartbeats guarantee command line survival.
              </p>

              <div className="bg-[#111B2E] border border-[#94A3B8]/10 rounded-xl p-4">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider block mb-2">Platform Flow Map</span>
                <div className="font-mono text-[9px] text-[#4F8CFF] space-y-1.5">
                  <div className="flex justify-between"><span>Data Sources</span> <span>↓ (IoT, CCTV, Tickets)</span></div>
                  <div className="flex justify-between"><span>Event Streaming</span> <span>↓ (WebSocket, Channels)</span></div>
                  <div className="flex justify-between"><span>AI Intelligence Layer</span> <span>↓ (Risk Prediction, RAG)</span></div>
                  <div className="flex justify-between"><span>Digital Twin</span> <span>↓ (Isometric Mesh, Layers)</span></div>
                  <div className="flex justify-between"><span className="text-white font-bold">Human Approval</span> <span>↓ (SOS Overrides, Auditing)</span></div>
                  <div className="flex justify-between text-[#22C55E] font-bold"><span>Operational Action</span> <span>✓ (Signage, Reroutes)</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#060A12] py-12 px-4 sm:px-6 lg:px-8 border-t border-[#94A3B8]/14 text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#4F8CFF]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#4F8CFF] text-base">stadium</span>
              </div>
              <span className="font-black text-white text-sm">StadiumOps AI</span>
            </div>
            <p className="max-w-sm text-[11px]">
              The autonomous digital twin and sports tournament orchestration system. Completely designed to provide high-clarity event operations management.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-white transition-colors">Command Center</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Digital Twin</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">AI Intelligence</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">System Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">System Docs</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Compliance Specs</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">API Reference</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Security Auditing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Governance</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">Responsible AI</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Audit Register</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#94A3B8]/10 text-center text-[10px] text-[#94A3B8]">
          &copy; {new Date().getFullYear()} StadiumOps AI Corp. All rights reserved. Professional Command Node.
        </div>
      </footer>
    </div>
  );
}
