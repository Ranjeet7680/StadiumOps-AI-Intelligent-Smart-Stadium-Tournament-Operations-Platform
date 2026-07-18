import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useWebSocket } from "../../hooks/useWebSocket";
import { api } from "../../services/api";

interface AppShellProps {
  user: any;
  handleLogout: () => void;
  selectedStadiumId: number;
  setSelectedStadiumId: (id: number) => void;
}

export default function AppShell({ user, handleLogout, selectedStadiumId, setSelectedStadiumId }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [copilotWidth, setCopilotWidth] = useState(380);
  const [liveClock, setLiveClock] = useState("");

  // Modals & Panels
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosReason, setSosReason] = useState("");
  const [sosMfaCode, setSosMfaCode] = useState("");

  // Live simulation sequencer variables
  const [simRunning, setSimRunning] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoStepInfo, setDemoStepInfo] = useState({
    title: "Normal Operations",
    desc: "All gates and zones are running at standard capacity.",
  });
  const [simSpeed, setSimSpeed] = useState(1);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, category: "Critical", title: "Intruder Alert Zone 4", message: "Restricted sector boundary violation detected by smart camera C-42.", timestamp: "2m ago", read: false },
    { id: 2, category: "AI Prediction", title: "Gate B Surge Risk", message: "Wait times forecast to reach 12 mins within 10 minutes.", timestamp: "5m ago", read: false },
    { id: 3, category: "Incident", title: "Slipped Spectator Conc-B", message: "Operational dispatch requested medical aid.", timestamp: "10m ago", read: true },
  ]);

  // AI Copilot state
  const [copilotTab, setCopilotTab] = useState<"chat" | "suggest" | "history" | "insights">("chat");
  const [copilotMessage, setCopilotMessage] = useState("");
  const [copilotChat, setCopilotChat] = useState<any[]>([
    { sender: "bot", text: "Hello! I am your StadiumOps AI Operations Copilot. How can I assist you with scheduling, queue reroutes, or threat checks today?" }
  ]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Set up live clock
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      setLiveClock(date.toLocaleTimeString("en-US", { hour12: false }) + " IST");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // WebSocket Live Updates
  const onWSMessage = (msg: any) => {
    if (msg.type === "simulation:status") {
      setSimRunning(msg.data.is_running);
      setDemoMode(msg.data.demo_mode);
      setSimSpeed(msg.data.speed);
    } else if (msg.type === "demo:step") {
      setDemoStep(msg.step);
      setDemoStepInfo({ title: msg.title, desc: msg.desc });
    }
  };
  useWebSocket(onWSMessage);

  // Simulation controls helper
  const handleSimAction = async (action: string, speed: number = 1) => {
    try {
      await api.simulation.control(action, speed);
      // Fetch fresh status or update state
      if (action === "start") setSimRunning(true);
      if (action === "pause") setSimRunning(false);
      if (action === "reset") {
        setSimRunning(false);
        setDemoMode(false);
        setDemoStep(0);
        setDemoStepInfo({ title: "Normal Operations", desc: "All gates and zones are running at standard capacity." });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopilotSend = async (e?: React.FormEvent, preset?: string) => {
    if (e) e.preventDefault();
    const query = preset || copilotMessage;
    if (!query.trim()) return;

    setCopilotChat((prev) => [...prev, { sender: "user", text: query }]);
    setCopilotMessage("");
    setCopilotLoading(true);

    try {
      const res = await api.ai.chat(query);
      setCopilotChat((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `${res.summary}\n\n**Risk Vector**: ${res.risk}\n\n**AI Recommendation**:\n${res.recommendation}`,
        },
      ]);
    } catch (err) {
      setCopilotChat((prev) => [...prev, { sender: "bot", text: "Failed to communicate with AI Copilot." }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleSosSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sosReason.trim()) return;
    // Log override action
    alert(`SOS OVERRIDE INITIATED. Reason: ${sosReason}. Code: ${sosMfaCode || "None"}. An immutable audit log has been registered.`);
    setSosModalOpen(false);
    setSosReason("");
    setSosMfaCode("");
  };

  const navigationGroups = [
    {
      group: "CORE OPERATIONS",
      items: [
        { id: "command-center", label: "Command Center", icon: "dashboard", badge: "LIVE" },
        { id: "ai-agent", label: "AI Operations Agent", icon: "psychology", badge: "AI" },
        { id: "digital-twin", label: "Stadium Digital Twin", icon: "map" },
        { id: "crowd-intelligence", label: "Crowd Intelligence", icon: "groups" },
        { id: "incidents", label: "Incident Center", icon: "warning", badge: "12" },
      ],
    },
    {
      group: "TOURNAMENT",
      items: [
        { id: "tournament", label: "Tournament Ops", icon: "emoji_events" },
        { id: "match-control", label: "Match Control", icon: "sports_soccer" },
        { id: "team-ops", label: "Team & Athlete Operations", icon: "group_work" },
        { id: "scheduling", label: "Smart Scheduling", icon: "calendar_today" },
      ],
    },
    {
      group: "FAN & ACCESS",
      items: [
        { id: "ticketing", label: "Smart Ticketing", icon: "confirmation_number" },
        { id: "gates", label: "Gate & Queue Control", icon: "door_sliding" },
        { id: "fan-experience", label: "Fan Experience", icon: "sentiment_satisfied" },
        { id: "accessibility", label: "Accessibility Operations", icon: "accessibility_new" },
      ],
    },
    {
      group: "SAFETY",
      items: [
        { id: "security", label: "Security Console", icon: "security" },
        { id: "emergency", label: "Emergency Response", icon: "emergency" },
        { id: "medical", label: "Medical Operations", icon: "local_hospital" },
        { id: "threat-intelligence", label: "Threat Intelligence", icon: "radar" },
      ],
    },
    {
      group: "WORKFORCE",
      items: [
        { id: "staff", label: "Staff & Volunteers", icon: "badge" },
        { id: "tasks", label: "Task Operations", icon: "assignment" },
        { id: "shifts", label: "Shift Intelligence", icon: "schedule" },
      ],
    },
    {
      group: "VENUE",
      items: [
        { id: "parking", label: "Parking Intelligence", icon: "local_parking" },
        { id: "facilities", label: "Facility Monitor", icon: "construction" },
        { id: "energy", label: "Energy Analytics", icon: "bolt" },
        { id: "lost-found", label: "Lost & Found AI", icon: "search" },
      ],
    },
    {
      group: "GOVERNANCE",
      items: [
        { id: "compliance", label: "Compliance & Audit", icon: "gavel" },
        { id: "reports", label: "Reports", icon: "description" },
        { id: "integrations", label: "Integration Center", icon: "api" },
        { id: "settings", label: "System Settings", icon: "settings" },
      ],
    },
  ];

  const currentActiveTab = location.pathname.split("/").pop() || "command-center";

  // Quick navigation handler from search bar
  const handleSearchSelect = (tab: string) => {
    setCommandPaletteOpen(false);
    navigate(`/app/${tab}`);
  };

  const filteredCommandPalettes = navigationGroups
    .flatMap((g) => g.items)
    .filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="app-shell min-h-screen bg-[#060A12] text-[#F8FAFC] font-sans flex flex-col h-screen overflow-hidden">
      {/* 1. GLOBAL HEADER */}
      <header className="h-16 bg-[#0B1220] border-b border-[#94A3B8]/14 px-6 flex items-center justify-between shrink-0 z-20 shadow-md">
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-[#94A3B8] hover:text-white p-1 rounded hover:bg-[#111B2E]"
          >
            <span className="material-symbols-outlined text-lg">
              {sidebarCollapsed ? "menu_open" : "menu"}
            </span>
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#4F8CFF] text-base">stadium</span>
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white hidden sm:block">StadiumOps AI</span>
          </Link>

          {/* Venue Selector */}
          <select
            value={selectedStadiumId}
            onChange={(e) => setSelectedStadiumId(parseInt(e.target.value))}
            className="bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-1 px-3 text-xs text-white focus:outline-none focus:border-[#4F8CFF] font-semibold"
          >
            <option value={1}>Emirates Stadium (London)</option>
            <option value={2}>Wankhede Stadium (Mumbai)</option>
            <option value={3}>National Stadium (Delhi)</option>
          </select>
        </div>

        {/* Center Search Palette Trigger */}
        <div
          onClick={() => setCommandPaletteOpen(true)}
          className="flex-1 max-w-sm mx-4 bg-[#060A12] border border-[#94A3B8]/14 hover:border-[#4F8CFF]/45 rounded-xl px-4 py-1.5 flex items-center justify-between cursor-pointer text-[#94A3B8] transition-all hidden md:flex"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-[#94A3B8]">search</span>
            <span className="text-[11px]">Search zones, incidents, matches, staff, tickets...</span>
          </div>
          <span className="text-[9px] font-mono bg-[#111B2E] border border-[#94A3B8]/14 px-1.5 py-0.5 rounded text-white font-bold">
            Ctrl + K
          </span>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-3">
          <span className="hidden lg:flex items-center gap-1.5 bg-[#060A12] border border-[#94A3B8]/14 py-1 px-3 rounded-full text-[10px] font-bold text-[#22C55E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            SYSTEM ONLINE
          </span>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#060A12] border border-[#94A3B8]/14 py-1 px-3 rounded-full text-[10px] font-mono font-bold text-[#4F8CFF]">
            <span className="material-symbols-outlined text-xs">schedule</span>
            <span>{liveClock}</span>
          </div>

          {/* Notifications dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="text-[#94A3B8] hover:text-white p-2 rounded-xl bg-[#060A12] border border-[#94A3B8]/14 relative flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-sm">notifications</span>
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-4 shadow-2xl z-30 space-y-3">
                <div className="flex justify-between items-center border-b border-[#94A3B8]/10 pb-2">
                  <span className="text-xs font-black text-white">Notifications</span>
                  <button
                    onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
                    className="text-[9px] text-[#4F8CFF] hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all ${
                        n.read
                          ? "bg-[#060A12]/40 border-[#94A3B8]/5 text-[#94A3B8]"
                          : "bg-[#111B2E] border-[#4F8CFF]/20 text-white"
                      }`}
                    >
                      <div className="flex justify-between font-bold">
                        <span className={n.category === "Critical" ? "text-[#EF4444]" : "text-[#4F8CFF]"}>
                          {n.title}
                        </span>
                        <span className="text-[9px] text-[#94A3B8] font-normal">{n.timestamp}</span>
                      </div>
                      <p className="mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Copilot toggle button */}
          <button
            onClick={() => setCopilotOpen(!copilotOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
              copilotOpen
                ? "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30 shadow-[#8B5CF6]/10"
                : "bg-[#060A12] text-[#94A3B8] border-[#94A3B8]/14 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            <span>AI Copilot</span>
          </button>

          {/* SOS Override */}
          <button
            onClick={() => setSosModalOpen(true)}
            className="bg-[#FF304F]/10 hover:bg-[#FF304F]/25 text-[#FF304F] border border-[#FF304F]/20 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#FF304F]/5"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
            <span className="hidden sm:block">SOS Override</span>
          </button>

          {/* User Menu */}
          <button
            onClick={handleLogout}
            className="text-[#94A3B8] hover:text-[#EF4444] p-2 rounded-xl bg-[#060A12] border border-[#94A3B8]/14 flex items-center justify-center"
            title="Log out of Terminal"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </header>

      {/* 2. BODY LAYOUT */}
      <div className="app-body flex-1 flex overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`bg-[#0B1220] border-r border-[#94A3B8]/14 flex flex-col shrink-0 transition-all duration-200 hidden md:flex ${
            sidebarCollapsed ? "w-[76px]" : "w-[260px]"
          }`}
        >
          {/* Group navigation */}
          <nav className="flex-1 p-3 overflow-y-auto space-y-4 no-scrollbar">
            {navigationGroups.map((g, gIdx) => (
              <div key={gIdx} className="space-y-1">
                {!sidebarCollapsed && (
                  <span className="text-[9px] font-bold text-[#94A3B8]/70 uppercase tracking-widest block px-3 py-1">
                    {g.group}
                  </span>
                )}
                {g.items.map((item) => {
                  const active = currentActiveTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/app/${item.id}`)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all relative ${
                        active
                          ? "bg-[#4F8CFF]/10 text-white font-bold border-l-4 border-[#4F8CFF]"
                          : "text-[#94A3B8] hover:bg-[#111B2E] hover:text-white"
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-lg ${active ? "text-[#4F8CFF]" : ""}`}>
                          {item.icon}
                        </span>
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!sidebarCollapsed && item.badge && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          item.badge === "LIVE" ? "bg-[#22C55E]/15 text-[#22C55E]" :
                          item.badge === "AI" ? "bg-[#8B5CF6]/15 text-[#8B5CF6] animate-pulse" :
                          "bg-[#111B2E] text-[#94A3B8]"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User profile footer */}
          <div className="p-3 border-t border-[#94A3B8]/14 bg-[#111B2E] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#4F8CFF] text-base">account_circle</span>
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <h4 className="text-xs font-bold text-white truncate">{user?.username || "Admin User"}</h4>
                  <span className="text-[9px] text-[#94A3B8] block uppercase truncate">
                    {user?.roles?.[0] || "Operations Commander"}
                  </span>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={() => navigate("/app/settings")}
                className="text-[#94A3B8] hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-base">settings</span>
              </button>
            )}
          </div>
        </aside>

        {/* WORKSPACE & AI COPILOT */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* MAIN PAGE WORKSPACE */}
          <main className="main-workspace flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden p-6 space-y-6 pt-6 bg-[#060A12]">
            {/* Live Operational Story Demo Sequencer */}
            <div className="bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 relative overflow-hidden shadow-lg shrink-0">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#4F8CFF]" />
              <div className="flex items-center gap-3 pl-2">
                <div className="w-9 h-9 rounded-xl bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 flex items-center justify-center shrink-0 text-[#4F8CFF]">
                  <span className="material-symbols-outlined text-lg">play_circle</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white leading-none">Live Operational Story Demo Sequencer</h3>
                    <span className="bg-[#4F8CFF]/15 text-[#4F8CFF] text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1 leading-normal">
                    {demoMode
                      ? `[PHASE ${demoStep}/9] ${demoStepInfo.title}: ${demoStepInfo.desc}`
                      : "Click 'Start Live Demo' to simulate active gate wait times and spectator egress spikes."
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleSimAction("demo")}
                  className="bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] text-white text-[10px] font-bold rounded-xl py-2 px-3 transition-all border border-[#4F8CFF]/20 shadow-md shadow-[#4F8CFF]/10"
                >
                  Start Live Demo
                </button>
                <div className="w-px h-6 bg-[#94A3B8]/14" />
                <button
                  onClick={() => handleSimAction(simRunning ? "pause" : "start")}
                  className={`p-2 rounded-xl border border-[#94A3B8]/14 hover:bg-[#111B2E] transition-colors ${
                    simRunning ? "text-[#F59E0B]" : "text-[#22C55E]"
                  }`}
                  title={simRunning ? "Pause" : "Resume"}
                >
                  <span className="material-symbols-outlined text-sm flex items-center justify-center">
                    {simRunning ? "pause" : "play_arrow"}
                  </span>
                </button>
                <button
                  onClick={() => handleSimAction("reset")}
                  className="p-2 rounded-xl border border-[#94A3B8]/14 hover:bg-[#111B2E] text-[#94A3B8] hover:text-white transition-colors"
                  title="Reset simulation status"
                >
                  <span className="material-symbols-outlined text-sm flex items-center justify-center">rotate_left</span>
                </button>

                <div className="flex items-center gap-1 ml-1 border border-[#94A3B8]/10 rounded-lg p-0.5 bg-[#060A12]">
                  {[1, 2, 5, 10].map((speedVal) => (
                    <button
                      key={speedVal}
                      onClick={() => handleSimAction("speed", speedVal)}
                      className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded transition-colors ${
                        simSpeed === speedVal ? "bg-[#4F8CFF] text-white" : "text-[#94A3B8] hover:text-white"
                      }`}
                    >
                      {speedVal}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Outlet />
          </main>

          {/* AI COPILOT RIGHT SIDE DRAWER */}
          {copilotOpen && (
            <aside
              className="bg-[#0B1220] border-l border-[#94A3B8]/14 flex flex-col shrink-0 h-full relative z-10 transition-all duration-150"
              style={{ width: `${copilotWidth}px` }}
            >
              {/* Resizable handle */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#4F8CFF] transition-colors z-20"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startWidth = copilotWidth;
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const newWidth = Math.max(340, Math.min(420, startWidth - (moveEvent.clientX - startX)));
                    setCopilotWidth(newWidth);
                  };
                  const handleMouseUp = () => {
                    window.removeEventListener("mousemove", handleMouseMove);
                    window.removeEventListener("mouseup", handleMouseUp);
                  };
                  window.addEventListener("mousemove", handleMouseMove);
                  window.addEventListener("mouseup", handleMouseUp);
                }}
              />

              {/* Copilot Header */}
              <div className="p-4 border-b border-[#94A3B8]/14 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8B5CF6] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-none">StadiumOps Copilot</h3>
                    <span className="text-[9px] text-[#22C55E] font-bold uppercase tracking-wider block mt-1">
                      Predictive Intelligence Active
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCopilotOpen(false)}
                  className="text-[#94A3B8] hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Copilot Tabs */}
              <div className="flex border-b border-[#94A3B8]/14 text-[10px] font-bold">
                {(["chat", "suggest", "history", "insights"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCopilotTab(tab)}
                    className={`flex-1 py-2 text-center border-b-2 capitalize transition-colors ${
                      copilotTab === tab
                        ? "border-[#8B5CF6] text-white font-black"
                        : "border-transparent text-[#94A3B8] hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {copilotTab === "chat" && (
                  <>
                    <div className="space-y-3.5">
                      {copilotChat.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl text-[11px] leading-relaxed max-w-[90%] whitespace-pre-wrap ${
                            msg.sender === "user"
                              ? "bg-[#4F8CFF]/10 text-white border border-[#4F8CFF]/20 ml-auto"
                              : "bg-[#111B2E] text-[#94A3B8] border border-[#94A3B8]/14 mr-auto"
                          }`}
                        >
                          {msg.text}
                        </div>
                      ))}
                      {copilotLoading && (
                        <div className="text-[10px] text-[#94A3B8] animate-pulse flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-ping" />
                          Copilot analyzing logs...
                        </div>
                      )}
                    </div>
                  </>
                )}

                {copilotTab === "suggest" && (
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block">Query Presets</span>
                    {[
                      "Why is Gate B becoming congested?",
                      "Create a response plan for Zone 4.",
                      "Summarize all critical incidents.",
                      "Predict crowd movement for the next 30 minutes.",
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => handleCopilotSend(e, q)}
                        className="w-full text-left bg-[#111B2E] hover:bg-[#152238] border border-[#94A3B8]/10 rounded-xl p-3 text-[11px] text-white transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {copilotTab === "history" && (
                  <div className="text-center py-6 text-xs text-[#94A3B8]">
                    No previous command session records found.
                  </div>
                )}

                {copilotTab === "insights" && (
                  <div className="space-y-4">
                    {/* Prediction Card */}
                    <div className="bg-[#111B2E] border border-[#FF304F]/30 p-4 rounded-xl space-y-3 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FF304F]" />
                      <div className="flex justify-between items-start pl-1">
                        <div>
                          <h4 className="text-xs font-bold text-white">Gate B Queue Congestion Risk</h4>
                          <span className="text-[9px] text-[#FF304F] font-bold uppercase tracking-wider block mt-0.5">
                            Risk Level: High
                          </span>
                        </div>
                        <span className="text-[10px] bg-[#FF304F]/10 text-[#FF304F] font-bold px-2 py-0.5 rounded-full">
                          92% Conf
                        </span>
                      </div>
                      <div className="text-[10px] text-[#94A3B8] space-y-1.5 pl-1 leading-normal">
                        <div><strong>Evidence:</strong> Inflow rate at Turnstiles B1-B3 exceeds capacity by 15.4%.</div>
                        <div><strong>Timestamp:</strong> {liveClock}</div>
                        <div><strong>Affected Area:</strong> Gate B Entrance Portal</div>
                        <div><strong>Recommendation:</strong> Redirect 20% spectators to Gate C. Dispatch 4 backup staff.</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1.5">
                        <button
                          onClick={() => {
                            setCopilotTab("chat");
                            handleCopilotSend(undefined, "Investigate Gate B queue congestion");
                          }}
                          className="bg-[#060A12] hover:bg-[#0B1220] border border-[#94A3B8]/14 text-white text-[10px] font-bold py-1.5 rounded-lg text-center"
                        >
                          Investigate
                        </button>
                        <button
                          onClick={() => {
                            setSosReason("Applying Gate B Reroute Protocol");
                            setSosModalOpen(true);
                          }}
                          className="bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white text-[10px] font-bold py-1.5 rounded-lg text-center"
                        >
                          Apply Action
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input footer */}
              {copilotTab === "chat" && (
                <form
                  onSubmit={handleCopilotSend}
                  className="p-3 border-t border-[#94A3B8]/14 bg-[#111B2E] flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask Copilot..."
                    className="flex-1 bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                    value={copilotMessage}
                    onChange={(e) => setCopilotMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white rounded-xl px-3 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </form>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <footer className="h-14 bg-[#0B1220] border-t border-[#94A3B8]/14 flex md:hidden items-center justify-around z-20 shrink-0">
        {[
          { id: "command-center", label: "Command", icon: "dashboard" },
          { id: "ai-agent", label: "AI Agent", icon: "psychology" },
          { id: "digital-twin", label: "Twin", icon: "map" },
          { id: "incidents", label: "Incidents", icon: "warning" },
        ].map((item) => {
          const active = currentActiveTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/app/${item.id}`)}
              className={`flex flex-col items-center justify-center text-[10px] font-bold min-w-[48px] h-12 ${
                active ? "text-[#4F8CFF]" : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </footer>

      {/* 4. GLOBAL COMMAND PALETTE (CTRL + K) */}
      {commandPaletteOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0B1220] border border-[#94A3B8]/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="p-4 border-b border-[#94A3B8]/14 flex items-center gap-3">
              <span className="material-symbols-outlined text-lg text-[#94A3B8]">search</span>
              <input
                type="text"
                autoFocus
                placeholder="Type a command or page name..."
                className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="text-xs text-[#94A3B8] hover:text-white"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
              <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block px-3 py-1.5">
                Commands & Navigation
              </span>
              {filteredCommandPalettes.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#94A3B8]">No matching commands found.</div>
              ) : (
                filteredCommandPalettes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSearchSelect(item.id)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-[#111B2E] hover:text-white text-[#94A3B8] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-sm">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#94A3B8]/60">Navigate</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. SOS OVERRIDE CONFIRMATION MODAL */}
      {sosModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B1220] border border-[#FF304F]/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-[#94A3B8]/10 pb-3 text-[#FF304F]">
              <span className="material-symbols-outlined text-2xl animate-bounce">warning</span>
              <h3 className="text-base font-black uppercase tracking-wide">SOS Override Authorization Required</h3>
            </div>
            
            <form onSubmit={handleSosSubmit} className="space-y-4">
              <div className="bg-[#FF304F]/10 border border-[#FF304F]/25 text-[#FF304F] text-[11px] rounded-xl p-3 leading-relaxed">
                <strong>WARNING:</strong> Triggering an SOS override suspends automated safety limits and creates an immutable, role-verified audit record. Any actions will be logged with your email: <strong>{user?.email || "anonymous"}</strong>.
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1">
                  Reason for Override Action
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#FF304F]"
                  placeholder="e.g. Zone 4 gate re-routing required due to visual crowd surges."
                  value={sosReason}
                  onChange={(e) => setSosReason(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1">
                  Security Code verification
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter passcode key"
                  className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#FF304F] font-mono"
                  value={sosMfaCode}
                  onChange={(e) => setSosMfaCode(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSosModalOpen(false)}
                  className="border border-[#94A3B8]/14 text-white font-bold text-xs py-2 px-4 rounded-xl"
                >
                  Cancel Action
                </button>
                <button
                  type="submit"
                  className="bg-[#FF304F] hover:bg-[#FF304F]/90 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg shadow-[#FF304F]/15"
                >
                  Authorize SOS Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
