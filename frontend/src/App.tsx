import React, { useState, useEffect } from "react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, LineChart, Line
} from "recharts";
import { api } from "./services/api";
import { useWebSocket } from "./hooks/useWebSocket";
import type { 
  User as UserType, Stadium, StadiumZone, Gate, Incident, 
  AIDecision, ParkingLot, Sensor, EnergyStats, 
  LostFoundItem, NotificationItem, AuditLogItem 
} from "./types";

export default function App() {
  // Navigation & Session
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<UserType | null>(null);
  
  // Sidebar expanded / collapsed (remembered in localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved === "true";
  });

  // Toggle sidebar and persist
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("sidebarCollapsed", String(next));
      return next;
    });
  };

  // Auth Form State
  const [loginEmail, setLoginEmail] = useState("admin@stadiumops.ai");
  const [loginPassword, setLoginPassword] = useState("stadium123");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Live State Data
  const [stadiums] = useState<Stadium[]>([
    { stadium_id: 1, name: "Emirates Stadium", capacity: 60000, location: "London", status: "Active" }
  ]);
  const [selectedStadiumId] = useState<number>(1);
  const [zones, setZones] = useState<StadiumZone[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<any>(null);
  const [_notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [_parking, setParking] = useState<ParkingLot[]>([]);
  const [_facilitySensors, setFacilitySensors] = useState<Sensor[]>([]);
  const [_energyStats, setEnergyStats] = useState<EnergyStats | null>(null);
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [_staffRecommendations, setStaffRecommendations] = useState<any[]>([]);
  const [_matches, setMatches] = useState<any[]>([]);

  // Simulation parameters
  const [simRunning, setSimRunning] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoStepInfo, setDemoStepInfo] = useState({ title: "Normal Operations", desc: "All gates and zones are running at standard capacity." });
  const [simSpeed, setSimSpeed] = useState(1);

  // Copilot State
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotMessage, setCopilotMessage] = useState("");
  const [copilotTab, setCopilotTab] = useState<"suggest" | "history" | "insights">("suggest");
  const [copilotChat, setCopilotChat] = useState<Array<{ sender: "user" | "bot"; text: string; data?: any }>>([
    { sender: "bot", text: "Hello! I am your StadiumOps AI Operations Copilot. How can I assist you with scheduling, queue reroutes, or threat checks today?" }
  ]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Command palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandPaletteSearch, setCommandPaletteSearch] = useState("");

  // Twin timeline scrub (12:00 PM to 10:00 PM)
  const [twinTimelineVal, setTwinTimelineVal] = useState<number>(30); // minutes from 12 PM

  // Modals state
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [selectedZoneTwin, setSelectedZoneTwin] = useState<StadiumZone | null>(null);
  const [activeDigitalTwinLayer, setActiveDigitalTwinLayer] = useState<"density" | "restricted" | "cctv">("density");

  // QR Scan simulation
  const [scanQR, setScanQR] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);

  // Lost & found form
  const [lfType, setLfType] = useState("Lost");
  const [lfCat, setLfCat] = useState("Electronics");
  const [lfDesc, setLfDesc] = useState("");
  const [lfLoc, setLfLoc] = useState("");

  // Workflow steps execution animation
  const [workflowActive, setWorkflowActive] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(0);

  // Interactive page-specific states
  const [schedulingSearch, setSchedulingSearch] = useState("");
  const [schedulingFilter, setSchedulingFilter] = useState("All");
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketLog, setTicketLog] = useState<{ id: string; name: string; zone: string; time: string; status: string }[]>([
    { id: "T-8472", name: "J. Doe", zone: "VIP Stand", time: "12:30 PM", status: "VALIDATED" },
    { id: "T-1948", name: "S. Lee", zone: "North Stand", time: "12:34 PM", status: "VALIDATED" }
  ]);
  const [facilitiesTemp, setFacilitiesTemp] = useState(21.5);
  const [facilitiesAutoHvac, setFacilitiesAutoHvac] = useState(true);
  const [sensorAlertThreshold, setSensorAlertThreshold] = useState(75);
  const [sensorFilter, setSensorFilter] = useState("All");
  const [lostFoundSearch, setLostFoundSearch] = useState("");
  const [energySavingActive, setEnergySavingActive] = useState(false);
  const [sustainabilityGoal, setSustainabilityGoal] = useState(85);
  const [activeCameraId, setActiveCameraId] = useState("CAM-101");

  // Clock
  const [liveClock, setLiveClock] = useState("");

  // Concession Queue states (Fan Exp tab)
  const [fanSentiment] = useState(94);
  const [concessionRating] = useState(88);

  // Setup live clock
  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      setLiveClock(date.toLocaleTimeString("en-US", { hour12: false }) + " IST");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut for search / command palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch initial profile
  useEffect(() => {
    if (token) {
      api.auth.me()
        .then(res => setUser(res))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        });
    }
  }, [token]);

  // Load telemetry data loop
  const loadTelemetry = async () => {
    try {
      const [zns, gts, incs, decs, notifs, prk, facs, nrg, lf, mtch, logs, recs] = await Promise.all([
        api.stadiums.getZones(selectedStadiumId),
        api.stadiums.getGates(selectedStadiumId),
        api.incidents.getIncidents(),
        api.ai.getDecisions(),
        api.notifications.getNotifications(),
        api.parking.getParking(),
        api.facilities.getFacilities(),
        api.facilities.getEnergyStats(),
        api.lostFound.getLostFound(),
        api.tournaments.getMatches(),
        api.audit.getAuditLogs(),
        api.staff.getRecommendations()
      ]);

      setZones(zns);
      setGates(gts);
      setIncidents(incs);
      setDecisions(decs);
      setNotifications(notifs);
      setParking(prk);
      setFacilitySensors(facs.sensors);
      setEnergyStats(nrg);
      setLostFoundItems(lf);
      setMatches(mtch);
      setAuditLogs(logs);
      setStaffRecommendations(recs);
    } catch (e) {
      console.error("Telemetry fetch error:", e);
    }
  };

  useEffect(() => {
    if (token) {
      loadTelemetry();
      const loop = setInterval(loadTelemetry, 5000);
      return () => clearInterval(loop);
    }
  }, [token, selectedStadiumId]);

  // WebSocket Live Updates
  const onWSMessage = (msg: any) => {
    console.log("WebSocket event received:", msg);
    if (msg.type === "simulation:status") {
      setSimRunning(msg.data.is_running);
      setDemoMode(msg.data.demo_mode);
      setSimSpeed(msg.data.speed);
    } else if (msg.type === "demo:step") {
      setDemoStep(msg.step);
      setDemoStepInfo({ title: msg.title, desc: msg.desc });
      loadTelemetry();
    } else if (msg.type === "simulation:tick" || msg.type === "incident:new" || msg.type === "demo:execution_complete") {
      loadTelemetry();
    }
  };

  useWebSocket(onWSMessage);

  // Authentication handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const res = await api.auth.login(loginEmail, loginPassword);
      localStorage.setItem("token", res.access_token);
      setToken(res.access_token);
      setUser({
        id: 0,
        username: res.username,
        email: res.email,
        roles: res.roles
      });
      loadTelemetry();
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Simulation controls
  const handleSimAction = async (action: string, speed: number = 1) => {
    try {
      await api.simulation.control(action, speed);
      loadTelemetry();
    } catch (e) {
      console.error(e);
    }
  };

  // AI Decision approve
  const handleApproveDecision = async (id: string) => {
    setWorkflowActive(true);
    setWorkflowStep(1);
    
    // Simulate multi-step sequential execution progress
    setTimeout(() => setWorkflowStep(2), 1500);
    setTimeout(() => setWorkflowStep(3), 3000);
    setTimeout(() => setWorkflowStep(4), 4500);
    setTimeout(async () => {
      try {
        await api.ai.approveDecision(id);
        loadTelemetry();
        const details = await api.ai.getDecisionDetails(id);
        setSelectedDecision(details.decision);
      } catch (e) {
        console.error(e);
      }
      setWorkflowActive(false);
      setWorkflowStep(0);
    }, 6000);
  };

  // AI Decision reject
  const handleRejectDecision = async (id: string) => {
    try {
      await api.ai.rejectDecision(id);
      loadTelemetry();
    } catch (e) {
      console.error(e);
    }
  };

  // AI Copilot send message
  const handleCopilotSend = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const query = customMsg || copilotMessage;
    if (!query.trim()) return;

    setCopilotChat(prev => [...prev, { sender: "user", text: query }]);
    setCopilotMessage("");
    setCopilotLoading(true);

    try {
      const res = await api.ai.chat(query);
      setCopilotChat(prev => [...prev, { 
        sender: "bot", 
        text: `${res.summary}\n\n**Risk Vector**: ${res.risk}\n\n**AI Recommendation**:\n${res.recommendation}`,
        data: res
      }]);
    } catch (err) {
      setCopilotChat(prev => [...prev, { sender: "bot", text: "Failed to communicate with AI Copilot." }]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Emergency dispatch trigger
  const handleEmergencyTrigger = async (type: string) => {
    try {
      await api.incidents.createIncident({
        stadium_id: selectedStadiumId,
        zone_id: 1,
        incident_type: type,
        severity: "Critical",
        description: `CRITICAL EMERGENCY ALERT: Activated ${type.toUpperCase()} response protocol. Security units dispatched.`,
        reported_by: user?.email || "Emergency Command Center"
      });
      setEmergencyModalOpen(false);
      loadTelemetry();
    } catch (e) {
      console.error(e);
    }
  };

  // Scan ticket simulation
  const handleTicketScanSim = async () => {
    if (!scanQR.trim()) return;
    try {
      const res = await api.tickets.scanTicket(scanQR, 1, "SCN-G1-1");
      setScanResult(res);
      loadTelemetry();
    } catch (err: any) {
      setScanResult({ success: false, status: "Error", message: err.message });
    }
  };

  // Lost found simulation
  const handleAddLostFound = async () => {
    if (!lfDesc.trim()) return;
    try {
      await api.lostFound.createLostFound({
        type: lfType,
        category: lfCat,
        description: lfDesc,
        location_lost: lfType === "Lost" ? lfLoc : undefined,
        location_found: lfType === "Found" ? lfLoc : undefined,
        time_lost: lfType === "Lost" ? new Date().toISOString() : undefined,
        time_found: lfType === "Found" ? new Date().toISOString() : undefined,
      });
      setLfDesc("");
      setLfLoc("");
      loadTelemetry();
      alert("Item log successfully created!");
    } catch (e) {
      console.error(e);
    }
  };

  // Navigation Groups Config mapping 35 items
  const navigationGroups = [
    {
      group: "CORE OPERATIONS",
      items: [
        { id: "overview", label: "Operations Overview", icon: "visibility" },
        { id: "dashboard", label: "Command Center", icon: "dashboard", badge: "LIVE", badgeType: "live" },
        { id: "ai-agent", label: "AI Operations Agent", icon: "psychology", badge: "272", badgeType: "ai" },
        { id: "digital-twin", label: "Stadium Digital Twin", icon: "map" },
        { id: "crowd", label: "Crowd Intelligence", icon: "groups", badge: "8", badgeType: "count" },
        { id: "incidents", label: "Incident Center", icon: "warning", badge: "72", badgeType: "alert" }
      ]
    },
    {
      group: "TOURNAMENT",
      items: [
        { id: "tournaments", label: "Tournament Ops", icon: "emoji_events" },
        { id: "match-ctrl", label: "Match Control", icon: "sports_soccer" },
        { id: "team-ops", label: "Team & Athlete Operations", icon: "group_work" },
        { id: "scheduling", label: "Smart Scheduling", icon: "calendar_today" }
      ]
    },
    {
      group: "FAN & ACCESS",
      items: [
        { id: "ticketing", label: "Smart Ticketing", icon: "confirmation_number" },
        { id: "gate-ctrl", label: "Gate & Queue Control", icon: "door_sliding" },
        { id: "fan-exp", label: "Fan Experience", icon: "sentiment_satisfied" },
        { id: "accessibility", label: "Accessibility Operations", icon: "accessibility_new" }
      ]
    },
    {
      group: "SAFETY",
      items: [
        { id: "security", label: "Security Console", icon: "security" },
        { id: "emergency", label: "Emergency Response", icon: "emergency" },
        { id: "medical", label: "Medical Operations", icon: "local_hospital" },
        { id: "threat-intel", label: "Threat Intelligence", icon: "radar" }
      ]
    },
    {
      group: "WORKFORCE",
      items: [
        { id: "staff", label: "Staff & Volunteers", icon: "badge" },
        { id: "task-ops", label: "Task Operations", icon: "assignment" },
        { id: "shifts", label: "Shift Intelligence", icon: "schedule" }
      ]
    },
    {
      group: "INFRASTRUCTURE",
      items: [
        { id: "parking", label: "Parking Intelligence", icon: "local_parking" },
        { id: "facilities", label: "Facility Monitor", icon: "construction", badge: "4", badgeType: "count" },
        { id: "sensors", label: "IoT Sensor Network", icon: "sensors" },
        { id: "energy", label: "Energy Analytics", icon: "bolt" },
        { id: "sustainability", label: "Sustainability", icon: "eco" }
      ]
    },
    {
      group: "SERVICES",
      items: [
        { id: "lost-found", label: "Lost & Found AI", icon: "search" },
        { id: "comm-hub", label: "Communication Hub", icon: "chat" },
        { id: "signage", label: "Digital Signage", icon: "tv" }
      ]
    },
    {
      group: "INTELLIGENCE",
      items: [
        { id: "analytics", label: "Analytics", icon: "trending_up" },
        { id: "reports", label: "AI Reports", icon: "description" },
        { id: "pred-intel", label: "Predictive Intelligence", icon: "online_prediction" }
      ]
    },
    {
      group: "GOVERNANCE",
      items: [
        { id: "audit", label: "Compliance & Audit", icon: "gavel" },
        { id: "integrations", label: "Integrations", icon: "api" },
        { id: "sys-health", label: "System Health", icon: "health_and_safety" },
        { id: "settings", label: "Settings", icon: "settings" }
      ]
    }
  ];

  const sidebarItems = navigationGroups.flatMap(g => g.items);

  function setSelectedTabFromTwin(zoneName: string) {
    const target = zones.find(z => z.name.includes(zoneName));
    if (target) {
      setSelectedZoneTwin(target);
    }
    setCurrentTab("digital-twin");
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Glow ambient background circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px]" />

        <form onSubmit={handleLogin} className="w-full max-w-md bg-secBg/60 backdrop-blur-2xl border border-borderSubtle rounded-2xl p-8 shadow-2xl relative z-10 glass-card">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 shadow-md">
              <span className="material-symbols-outlined text-3xl text-primary text-glow-sm" style={{ fontVariationSettings: "'FILL' 1" }}>stadium</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">StadiumOps AI</h1>
            <p className="text-xs text-secondary font-bold uppercase tracking-widest mt-1 text-glow-purple">Tactical Command Link</p>
          </div>

          {authError && (
            <div className="bg-error/10 border border-error/25 text-error text-xs rounded-xl p-3.5 mb-5 flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-[10px] font-bold text-textSecondary uppercase tracking-widest block mb-1.5">Security Email</label>
              <input 
                id="login-email"
                type="email" 
                className="w-full bg-[#050810] border border-borderSubtle rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all focus:ring-1 focus:ring-primary/25" 
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="text-[10px] font-bold text-textSecondary uppercase tracking-widest block mb-1.5">Console Key</label>
              <input 
                id="login-password"
                type="password" 
                className="w-full bg-[#050810] border border-borderSubtle rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all focus:ring-1 focus:ring-primary/25" 
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white font-bold rounded-xl py-3 mt-6 transition-all shadow-md flex items-center justify-center gap-2 border border-white/5 shadow-secondary/15"
            disabled={authLoading}
          >
            {authLoading ? "Initializing Connection..." : "Establish Command Link"}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>

          <div className="mt-8 pt-6 border-t border-borderSubtle space-y-3">
            <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest block">Authorized Demo Nodes</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Super Admin", email: "admin@stadiumops.ai" },
                { label: "Stadium Manager", email: "manager@stadiumops.ai" },
                { label: "Security Commander", email: "security@stadiumops.ai" },
                { label: "Operations Staff", email: "staff@stadiumops.ai" }
              ].map((role, idx) => (
                <button 
                  key={idx}
                  type="button" 
                  onClick={() => { setLoginEmail(role.email); setLoginPassword("stadium123"); }}
                  className="bg-[#0b0f19] hover:bg-[#151D2E] border border-borderSubtle text-[10px] text-textSecondary hover:text-white rounded-lg py-2 px-3 transition-colors text-left font-medium"
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-textPrimary font-sans flex select-none overflow-hidden relative">
      
      {/* ----------------- LEFT SIDEBAR ----------------- */}
      <aside className={`h-full fixed left-0 top-0 bg-[#0B1120] border-r border-borderSubtle flex flex-col z-30 transition-all duration-300 overflow-hidden ${
        sidebarCollapsed ? "w-[76px]" : "w-[272px]"
      }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-borderSubtle flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl text-primary font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>stadium</span>
            </div>
            {!sidebarCollapsed && (
              <div className="animate-fade-in shrink-0">
                <h1 className="font-extrabold text-sm tracking-tight text-white leading-none">STADIUMOPS AI</h1>
                <span className="text-[9px] text-primary font-bold tracking-widest uppercase block mt-1">INTELLIGENT VENUE OS</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={toggleSidebar} 
            className="text-textSecondary hover:text-white p-1 rounded hover:bg-panelBg shrink-0"
          >
            <span className="material-symbols-outlined text-sm">
              {sidebarCollapsed ? "menu_open" : "menu"}
            </span>
          </button>
        </div>

        {/* Systems status row */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 mx-2 my-2.5 bg-cardBg rounded-xl flex items-center gap-2 border border-borderSubtle">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-textSecondary">SYSTEM ONLINE</span>
          </div>
        )}

        {/* Groups & Items navigation */}
        <nav className="flex-1 p-2 overflow-y-auto space-y-4 pb-24 scrollbar-thin">
          {navigationGroups.map((g, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest block px-3 py-1">
                  {g.group}
                </span>
              )}
              {g.items.map(item => {
                const active = currentTab === item.id;
                return (
                  <button 
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 relative ${
                      active 
                        ? "bg-gradient-to-r from-primary/20 to-transparent text-white font-bold border-l-4 border-primary" 
                        : "text-textSecondary hover:bg-panelBg hover:text-white"
                    }`}
                    title={item.label}
                    aria-label={item.label}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-lg ${active ? "text-primary text-glow-sm" : ""}`}>{item.icon}</span>
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!sidebarCollapsed && item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        item.badgeType === "live" ? "bg-success/20 text-success flex items-center gap-1" :
                        item.badgeType === "ai" ? "bg-secondary/20 text-secondary animate-pulse" :
                        item.badgeType === "alert" ? "bg-error/20 text-error animate-bounce" :
                        "bg-[#1E293B] text-textSecondary"
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

        {/* Profile drawer footer */}
        <div className="p-3 border-t border-borderSubtle bg-secBg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg text-primary">account_circle</span>
              </div>
              {!sidebarCollapsed && (
                <div className="truncate">
                  <h4 className="text-xs font-bold text-white truncate">{user?.username || "Admin"}</h4>
                  <span className="text-[9px] text-textMuted block uppercase truncate">{user?.roles[0] || "Operator"}</span>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <button 
                onClick={handleLogout}
                className="text-textSecondary hover:text-error p-1 rounded hover:bg-error/10 shrink-0"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300 ${
        sidebarCollapsed ? "pl-[76px]" : "pl-[272px]"
      }`}>
        <header className={`h-[72px] bg-[#070B14]/80 backdrop-blur-xl border-b border-borderSubtle px-6 flex items-center justify-between shrink-0 z-20 absolute top-0 left-0 right-0 ${
          copilotOpen ? "pr-[336px]" : "pr-6"
        }`}>
          {/* Breadcrumb & Title */}
          <div>
            <div className="flex items-center gap-1.5 text-[9px] text-textMuted font-bold uppercase tracking-widest">
              <span>Node Selector</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-primary">{stadiums.find(s => s.stadium_id === selectedStadiumId)?.name || "Emirates Stadium"}</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-success">{currentTab}</span>
            </div>
            <h2 className="text-base font-extrabold text-white mt-0.5 tracking-tight flex items-center gap-2">
              {sidebarItems.find(s => s.id === currentTab)?.label || "Command Center"}
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
            </h2>
          </div>

          {/* Search trigger Command Palette */}
          <div 
            onClick={() => setCommandPaletteOpen(true)}
            className="flex-1 max-w-sm mx-4 bg-cardBg border border-borderSubtle hover:border-primary/45 rounded-xl px-4 py-2 flex items-center justify-between cursor-pointer text-textMuted transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-lg text-textSecondary">search</span>
              <span className="text-xs">Search zones, incidents, matches, staff, commands...</span>
            </div>
            <span className="text-[10px] font-mono bg-[#0B1120] border border-borderSubtle px-1.5 py-0.5 rounded text-glow-sm">Ctrl + K</span>
          </div>

          {/* Clock, alerts, SOS */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#0B1120] border border-borderSubtle rounded-xl py-1 px-3">
              <span className="material-symbols-outlined text-sm text-primary">schedule</span>
              <span className="text-xs font-mono font-bold tracking-wider text-primary">{liveClock}</span>
            </div>

            <button 
              onClick={() => setCopilotOpen(prev => !prev)}
              className="bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-secondary/5"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              <span>AI Copilot</span>
            </button>

            <button 
              onClick={() => setEmergencyModalOpen(true)}
              className="bg-error/15 hover:bg-error/25 text-error border border-error/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-error/5"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
              <span>SOS Override</span>
            </button>
          </div>
        </header>

        {/* ----------------- WORKSPACE INNER CONTENT ----------------- */}
        <main className={`flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin pt-[90px] bg-background ${
          copilotOpen ? "pr-[336px]" : "pr-6"
        }`}>

          {/* ----------------- 9-PHASE STORY LIVE DEMO SEQUENCER ----------------- */}
          <div className="bg-[#0B1120]/80 border border-borderSubtle rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 relative overflow-hidden shadow-lg shadow-black/30">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <div className="flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">play_circle</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white leading-none">Live Operational Story Demo Sequencer</h3>
                  <span className="bg-primary/20 text-primary text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Hackathon Mode</span>
                </div>
                <p className="text-xs text-textSecondary mt-1 leading-normal">
                  {demoMode 
                    ? `[PHASE ${demoStep}/9] ${demoStepInfo.title}: ${demoStepInfo.desc}` 
                    : `Dashboard operational. Click "Start Live Demo" to trigger simulated B1-B3 gate queue surges.`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => handleSimAction("demo")}
                className="bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-xl py-2 px-4.5 transition-all shadow-lg shadow-primary/10 border border-primary/20"
              >
                Start Live Demo
              </button>
              <div className="w-px h-6 bg-borderSubtle" />
              
              <button 
                onClick={() => handleSimAction(simRunning ? "pause" : "start")}
                className={`p-2.5 rounded-xl border border-borderSubtle hover:bg-panelBg transition-colors ${simRunning ? "text-warning" : "text-success"}`}
                title={simRunning ? "Pause" : "Resume"}
              >
                <span className="material-symbols-outlined text-sm flex items-center justify-center">
                  {simRunning ? "pause" : "play_arrow"}
                </span>
              </button>
              <button 
                onClick={() => handleSimAction("reset")}
                className="p-2.5 rounded-xl border border-borderSubtle hover:bg-panelBg text-textSecondary hover:text-white transition-colors"
                title="Reset simulation status"
              >
                <span className="material-symbols-outlined text-sm flex items-center justify-center">rotate_left</span>
              </button>

              <div className="flex items-center gap-1.5 ml-2 border border-borderSubtle/30 rounded-lg p-1 bg-[#070B14]">
                {[1, 2, 5, 10].map(s => (
                  <button
                    key={s}
                    onClick={() => handleSimAction("speed", s)}
                    className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md transition-colors ${simSpeed === s ? "bg-primary text-white" : "text-textSecondary hover:text-white"}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ----------------- PAGE 0: OPERATIONS OVERVIEW ----------------- */}
          {currentTab === "overview" && (
            <div className="space-y-6 entrance-anim">
              
              {/* Top Overview KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success to-primary" />
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">Venue Safety Status</span>
                    <span className="material-symbols-outlined text-success text-lg">verified_user</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mt-2">98.2%</h4>
                  <span className="text-[10px] text-success font-semibold mt-2 block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Optimal Operation
                  </span>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">Live Attendance</span>
                    <span className="material-symbols-outlined text-primary text-lg">groups</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mt-2">48,326 <span className="text-xs text-textMuted font-mono">/ 60k</span></h4>
                  <span className="text-[10px] text-textSecondary mt-2 block">80.5% capacity occupancy</span>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-warning" />
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">AI Projected Load</span>
                    <span className="material-symbols-outlined text-secondary text-lg">psychology</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mt-2">91% Peak</h4>
                  <span className="text-[10px] text-warning font-semibold mt-2 block">Surge predicted in 22 min</span>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-error to-warning" />
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">Active Security Logs</span>
                    <span className="material-symbols-outlined text-error text-lg">warning</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mt-2">12 <span className="text-xs text-textMuted font-mono">Open</span></h4>
                  <span className="text-[10px] text-error font-semibold mt-2 block">2 Critical dispatcher alarms</span>
                </div>
              </div>

              {/* Main Structural Layout split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Stand Density Map */}
                <div className="lg:col-span-2 bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">stadium</span>
                        Live Stand Density Breakdown
                      </h3>
                      <p className="text-[10px] text-textSecondary mt-0.5">Real-time occupancy maps across active stands</p>
                    </div>
                    <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-mono">3D Mesh Linked</span>
                  </div>

                  {/* SVG Isometric Stadium Map */}
                  <div className="h-64 flex items-center justify-center bg-[#070B14] border border-borderSubtle rounded-2xl relative overflow-hidden p-4">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(33,112,228,0.06),transparent_80%)]" />
                    
                    <svg className="w-full h-full max-w-[420px]" viewBox="0 0 400 300">
                      {/* Outer Rim */}
                      <path d="M 200,60 C 290,60 360,110 360,160 C 360,210 290,260 200,260 C 110,260 40,210 40,160 C 40,110 110,60 200,60 Z" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" />
                      
                      {/* Pitch Area */}
                      <path d="M 200,120 C 240,120 270,140 270,160 C 270,180 240,200 200,200 C 160,200 130,180 130,160 C 130,140 160,120 200,120 Z" fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" />
                      
                      {/* Stand Zones */}
                      {/* North Stand */}
                      <path d="M 120,75 C 170,55 230,55 280,75 L 260,105 C 220,95 180,95 140,105 Z" fill="rgba(33, 112, 228, 0.25)" stroke="#2170e4" strokeWidth="2" className="cursor-pointer hover:fill-primary/45 transition-colors" />
                      <text x="200" y="85" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">NORTH STAND (84%)</text>
                      
                      {/* South Stand */}
                      <path d="M 120,245 C 170,265 230,265 280,245 L 260,215 C 220,225 180,225 140,215 Z" fill="rgba(132, 85, 239, 0.25)" stroke="#8455ef" strokeWidth="2" className="cursor-pointer hover:fill-secondary/45 transition-colors" />
                      <text x="200" y="240" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">SOUTH STAND (68%)</text>
                      
                      {/* East Stand */}
                      <path d="M 345,130 C 355,160 345,190 320,210 L 290,190 C 305,180 310,160 300,145 Z" fill="rgba(16, 185, 129, 0.25)" stroke="#10B981" strokeWidth="2" className="cursor-pointer hover:fill-success/45 transition-colors" />
                      <text x="325" y="165" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" transform="rotate(75, 325, 165)">EAST (42%)</text>
                      
                      {/* West Stand */}
                      <path d="M 55,130 C 45,160 55,190 80,210 L 110,190 C 95,180 90,160 100,145 Z" fill="rgba(239, 68, 68, 0.3)" stroke="#ba1a1a" strokeWidth="2" className="cursor-pointer hover:fill-error/45 transition-colors animate-pulse" />
                      <text x="75" y="165" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle" transform="rotate(-75, 75, 165)">WEST (92%)</text>
                    </svg>

                    {/* Alarm Overlay on West Stand */}
                    <div className="absolute top-24 left-16 flex items-center gap-1 bg-error/95 border border-error/50 rounded-lg px-2 py-0.5 shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span className="text-[8px] font-black text-white">CONGESTED</span>
                    </div>
                  </div>

                  {/* Stand stats details */}
                  <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs">
                    {[
                      { stand: "North Stand", code: "NS", rate: "84%", status: "Nominal", color: "text-primary" },
                      { stand: "South Stand", code: "SS", rate: "68%", status: "Nominal", color: "text-secondary" },
                      { stand: "East Stand", code: "ES", rate: "42%", status: "Low Flow", color: "text-success" },
                      { stand: "West Stand", code: "WS", rate: "92%", status: "Critical", color: "text-error" }
                    ].map((s, idx) => (
                      <div key={idx} className="bg-[#0B1120] border border-borderSubtle rounded-xl p-2.5">
                        <span className="text-[9px] text-textMuted uppercase font-bold font-mono block">{s.stand}</span>
                        <span className={`text-sm font-black block mt-1 ${s.color}`}>{s.rate}</span>
                        <span className="text-[9px] text-textSecondary mt-0.5 block">{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Intelligence & Action Tracker */}
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-secondary">insights</span>
                      AI Priority Log
                    </h3>
                    <div className="space-y-3">
                      {[
                        { time: "T-22m", title: "West Stand surge projected", risk: "CRITICAL", desc: "Gate B throughput bottlenecking; divert to Gate C.", color: "text-error border-error/25 bg-error/5" },
                        { time: "T-14m", title: "Concession congestion spike", risk: "HIGH", desc: "Surge forming in North Stand food court; advise vendor dispatch.", color: "text-warning border-warning/25 bg-warning/5" },
                        { time: "Routine", title: "East Gate flow optimal", risk: "LOW", desc: "No queue surges or ticketing faults detected.", color: "text-success border-success/25 bg-success/5" }
                      ].map((log, idx) => (
                        <div key={idx} className={`p-3 rounded-xl border flex flex-col gap-1 text-xs relative overflow-hidden ${log.color}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white">{log.title}</span>
                            <span className="font-mono text-[9px] font-bold tracking-widest">{log.risk}</span>
                          </div>
                          <p className="text-[10px] text-textSecondary mt-1 leading-relaxed">{log.desc}</p>
                          <span className="text-[9px] text-textMuted mt-1 block self-end font-mono">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setCurrentTab("ai-agent")} 
                    className="w-full mt-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl py-2.5 text-xs tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Launch AI Decision Canvas</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Bottom live stats & telemetry chart row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Live gate scan telemetry */}
                <div className="lg:col-span-2 bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-lg">
                  <h4 className="font-bold text-white text-xs mb-4 uppercase tracking-widest text-textMuted flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    Live Telemetry Scan Rate
                  </h4>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: "12:00 PM", count: 120 }, 
                        { name: "12:15 PM", count: 240 }, 
                        { name: "12:30 PM", count: 480 }, 
                        { name: "12:45 PM", count: 1200 }, 
                        { name: "1:00 PM", count: 3200 },
                        { name: "1:15 PM", count: 2800 }
                      ]}>
                        <defs>
                          <linearGradient id="liveOverviewGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2170e4" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#2170e4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#727785" fontSize={9} tickLine={false} />
                        <YAxis stroke="#727785" fontSize={9} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px" }} />
                        <Area type="monotone" dataKey="count" stroke="#2170e4" strokeWidth={2} fill="url(#liveOverviewGrad)" name="Total Scans" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Operations Coverage Status */}
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-lg text-xs flex flex-col justify-between">
                  <h4 className="font-bold text-white text-xs mb-4 uppercase tracking-widest text-textMuted flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">shield</span>
                    Operations Staff Coverage
                  </h4>
                  <div className="space-y-2">
                    {[
                      { role: "Security Officers", count: "48 / 50", status: "Optimal", percent: 96, color: "bg-success" },
                      { role: "Medical Responders", count: "12 / 12", status: "Full", percent: 100, color: "bg-primary" },
                      { role: "Crowd Stewards", count: "84 / 90", status: "Deployment Range", percent: 93, color: "bg-secondary" },
                      { role: "Facilities Technicians", count: "6 / 8", status: "Standby Alert", percent: 75, color: "bg-warning" }
                    ].map((st, idx) => (
                      <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-2.5 rounded-xl">
                        <div className="flex justify-between items-center mb-1 text-[10px]">
                          <span className="font-bold text-white">{st.role}</span>
                          <span className="text-textSecondary">{st.count}</span>
                        </div>
                        <div className="w-full h-1 bg-[#070B14] rounded-full overflow-hidden">
                          <div className={`h-full ${st.color}`} style={{ width: `${st.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- PAGE 1: COMMAND CENTER ----------------- */}
          {currentTab === "dashboard" && (
            <div className="space-y-6 entrance-anim">
              
              {/* India Championship Final Bento card */}
              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-cardBg via-[#0E1628] to-cardBg relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>
                <div className="flex items-center gap-5 z-10">
                  <div className="flex flex-col items-center justify-center bg-error/10 text-error rounded-xl p-3 border border-error/25">
                    <span className="font-bold text-[10px] uppercase flex items-center gap-1 tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span> Live
                    </span>
                    <span className="font-mono text-sm mt-1">67:42</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-primary font-black uppercase tracking-widest block">INDIA CHAMPIONSHIP FINAL</span>
                    <h3 className="text-xl font-black text-white mt-1">Bengal Tigers vs Mumbai Warriors</h3>
                    <div className="flex items-center gap-3 text-textSecondary font-semibold text-xs mt-1">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">emoji_events</span> Cricket League</span>
                      <span className="w-1 h-1 rounded-full bg-textMuted" />
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">stadium</span> National Arena</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-8 z-10 mt-4 md:mt-0 text-xs">
                  <div className="text-right">
                    <p className="text-textSecondary font-bold">Capacity</p>
                    <p className="text-lg font-black text-white mt-1">60,000</p>
                  </div>
                  <div className="w-[1px] bg-borderSubtle" />
                  <div className="text-right">
                    <p className="text-textSecondary font-bold flex items-center gap-1 justify-end">Attendance <span className="material-symbols-outlined text-sm text-primary">trending_up</span></p>
                    <p className="text-lg font-black text-primary mt-1">48,326</p>
                  </div>
                </div>
              </div>

              {/* M3 styled KPI grid row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 hover:border-primary/35 transition-all shadow-md relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">Attendance</span>
                    <span className="material-symbols-outlined text-textMuted text-lg group-hover:text-primary transition-colors">groups</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mt-2">48,326</h4>
                  <div className="flex justify-between items-center text-[10px] mt-3.5 text-textSecondary font-semibold">
                    <span>80.5% capacity</span>
                    <span className="text-success font-bold">+12.4%</span>
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 hover:border-error/35 transition-all shadow-md relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">Incidents</span>
                    <span className="material-symbols-outlined text-error text-lg animate-pulse">warning</span>
                  </div>
                  <h4 className="text-2xl font-black text-error mt-2">12</h4>
                  <div className="flex justify-between items-center text-[10px] mt-3.5 text-textSecondary font-semibold">
                    <span>Critical: 2</span>
                    <span className="text-success">Resolved: 34</span>
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 hover:border-primary/35 transition-all shadow-md relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">Avg Gate Wait</span>
                    <span className="material-symbols-outlined text-textMuted text-lg">hourglass_empty</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mt-2">6m 24s</h4>
                  <div className="flex justify-between items-center text-[10px] mt-3.5 text-textSecondary font-semibold">
                    <span>Inflow wait</span>
                    <span className="text-success font-bold">-18%</span>
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 hover:border-secondary/35 transition-all shadow-md relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">AI Risk Score</span>
                    <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  </div>
                  <h4 className="text-2xl font-black text-secondary mt-2">32</h4>
                  <div className="flex justify-between items-center text-[10px] mt-3.5 text-textSecondary font-semibold">
                    <span className="font-bold text-success">LOW RISK</span>
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 hover:border-primary/35 transition-all shadow-md relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">Staff on Duty</span>
                    <span className="material-symbols-outlined text-textMuted text-lg">badge</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mt-2">842</h4>
                  <div className="flex justify-between items-center text-[10px] mt-3.5 text-textSecondary font-semibold">
                    <span>Coverage: 94%</span>
                    <span className="text-success">Active</span>
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 hover:border-primary/35 transition-all shadow-md relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">Facility Health</span>
                    <span className="material-symbols-outlined text-textMuted text-lg">construction</span>
                  </div>
                  <h4 className="text-2xl font-black text-white mt-2">96.2%</h4>
                  <div className="flex justify-between items-center text-[10px] mt-3.5 text-textSecondary font-semibold">
                    <span className="text-warning">4 alerts</span>
                    <span className="text-success">Online</span>
                  </div>
                </div>
              </div>

              {/* Large Stadium Digital Twin Widget */}
              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col h-[520px]">
                <div className="flex justify-between items-center border-b border-borderSubtle pb-4 mb-4 z-10">
                  <div>
                    <h3 className="text-base font-bold text-white">Live Stadium Digital Twin</h3>
                    <p className="text-xs text-textSecondary">Isometric overview tracking crowd movements and alert rings</p>
                  </div>
                  
                  <div className="flex bg-[#070B14] p-1 border border-borderSubtle rounded-xl">
                    {["2D", "3D", "Crowd", "Security", "Incidents", "Staff", "Sensors"].map((lyr) => (
                      <button
                        key={lyr}
                        onClick={() => {
                          if (lyr === "Sensors" || lyr === "Security" || lyr === "Crowd") {
                            setActiveDigitalTwinLayer(lyr === "Sensors" ? "cctv" : (lyr === "Security" ? "restricted" : "density"));
                          }
                        }}
                        className={`text-[10px] font-bold py-1.5 px-3.5 rounded-lg uppercase transition-all duration-150 ${
                          activeDigitalTwinLayer === (lyr === "Sensors" ? "cctv" : (lyr === "Security" ? "restricted" : "density")) 
                            ? "bg-primary text-white" 
                            : "text-textSecondary hover:text-white"
                        }`}
                      >
                        {lyr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 w-full bg-[#070B14]/85 border border-borderSubtle rounded-xl flex items-center justify-center relative overflow-hidden">
                  <svg className="w-[85%] h-[85%] max-h-72" viewBox="0 0 400 300">
                    <ellipse cx="200" cy="150" rx="160" ry="110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                    
                    {zones.map((z, idx) => {
                      const angle = (idx / Math.max(1, zones.length)) * 6.28;
                      const rx = 135;
                      const ry = 90;
                      const x = 200 + rx * Math.cos(angle);
                      const y = 150 + ry * Math.sin(angle);
                      const isSelected = selectedZoneTwin?.zone_id === z.zone_id;
                      
                      let color = "rgba(59, 130, 246, 0.1)";
                      if (activeDigitalTwinLayer === "density") {
                        if (z.risk_level === "CRITICAL" || (z.name.includes("North Stand") && demoStep >= 2)) {
                          color = "rgba(239, 68, 68, 0.3)";
                        } else if (z.risk_level === "HIGH") {
                          color = "rgba(245, 158, 11, 0.3)";
                        }
                      } else if (activeDigitalTwinLayer === "restricted") {
                        if (z.zone_id % 3 === 0) {
                          color = "rgba(139, 92, 246, 0.25)";
                        }
                      } else {
                        color = "rgba(16, 185, 129, 0.15)";
                      }

                      return (
                        <g key={z.zone_id} className="cursor-pointer" onClick={() => setSelectedTabFromTwin(z.name)}>
                          <circle 
                            cx={x} 
                            cy={y} 
                            r={18} 
                            fill={color} 
                            stroke={isSelected ? "#3B82F6" : "rgba(255,255,255,0.08)"} 
                            strokeWidth={isSelected ? 2.5 : 1}
                            className="hover:opacity-85 transition-opacity" 
                          />
                          <text x={x} y={y + 3} fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">Z-{z.zone_id}</text>
                        </g>
                      );
                    })}
                    
                    <ellipse cx="200" cy="150" rx="70" ry="40" fill="rgba(16,185,129,0.03)" stroke="rgba(16,185,129,0.15)" strokeWidth="1.5" />

                    {(demoStep >= 2 || decisions.some(d => d.id === "AI-DEC-001" && d.status === "pending")) && (
                      <g transform="translate(195, 30)">
                        <circle cx="5" cy="5" r="9" fill="rgba(239, 68, 68, 0.4)" className="animate-ping" />
                        <circle cx="5" cy="5" r="5" fill="#EF4444" />
                      </g>
                    )}
                  </svg>

                  <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[10px] text-textSecondary font-bold">
                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary/20 border border-primary/30" /><span>Normal</span></div>
                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-warning/20 border border-warning/30" /><span>Moderate</span></div>
                    <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-error/20 border border-error/30" /><span>Critical</span></div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Analytics & Timelines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-lg">
                  <h4 className="font-title-md text-title-md font-bold text-white mb-4">Gate Flow Analytics</h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(gates.length ? gates.slice(0, 5) : [{ name: "Gate A", queue_length: 120 }, { name: "Gate B", queue_length: 340 }]) as any}>
                        <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(148, 163, 184, 0.12)" }} />
                        <Bar dataKey="queue_length" fill="#3B82F6" name="Queue Length" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-lg flex flex-col h-[240px]">
                  <h4 className="font-title-md text-title-md font-bold text-white mb-4">Incident Timeline</h4>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                    {incidents.length ? incidents.filter(i => i.status !== "Resolved").slice(0, 3).map(inc => (
                      <div key={inc.incident_id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-error mt-1.5" />
                          <div className="w-px h-full bg-borderSubtle mt-2" />
                        </div>
                        <div>
                          <p className="font-mono text-xs text-textSecondary">{new Date(inc.timestamp).toLocaleTimeString()}</p>
                          <p className="text-xs text-textPrimary font-semibold">{inc.incident_type} - {inc.severity}</p>
                          <p className="text-[11px] text-textSecondary mt-0.5">{inc.description}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-xs text-textSecondary italic">No active incidents logged today.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ----------------- PAGE 2: AI OPERATIONS AGENT ----------------- */}
          {currentTab === "ai-agent" && (
            <div className="space-y-6 entrance-anim">
              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <h3 className="text-base font-bold text-white mb-4">Central AI Reasoning Canvas</h3>
                
                <div className="flex justify-between items-center relative py-6 z-10">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-2 shadow-md">
                      <span className="material-symbols-outlined text-xl text-primary">visibility</span>
                    </div>
                    <span className="font-bold text-[10px] text-primary uppercase tracking-widest">Observe</span>
                    <span className="text-[9px] text-textMuted mt-1">1,248 signals</span>
                  </div>

                  <div className="flex-1 h-px bg-borderSubtle relative overflow-hidden hidden md:block">
                    <svg className="absolute inset-0 w-full h-full text-primary opacity-50" preserveAspectRatio="none">
                      <line className="flow-line" stroke="currentColor" strokeWidth="2" x1="0" x2="100%" y1="0.5" y2="0.5" />
                    </svg>
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-2 shadow-md">
                      <span className="material-symbols-outlined text-xl text-primary">analytics</span>
                    </div>
                    <span className="font-bold text-[10px] text-primary uppercase tracking-widest">Understand</span>
                    <span className="text-[9px] text-textMuted mt-1">Gate B surge</span>
                  </div>

                  <div className="flex-1 h-px bg-borderSubtle relative overflow-hidden hidden md:block">
                    <svg className="absolute inset-0 w-full h-full text-secondary opacity-50" preserveAspectRatio="none">
                      <line className="flow-line" stroke="currentColor" strokeWidth="2" x1="0" x2="100%" y1="0.5" y2="0.5" />
                    </svg>
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <div className="w-14 h-14 rounded-full bg-secondary/15 border border-secondary/35 flex items-center justify-center mb-2 shadow-md ring-4 ring-secondary/25">
                      <span className="material-symbols-outlined text-xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    </div>
                    <span className="font-bold text-[10px] text-secondary uppercase tracking-widest">Predict</span>
                    <span className="text-[9px] text-textMuted mt-1">12-minute window</span>
                  </div>

                  <div className="flex-1 h-px bg-borderSubtle hidden md:block" />

                  <div className="flex flex-col items-center flex-1">
                    <div className="w-14 h-14 rounded-full bg-panelBg border border-borderSubtle flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-xl text-textSecondary">gavel</span>
                    </div>
                    <span className="font-bold text-[10px] text-textSecondary uppercase tracking-widest">Decide</span>
                    <span className="text-[9px] text-textMuted mt-1">Steward deploy</span>
                  </div>

                  <div className="flex-1 h-px bg-borderSubtle hidden md:block" />

                  <div className="flex flex-col items-center flex-1 opacity-50">
                    <div className="w-14 h-14 rounded-full bg-panelBg border border-borderSubtle flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined text-xl text-textMuted">bolt</span>
                    </div>
                    <span className="font-bold text-[10px] text-textMuted uppercase tracking-widest">Act</span>
                    <span className="text-[9px] text-textMuted mt-1">Pending approval</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {decisions.map(dec => (
                    <div 
                      key={dec.id}
                      onClick={() => setSelectedDecision(dec)}
                      className={`bg-cardBg border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
                        selectedDecision?.id === dec.id ? "border-primary active-border-glow" : "border-borderSubtle"
                      }`}
                    >
                      <div className="p-5 border-b border-borderSubtle bg-gradient-to-r from-error/5 to-transparent">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-error/15 text-error px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[8px]">
                                Risk: {dec.risk_score}%
                              </span>
                              <span className="text-textMuted font-mono text-[10px]">ID: {dec.id}</span>
                            </div>
                            <h3 className="text-base font-extrabold text-white mt-1.5">{dec.title}</h3>
                          </div>
                          <span className="text-textSecondary font-mono text-[10px]">{(new Date(dec.created_at)).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <div className="p-5 bg-[#0B1120] border-b border-borderSubtle space-y-2">
                        <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Evidence and CCTV observations</span>
                        <p className="text-xs text-textSecondary leading-relaxed">{dec.evidence}</p>
                      </div>

                      <div className="p-5 bg-secondary/5 border-b border-borderSubtle">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block">AI Workflow Recommendation</span>
                        <p className="text-xs text-textPrimary leading-normal mt-1.5 font-semibold">{dec.recommended_action}</p>
                      </div>

                      {workflowActive && selectedDecision?.id === dec.id && (
                        <div className="p-5 bg-[#070B14] border-b border-borderSubtle space-y-3">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Executing automation workflow sequence...</span>
                          <div className="space-y-2.5">
                            {[
                              { label: "Updating digital signs and monitors at Gate B", step: 1 },
                              { label: "Sending push notifications to redirect traffic", step: 2 },
                              { label: "Deploying six reserve roster stewards", step: 3 },
                              { label: "Recalculating gate capacity movement flow", step: 4 }
                            ].map((w, wIdx) => (
                              <div key={wIdx} className="flex items-center gap-3 text-xs">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${
                                  workflowStep >= w.step 
                                    ? "bg-success text-white" 
                                    : "bg-panelBg text-textMuted border border-borderSubtle"
                                }`}>
                                  {w.step}
                                </span>
                                <span className={workflowStep >= w.step ? "text-textPrimary font-semibold" : "text-textMuted"}>
                                  {w.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-[#0B1120] flex justify-between items-center">
                        <div className="flex gap-2">
                          {dec.status === "pending" ? (
                            <>
                              <button 
                                onClick={() => handleApproveDecision(dec.id)}
                                className="bg-gradient-to-r from-primary to-secondary text-white font-bold py-1.5 px-4 rounded-xl text-xs shadow-md border border-primary/20 flex items-center gap-1.5"
                                disabled={workflowActive}
                              >
                                <span className="material-symbols-outlined text-sm">bolt</span> Approve &amp; Execute
                              </button>
                              <button 
                                onClick={() => handleRejectDecision(dec.id)}
                                className="bg-cardBg border border-borderSubtle text-textSecondary hover:text-white py-1.5 px-4 rounded-xl text-xs transition-colors"
                                disabled={workflowActive}
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-success font-bold text-xs flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm">check_circle</span> Executed - Congestion reduced by 27%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-lg">
                    <h4 className="text-[10px] text-textMuted uppercase tracking-widest block font-bold mb-3">AI Engine posture</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs"><span>Total decisions processed</span><span className="font-mono font-bold">272</span></div>
                      <div className="flex justify-between text-xs"><span>Engine confidence ratio</span><span className="font-mono font-bold text-primary">94.7%</span></div>
                      <div className="flex justify-between text-xs"><span>Threat overrides logged</span><span className="font-mono font-bold text-success">38</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- PAGE 3: DIGITAL TWIN TIMELINE ----------------- */}
          {currentTab === "digital-twin" && (
            <div className="space-y-6 entrance-anim">
              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex justify-between items-center border-b border-borderSubtle pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Interactive Full-screen Twin Panel</h3>
                    <p className="text-xs text-textSecondary">Drag the time slider below to scrub through crowd projections</p>
                  </div>
                  
                  <div className="flex bg-[#070B14] p-1 border border-borderSubtle rounded-xl">
                    {["density", "restricted", "cctv"].map((lyr) => (
                      <button
                        key={lyr}
                        onClick={() => setActiveDigitalTwinLayer(lyr as any)}
                        className={`text-[10px] font-bold py-1.5 px-3.5 rounded-lg uppercase transition-all duration-150 ${
                          activeDigitalTwinLayer === lyr ? "bg-primary text-white" : "text-textSecondary hover:text-white"
                        }`}
                      >
                        {lyr}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#070B14] border border-borderSubtle rounded-xl p-6 h-[340px] flex items-center justify-center relative overflow-hidden">
                  <svg className="w-[80%] h-[80%] max-h-64" viewBox="0 0 400 300">
                    <ellipse cx="200" cy="150" rx="160" ry="110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                    {zones.slice(0, 12).map((z, idx) => {
                      const angle = (idx / 12) * 6.28;
                      const x = 200 + 130 * Math.cos(angle);
                      const y = 150 + 85 * Math.sin(angle);
                      
                      let densityColor = "rgba(59, 130, 246, 0.08)";
                      if (twinTimelineVal > 40 && z.name.includes("North Stand")) {
                        densityColor = "rgba(239, 68, 68, 0.35)";
                      } else if (twinTimelineVal > 20 && idx % 3 === 0) {
                        densityColor = "rgba(245, 158, 11, 0.25)";
                      }

                      return (
                        <g key={z.zone_id} className="cursor-pointer" onClick={() => setSelectedZoneTwin(z)}>
                          <circle cx={x} cy={y} r={16} fill={densityColor} stroke={selectedZoneTwin?.zone_id === z.zone_id ? "#3B82F6" : "rgba(255,255,255,0.08)"} strokeWidth={selectedZoneTwin?.zone_id === z.zone_id ? 2.5 : 1} />
                          <text x={x} y={y + 3} fill="white" fontSize="7" fontWeight="bold" textAnchor="middle">Z-{z.zone_id}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-textSecondary">
                    <span>12:00 PM (Pre-Match Setup)</span>
                    <span className="text-primary font-bold">Scrub: {Math.floor(12 + twinTimelineVal / 60)}:{String(twinTimelineVal % 60).padStart(2, "0")} PM</span>
                    <span>10:00 PM (Match Closed)</span>
                  </div>
                  <input 
                    type="range" 
                    min={0} 
                    max={600} 
                    value={twinTimelineVal}
                    onChange={e => setTwinTimelineVal(Number(e.target.value))}
                    className="w-full accent-primary bg-[#070B14] rounded-lg h-2"
                  />
                </div>
              </div>
            </div>
          )}

          {currentTab === "crowd" && (
            <div className="space-y-6 entrance-anim">
              
              {/* Top Crowd Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                  <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest block">Total Attendance</span>
                  <h4 className="text-xl font-black text-white mt-2">44,890 <span className="text-xs text-textMuted">82% of capacity</span></h4>
                </div>
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                  <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest block">Peak Flow Density</span>
                  <h4 className="text-xl font-black text-white mt-2">1.8 <span className="text-xs text-success font-mono">meters/sec (Nominal)</span></h4>
                </div>
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                  <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest block">Gate Restructure Status</span>
                  <h4 className="text-xl font-black text-success mt-2">Active <span className="text-xs text-textMuted font-mono">Balanced</span></h4>
                </div>
              </div>

              {/* Chart & interactive planners */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Feature 1: Chart */}
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-4 lg:col-span-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    Live Crowd Flow Velocity
                  </h3>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: "Now", rate: 1248 },
                        { name: "+15 Min", rate: 1540 },
                        { name: "+30 Min", rate: 1980 },
                        { name: "+60 Min", rate: 940 }
                      ]}>
                        <defs>
                          <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748B" fontSize={10} />
                        <YAxis stroke="#64748B" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(148, 163, 184, 0.12)", borderRadius: "12px" }} />
                        <Area type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={2} fill="url(#colorRate)" name="Spectator/min" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Feature 2, 3 & 4: Interactive planning controllers */}
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white">Dynamic Flow Planner</h3>
                    
                    {/* Congestion simulator slider */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <label className="text-textSecondary">Simulate Gate Surge Load</label>
                        <span className="font-bold text-primary">850/min</span>
                      </div>
                      <input 
                        type="range" 
                        min="200" 
                        max="1500" 
                        defaultValue="850" 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val > 1100) {
                            alert("Crowd flow warning: High density bottleneck detected at North Gate!");
                          }
                        }}
                        className="w-full cursor-pointer accent-primary"
                      />
                    </div>

                    {/* Flow Rerouting controller */}
                    <div className="space-y-2 text-xs">
                      <label className="text-textSecondary block">Gate Routing Directives</label>
                      <select 
                        onChange={(e) => alert(`Re-routing directives updated: ${e.target.value}`)}
                        className="w-full bg-[#070B14] border border-borderSubtle rounded-xl p-2 text-white text-xs focus:outline-none focus:border-primary"
                      >
                        <option>Route general spectators to Gate A &amp; B</option>
                        <option>Balance load evenly across all turnstiles</option>
                        <option>Divert North Stand crowd to East Concourse</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => alert("Flow optimization algorithm calculated. Dynamic LED signage boards updated.")}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl text-xs transition-all border border-white/5"
                  >
                    Recalculate Dynamic Flow
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ----------------- PAGE 5: INCIDENT CENTER ----------------- */}
          {currentTab === "incidents" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 entrance-anim">
              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white">Active Logs</h3>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {incidents.map(inc => (
                    <div 
                      key={inc.incident_id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedIncident?.incident_id === inc.incident_id ? "border-primary bg-panelBg" : "border-borderSubtle bg-[#0B1120]"}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-error uppercase">{inc.severity}</span>
                        <span className="text-[9px] text-textMuted">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <h4 className="font-bold text-white text-xs">{inc.incident_type}</h4>
                      <p className="text-textSecondary text-[11px] mt-1 line-clamp-2">{inc.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedIncident && (
                <div className="lg:col-span-2 bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white border-b border-borderSubtle pb-2">Incident Command Drawer</h3>
                  <div className="space-y-2 text-xs">
                    <p className="text-textSecondary"><strong className="text-white">Type:</strong> {selectedIncident.incident_type}</p>
                    <p className="text-textSecondary"><strong className="text-white">Severity:</strong> {selectedIncident.severity}</p>
                    <p className="text-textSecondary"><strong className="text-white">Location:</strong> Zone {selectedIncident.zone_id}</p>
                    <p className="text-textSecondary"><strong className="text-white">Reporter:</strong> {selectedIncident.reported_by}</p>
                    <p className="text-textSecondary"><strong className="text-white">Description:</strong> {selectedIncident.description}</p>
                    <p className="text-textSecondary"><strong className="text-white">Status:</strong> {selectedIncident.status}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ----------------- PAGE 6: TOURNAMENT OPS ----------------- */}
          {currentTab === "tournaments" && (
            <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-4 entrance-anim">
              <h3 className="text-base font-bold text-white">Tournament Control Board</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0B1120] p-4 rounded-xl border border-borderSubtle">
                  <span className="text-[9px] text-textSecondary uppercase font-bold">Active Tournament</span>
                  <h4 className="text-base font-bold text-white mt-1">Cricket Champions Cup</h4>
                </div>
                <div className="bg-[#0B1120] p-4 rounded-xl border border-borderSubtle">
                  <span className="text-[9px] text-textSecondary uppercase font-bold">Registered Teams</span>
                  <h4 className="text-base font-bold text-white mt-1">16 Contenders</h4>
                </div>
                <div className="bg-[#0B1120] p-4 rounded-xl border border-borderSubtle">
                  <span className="text-[9px] text-textSecondary uppercase font-bold">Match Readiness</span>
                  <h4 className="text-base font-bold text-white mt-1 text-success">98.5% Ready</h4>
                </div>
              </div>
            </div>
          )}

          {currentTab === "ticketing" && (
            <div className="space-y-6 entrance-anim">
              
              {/* Top Ticketing Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                  <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest block">Total Scans Today</span>
                  <h4 className="text-xl font-black text-white mt-2">24,680 <span className="text-xs text-success font-mono font-bold">+12%</span></h4>
                </div>
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                  <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest block">VIP Stand Occupancy</span>
                  <h4 className="text-xl font-black text-white mt-2">91% <span className="text-xs text-textMuted font-mono">320 seats open</span></h4>
                </div>
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                  <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest block">Validation Failures</span>
                  <h4 className="text-xl font-black text-error mt-2">0.05% <span className="text-xs text-success font-mono font-bold">Safe</span></h4>
                </div>
              </div>

              {/* Grid with Simulator, Issuer and Logs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Scan Simulator & Issuer */}
                <div className="space-y-6">
                  {/* QR Simulator */}
                  <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
                      Scan Rate Simulator
                    </h3>
                    <p className="text-xs text-textSecondary leading-normal">Simulate spectator gate validation scans by typing QR token hashes below.</p>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter Ticket QR Token (e.g., T-9082)"
                        value={scanQR}
                        onChange={e => setScanQR(e.target.value)}
                        className="flex-1 bg-[#070B14] border border-borderSubtle rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                      />
                      <button onClick={handleTicketScanSim} className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-primary/20">
                        Scan QR
                      </button>
                    </div>

                    {scanResult && (
                      <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                        scanResult.success ? "bg-success/15 border-success/30 text-success" : "bg-error/15 border-error/30 text-error animate-shake"
                      }`}>
                        <p className="font-bold">Scan status: {scanResult.status}</p>
                        <p className="mt-1">{scanResult.message}</p>
                      </div>
                    )}
                  </div>

                  {/* VIP Issuer Form */}
                  <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">confirmation_number</span>
                      Ad-hoc VIP Access Ticket Issuer
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-textMuted uppercase font-bold block mb-1">Guest Name</label>
                        <input id="vip-guest-name" type="text" placeholder="Ex: John Doe" className="w-full bg-[#070B14] border border-borderSubtle rounded-xl p-2.5 text-white focus:outline-none focus:border-secondary" />
                      </div>
                      <div>
                        <label className="text-[10px] text-textMuted uppercase font-bold block mb-1">Stand Location</label>
                        <select id="vip-stand-select" className="w-full bg-[#070B14] border border-borderSubtle rounded-xl p-2.5 text-textSecondary focus:outline-none focus:border-secondary">
                          <option>VIP Lounge A</option>
                          <option>VIP Lounge B</option>
                          <option>Corporate Box 3</option>
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const nameEl = document.getElementById("vip-guest-name") as HTMLInputElement;
                        const standEl = document.getElementById("vip-stand-select") as HTMLSelectElement;
                        if (nameEl && nameEl.value) {
                          const newLog = {
                            id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
                            name: nameEl.value,
                            zone: standEl.value,
                            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                            status: "VALIDATED"
                          };
                          setTicketLog(prev => [newLog, ...prev]);
                          alert(`Successfully issued and validated ticket for ${nameEl.value}`);
                          nameEl.value = "";
                        } else {
                          alert("Please specify guest name!");
                        }
                      }}
                      className="w-full bg-secondary hover:bg-secondary/95 text-white py-2.5 rounded-xl text-xs font-bold transition-all border border-white/5"
                    >
                      Issue & Validate Ticket
                    </button>
                  </div>
                </div>

                {/* Validation Logs */}
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl flex flex-col justify-between h-[450px]">
                  <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white">Live Validation Log</h3>
                      <input 
                        type="text" 
                        placeholder="Search logs..." 
                        value={ticketSearch}
                        onChange={e => setTicketSearch(e.target.value)}
                        className="bg-[#070B14] border border-borderSubtle rounded-xl py-1 px-2.5 text-xs text-white focus:outline-none focus:border-primary max-w-[150px]"
                      />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                      {ticketLog
                        .filter(log => log.name.toLowerCase().includes(ticketSearch.toLowerCase()) || log.id.toLowerCase().includes(ticketSearch.toLowerCase()))
                        .map((t, idx) => (
                          <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-3 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-primary font-bold">{t.id}</span>
                                <span className="font-bold text-white">{t.name}</span>
                              </div>
                              <span className="text-textSecondary block mt-0.5 text-[10px]">{t.zone} • {t.time}</span>
                            </div>
                            <span className="bg-success/20 text-success text-[9px] font-bold px-2 py-0.5 rounded-full">{t.status}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ----------------- PAGE 8: SECURITY CONSOLE ----------------- */}
          {currentTab === "security" && (
            <div className="space-y-6 entrance-anim">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">videocam</span>
                    Security Video Feed Console
                  </h3>
                  <p className="text-[10px] text-textSecondary mt-0.5">Select a feed camera below to inspect live detections</p>
                </div>
                <div className="flex items-center gap-2 bg-[#070B14] border border-borderSubtle rounded-xl p-1 text-xs text-textSecondary">
                  <span className="font-bold text-white font-mono">{activeCameraId}</span>
                  <span>selected</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { id: "CAM-101", name: "CCTV Cam B1", status: "Active", detection: "Unattended object detected", conf: 92 },
                  { id: "CAM-102", name: "CCTV Cam C4", status: "Active", detection: "None (Stable Flow)", conf: 98 },
                  { id: "CAM-103", name: "CCTV Cam Gate A", status: "Active", detection: "Crowd density threshold exceeded", conf: 89 }
                ].map((c, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setActiveCameraId(c.id);
                      alert(`Selected live camera feed: ${c.name} (${c.id})`);
                    }}
                    className={`bg-cardBg border rounded-2xl p-5 shadow-xl space-y-3 cursor-pointer transition-all ${activeCameraId === c.id ? "border-primary bg-panelBg" : "border-borderSubtle hover:border-white/10"}`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white text-xs">{c.name} <span className="font-mono text-textMuted text-[10px]">({c.id})</span></h4>
                      <span className="text-[9px] bg-success/20 text-success px-2.5 py-0.5 rounded-full font-bold">{c.status}</span>
                    </div>
                    <div className="h-28 bg-[#070B14] border border-borderSubtle/60 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <span className="material-symbols-outlined text-3xl text-textMuted animate-pulse">videocam</span>
                      {c.detection !== "None (Stable Flow)" && (
                        <div className="absolute top-2 left-2 bg-error/85 border border-error/35 text-[8px] text-white px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
                          {c.detection}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] text-textSecondary font-bold font-mono">
                      <span>AI Confidence</span>
                      <span className="text-primary">{c.conf}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------- PAGE 9: EMERGENCY RESPONSE SOS ----------------- */}
          {currentTab === "emergency" && (
            <div className="space-y-6 entrance-anim">
              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white uppercase tracking-wider text-error">EMERGENCY COMMAND</h3>
                <p className="text-xs text-textSecondary">Activate code-red responders or localized sprinkler lines immediately.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleEmergencyTrigger("Medical Alarm")}
                    className="p-5 bg-error/10 border border-error/30 rounded-xl text-left hover:scale-[1.02] transition-transform"
                  >
                    <h4 className="font-bold text-error">Dispatch Ambulance / Medical Units</h4>
                    <p className="text-xs text-textSecondary mt-1 leading-normal">Deploy first responder squad to Sector Corridors</p>
                  </button>

                  <button 
                    onClick={() => handleEmergencyTrigger("Fire Event")}
                    className="p-5 bg-error/10 border border-error/30 rounded-xl text-left hover:scale-[1.02] transition-transform"
                  >
                    <h4 className="font-bold text-error">Dispatch Fire Units</h4>
                    <p className="text-xs text-textSecondary mt-1 leading-normal">Deploy fire prevention squads and activate localized sprinkler lines</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- PAGE 10: STAFF & VOLUNTEERS ----------------- */}
          {currentTab === "staff" && (
            <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-6 entrance-anim">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">groups</span>
                    Staff & Volunteers Roster
                  </h3>
                  <p className="text-[10px] text-textSecondary mt-0.5">Manage squad availability, check-in, and sector assignments</p>
                </div>
                
                {/* Feature 1: Role Filter & Search */}
                <div className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    id="staff-search-input"
                    placeholder="Search crew..." 
                    className="bg-[#070B14] border border-borderSubtle rounded-xl py-1 px-3 text-xs text-white focus:outline-none focus:border-primary max-w-[150px]"
                    onChange={(e) => {
                      // Simple visual filtering using standard document queries
                      const val = e.target.value.toLowerCase();
                      document.querySelectorAll(".staff-row").forEach(row => {
                        const name = row.getAttribute("data-name") || "";
                        if (name.includes(val)) row.classList.remove("hidden");
                        else row.classList.add("hidden");
                      });
                    }}
                  />
                  <button 
                    onClick={() => alert("All stewards pinged via radio network.")} 
                    className="bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-[10px] font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs">radio</span> Ping All Radio
                  </button>
                </div>
              </div>

              {/* Feature 2 & 3: Interactive list & status check in toggle */}
              <div className="space-y-3">
                {[
                  { id: "S-104", name: "John Doe", role: "Steward Coordinator", zone: "Zone 1 (North Stand)", status: "Active" },
                  { id: "S-109", name: "Jane Smith", role: "Medical Responder", zone: "Zone 4 (Medical Center)", status: "Active" },
                  { id: "S-212", name: "Mark Wilson", role: "Gate Controller", zone: "Zone 2 (Gate B)", status: "On Break" }
                ].map((s, idx) => (
                  <div key={idx} className="staff-row bg-[#0B1120] border border-borderSubtle p-4 rounded-xl flex justify-between items-center text-xs" data-name={s.name.toLowerCase()}>
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-1.5">
                        <span className="text-[10px] text-textMuted font-mono">{s.id}</span>
                        {s.name}
                      </h4>
                      <p className="text-textSecondary mt-1">{s.role} • {s.zone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.status === "Active" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{s.status}</span>
                      
                      {/* Interactive toggle actions */}
                      <button 
                        onClick={() => alert(`Shift check-out toggled for: ${s.name}`)}
                        className="bg-[#070B14] hover:bg-panelBg border border-borderSubtle text-textSecondary hover:text-white py-1 px-2.5 rounded-lg transition-colors"
                      >
                        Toggle Duty
                      </button>
                      <button 
                        onClick={() => alert(`Dispatched ${s.name} to Gate B alert area.`)}
                        className="bg-primary/10 hover:bg-primary/20 text-primary py-1 px-2.5 rounded-lg border border-primary/20 transition-colors"
                      >
                        Dispatch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------- PAGE 11: PARKING INTELLIGENCE ----------------- */}
          {currentTab === "parking" && (
            <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-6 entrance-anim">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">local_parking</span>
                    Live Mobility &amp; Parking Control
                  </h3>
                  <p className="text-[10px] text-textSecondary mt-0.5">Control access barriers and monitor lot occupancy limits</p>
                </div>
                
                {/* Feature 1: Manual barrier override */}
                <button 
                  onClick={() => alert("All parking exit gates opened automatically.")}
                  className="bg-error/15 hover:bg-error/25 border border-error/20 text-error text-xs font-bold py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-error/5"
                >
                  <span className="material-symbols-outlined text-sm">open_in_new</span> Barrier Emergency Release
                </button>
              </div>

              {/* Feature 2: Interactive Lot Occupancy gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-[#0B1120] p-4 rounded-xl border border-borderSubtle flex flex-col justify-between">
                  <span className="text-[9px] text-textSecondary uppercase font-bold">Lot A (Premium)</span>
                  <h4 className="text-lg font-black text-white mt-2">82% <span className="text-xs text-textMuted font-mono">820/1000 cars</span></h4>
                  <div className="w-full h-1.5 bg-[#070B14] rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-warning rounded-full" style={{ width: "82%" }} />
                  </div>
                </div>
                <div className="bg-[#0B1120] p-4 rounded-xl border border-borderSubtle flex flex-col justify-between">
                  <span className="text-[9px] text-textSecondary uppercase font-bold">Lot B (General)</span>
                  <h4 className="text-lg font-black text-white mt-2">45% <span className="text-xs text-textMuted font-mono">450/1000 cars</span></h4>
                  <div className="w-full h-1.5 bg-[#070B14] rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-success rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>
                <div className="bg-[#0B1120] p-4 rounded-xl border border-borderSubtle flex flex-col justify-between">
                  <span className="text-[9px] text-textSecondary uppercase font-bold">Transit Wait Index</span>
                  <h4 className="text-lg font-black text-primary mt-2">3m 15s</h4>
                  <div className="text-[9px] text-success font-semibold mt-3">Nominal queue speeds</div>
                </div>
              </div>

              {/* Feature 3 & 4: Live Barrier status control buttons */}
              <div className="bg-[#0B1120] border border-borderSubtle p-5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-white">Manual Barrier Control (Lot Gateways)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#070B14] p-3 rounded-xl flex justify-between items-center border border-borderSubtle">
                    <span className="font-bold text-white">Lot A Entrance Gate</span>
                    <div className="flex gap-2">
                      <button onClick={() => alert("Lot A gate opened manually.")} className="bg-success/20 text-success py-1 px-2.5 rounded-lg border border-success/30 hover:bg-success/35">Open</button>
                      <button onClick={() => alert("Lot A gate locked manually.")} className="bg-error/20 text-error py-1 px-2.5 rounded-lg border border-error/30 hover:bg-error/35">Close</button>
                    </div>
                  </div>
                  <div className="bg-[#070B14] p-3 rounded-xl flex justify-between items-center border border-borderSubtle">
                    <span className="font-bold text-white">Lot B Entrance Gate</span>
                    <div className="flex gap-2">
                      <button onClick={() => alert("Lot B gate opened manually.")} className="bg-success/20 text-success py-1 px-2.5 rounded-lg border border-success/30 hover:bg-success/35">Open</button>
                      <button onClick={() => alert("Lot B gate locked manually.")} className="bg-error/20 text-error py-1 px-2.5 rounded-lg border border-error/30 hover:bg-error/35">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- PAGE 12: FACILITY MONITOR ----------------- */}
          {currentTab === "facilities" && (
            <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-6 entrance-anim">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">thermostat</span>
                    HVAC &amp; Mechanical Control Posture
                  </h3>
                  <p className="text-[10px] text-textSecondary mt-0.5">Monitor ambient climates and toggle dynamic environmental setups</p>
                </div>
                
                {/* Feature 1: Auto HVAC Mode Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-textSecondary">Auto-Optimize Mode</span>
                  <button 
                    onClick={() => {
                      setFacilitiesAutoHvac(!facilitiesAutoHvac);
                      alert(`Auto climate mode set to: ${!facilitiesAutoHvac ? "ENABLED" : "DISABLED"}`);
                    }} 
                    className={`w-10 h-5 rounded-full relative transition-colors ${facilitiesAutoHvac ? "bg-primary" : "bg-panelBg border border-borderSubtle"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${facilitiesAutoHvac ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
              </div>

              {/* Feature 2: Climates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {[
                  { name: "North Stand Air-Handlers", value: `${facilitiesTemp.toFixed(1)}°C`, type: "Temp", status: "Optimal" },
                  { name: "South Stand Escalators", value: "Online", type: "Power", status: "Optimal" },
                  { name: "Concourse Main Lights", value: "85%", type: "Light", status: "Optimal" },
                  { name: "Facility Water Flow", value: "Stable", type: "Pressure", status: "Optimal" }
                ].map((f, idx) => (
                  <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-4.5 rounded-xl flex flex-col justify-between">
                    <h4 className="font-bold text-white">{f.name}</h4>
                    <div className="flex justify-between items-center mt-4 font-mono font-bold text-primary">
                      <span>{f.value}</span>
                      <span className="text-success">{f.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feature 3 & 4: Climate Adjuster & Simulation triggers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#0B1120] border border-borderSubtle p-5 rounded-2xl">
                
                {/* Climate Adjuster slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white">Manual Temperature Setting</h4>
                    <span className="text-xs text-primary font-mono font-bold">{facilitiesTemp.toFixed(1)}°C</span>
                  </div>
                  <input 
                    type="range" 
                    min="16" 
                    max="28" 
                    step="0.5" 
                    value={facilitiesTemp} 
                    onChange={e => setFacilitiesTemp(parseFloat(e.target.value))}
                    disabled={facilitiesAutoHvac}
                    className="w-full cursor-pointer accent-primary"
                  />
                  <span className="text-[10px] text-textMuted block">Disable Auto-Optimize Mode to adjust manually</span>
                </div>

                {/* Alarm Simulator */}
                <div className="space-y-3 flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-white">HVAC Stress Simulator</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setFacilitiesTemp(27.5);
                        alert("Warning: Simulating high heat load in East Concourse!");
                      }} 
                      className="flex-1 bg-warning/15 hover:bg-warning/25 border border-warning/20 text-warning text-xs font-bold py-2 rounded-xl transition-all"
                    >
                      Trip Heat Surge
                    </button>
                    <button 
                      onClick={() => {
                        setFacilitiesTemp(21.5);
                        alert("Environmental posture reset to default nominal settings.");
                      }} 
                      className="flex-1 bg-success/15 hover:bg-success/25 border border-success/20 text-success text-xs font-bold py-2 rounded-xl transition-all"
                    >
                      Reset Posture
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ----------------- PAGE 13: IOT SENSOR NETWORK ----------------- */}
          {currentTab === "sensors" && (
            <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-6 entrance-anim">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">sensors</span>
                    Connected IoT Sensor Grid
                  </h3>
                  <p className="text-[10px] text-textSecondary mt-0.5">Control detection metrics, filter alerts, and ping active devices</p>
                </div>

                {/* Feature 1: Alert Type Filter */}
                <div className="flex gap-2">
                  <select 
                    value={sensorFilter} 
                    onChange={e => setSensorFilter(e.target.value)}
                    className="bg-[#070B14] border border-borderSubtle rounded-xl py-1 px-3 text-xs text-textSecondary focus:outline-none focus:border-primary"
                  >
                    <option value="All">All Nodes</option>
                    <option value="Environment">Environment</option>
                    <option value="Scanner">Gate Scanners</option>
                    <option value="Network">Infrastructure</option>
                  </select>
                </div>
              </div>

              {/* Feature 2: Threshold Slider */}
              <div className="bg-[#0B1120] border border-borderSubtle p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white font-bold">IoT Warning Anomaly Threshold</span>
                  <span className="text-xs font-mono font-bold text-secondary">{sensorAlertThreshold}% Criticality</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="95" 
                  value={sensorAlertThreshold} 
                  onChange={e => setSensorAlertThreshold(parseInt(e.target.value))}
                  className="w-full cursor-pointer accent-secondary"
                />
              </div>

              {/* Feature 3 & 4: Sensor List and interactive ping trigger */}
              <div className="space-y-3">
                {[
                  { name: "Environment Humidifier #4", type: "Environment", state: "Active", latency: "14ms", details: "Zone 1 Concourse" },
                  { name: "Ticket QR Scanner Gate A", type: "Scanner", state: "Active", latency: "8ms", details: "Gate A Entry" },
                  { name: "Rooftop Mesh Repeater C", type: "Network", state: "Active", latency: "22ms", details: "Roof Sector C" }
                ]
                .filter(s => sensorFilter === "All" || s.type === sensorFilter)
                .map((s, idx) => (
                  <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-4 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-white">{s.name}</h4>
                      <p className="text-textSecondary mt-1">{s.type} • {s.details}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-textMuted text-[10px]">Ping: {s.latency}</span>
                      <button 
                        onClick={(e) => {
                          const btn = e.currentTarget;
                          btn.textContent = "Pinged: 4ms";
                          btn.style.color = "#10B981";
                          alert(`Ping response from ${s.name} received successfully.`);
                        }}
                        className="bg-[#070B14] hover:bg-panelBg border border-borderSubtle text-textSecondary hover:text-white py-1 px-2.5 rounded-lg transition-all"
                      >
                        Ping Node
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------- PAGE 14: ENERGY ANALYTICS ----------------- */}
          {currentTab === "energy" && (
            <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-6 entrance-anim">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">solar_power</span>
                    Renewable Energy Draw Manager
                  </h3>
                  <p className="text-[10px] text-textSecondary mt-0.5">Monitor microgrid solar generation feeds and load shed status</p>
                </div>

                {/* Feature 1: Energy Saving Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-textSecondary">Energy Saving Mode</span>
                  <button 
                    onClick={() => {
                      setEnergySavingActive(!energySavingActive);
                      alert(`Energy Saving Mode set to: ${!energySavingActive ? "ENABLED" : "DISABLED"}`);
                    }} 
                    className={`w-10 h-5 rounded-full relative transition-colors ${energySavingActive ? "bg-success" : "bg-panelBg border border-borderSubtle"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${energySavingActive ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
              </div>

              {/* Feature 2: Interactive gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-[#0B1120] p-4 rounded-xl border border-borderSubtle flex flex-col justify-between">
                  <span className="text-[9px] text-textSecondary uppercase font-bold">Solar Array Contribution</span>
                  <h4 className="text-lg font-black text-success mt-2">{energySavingActive ? "290 kW" : "240 kW"}</h4>
                  <div className="w-full h-1 bg-[#070B14] rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-success" style={{ width: energySavingActive ? "27%" : "22%" }} />
                  </div>
                </div>
                <div className="bg-[#0B1120] p-4 rounded-xl border border-borderSubtle flex flex-col justify-between">
                  <span className="text-[9px] text-textSecondary uppercase font-bold">Grid Feed Draw</span>
                  <h4 className="text-lg font-black text-white mt-2">{energySavingActive ? "620 kW" : "840 kW"}</h4>
                  <div className="w-full h-1 bg-[#070B14] rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-primary" style={{ width: energySavingActive ? "58%" : "78%" }} />
                  </div>
                </div>
                <div className="bg-[#0B1120] p-4 rounded-xl border border-borderSubtle flex flex-col justify-between">
                  <span className="text-[9px] text-textSecondary uppercase font-bold">Stadium Power Draw</span>
                  <h4 className="text-lg font-black text-primary mt-2">{energySavingActive ? "910 kW" : "1,080 kW"}</h4>
                  <div className="text-[9px] text-success font-semibold mt-3">{energySavingActive ? "15.7% Savings active" : "Nominal draw range"}</div>
                </div>
              </div>

              {/* Feature 3 & 4: Sub-system optimization & Load simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#0B1120] border border-borderSubtle p-5 rounded-2xl">
                
                {/* Optimize details list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white">Sub-system Load Postures</h4>
                  {[
                    { name: "Field Floodlights Grid", draw: "420 kW", state: "Optimal" },
                    { name: "Concourse Main HVAC units", draw: "380 kW", state: "Eco-Active" },
                    { name: "Server Infrastructure Array", draw: "120 kW", state: "Optimal" }
                  ].map((sys, idx) => (
                    <div key={idx} className="bg-[#070B14] p-3 rounded-xl flex justify-between items-center border border-borderSubtle text-xs">
                      <div>
                        <span className="font-bold text-white block">{sys.name}</span>
                        <span className="text-[9px] text-textSecondary mt-0.5 block">Active Draw: {sys.draw}</span>
                      </div>
                      <button 
                        onClick={() => alert(`Optimized posture profile for: ${sys.name}`)}
                        className="bg-primary/10 hover:bg-primary/20 text-primary py-1 px-2.5 rounded-lg border border-primary/20 transition-all text-[10px] font-bold"
                      >
                        Optimize Profile
                      </button>
                    </div>
                  ))}
                </div>

                {/* Energy simulator controls */}
                <div className="space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Grid Load stress simulator</h4>
                    <p className="text-[10px] text-textSecondary mt-1 leading-normal">Simulate the peak stadium load during floodlight startup sequences to verify backup generators.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => alert("Warning: Floodlights initial ignition sequence simulated. Grid load spiked to 1,480 kW.")}
                      className="flex-1 bg-warning/15 hover:bg-warning/25 border border-warning/20 text-warning text-xs font-bold py-2 rounded-xl transition-all"
                    >
                      Ignite Lights (Ignition Spike)
                    </button>
                    <button 
                      onClick={() => alert("Emergency solar storage batteries deployed. Grid demand reduced by 300 kW.")}
                      className="flex-1 bg-success/15 hover:bg-success/25 border border-success/20 text-success text-xs font-bold py-2 rounded-xl transition-all"
                    >
                      Deploy Battery Reserves
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ----------------- PAGE 15: LOST & FOUND AI ----------------- */}
          {currentTab === "lost-found" && (
            <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-6 entrance-anim">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">find_in_page</span>
                    Lost &amp; Found AI Matching Panel
                  </h3>
                  <p className="text-[10px] text-textSecondary mt-0.5">Report lost items and trigger AI similarity matches against found registry</p>
                </div>
                
                {/* Feature 1: Registry Search bar */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Search registry..." 
                    value={lostFoundSearch}
                    onChange={e => setLostFoundSearch(e.target.value)}
                    className="bg-[#070B14] border border-borderSubtle rounded-xl py-1 px-3 text-xs text-white focus:outline-none focus:border-primary max-w-[180px]"
                  />
                  <button 
                    onClick={() => alert("Re-indexing registry logs. 12 potential matches resolved.")}
                    className="bg-primary/10 hover:bg-primary/20 text-primary py-1 px-3 rounded-lg border border-primary/20 transition-colors text-xs font-bold"
                  >
                    Sync Registry
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Feature 2: Log Form */}
                <div className="bg-[#0B1120] p-5 rounded-2xl border border-borderSubtle space-y-4 text-xs">
                  <h4 className="font-bold text-sm text-white uppercase border-b border-borderSubtle pb-2">Log Item Details</h4>
                  
                  <div className="flex gap-2">
                    <button onClick={() => setLfType("Lost")} className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${lfType === "Lost" ? "bg-primary text-white" : "bg-[#070B14] text-textSecondary"}`}>Lost Item</button>
                    <button onClick={() => setLfType("Found")} className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${lfType === "Found" ? "bg-primary text-white" : "bg-[#070B14] text-textSecondary"}`}>Found Item</button>
                  </div>

                  <div>
                    <label className="block mb-1 text-textSecondary">Category</label>
                    <select value={lfCat} onChange={e => setLfCat(e.target.value)} className="w-full bg-[#070B14] border border-borderSubtle rounded-lg p-2 text-white">
                      <option value="Electronics">Electronics</option>
                      <option value="Wallets/IDs">Wallets/IDs</option>
                      <option value="Bags/Backpacks">Bags/Backpacks</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Keys">Keys</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 text-textSecondary">Location</label>
                    <input type="text" value={lfLoc} onChange={e => setLfLoc(e.target.value)} className="w-full bg-[#070B14] border border-borderSubtle rounded-lg p-2 text-white" placeholder="e.g. North Stand Section B" />
                  </div>

                  <div>
                    <label className="block mb-1 text-textSecondary">Description</label>
                    <textarea value={lfDesc} onChange={e => setLfDesc(e.target.value)} rows={3} className="w-full bg-[#070B14] border border-borderSubtle rounded-lg p-2 resize-none text-white" placeholder="cracked screen, stickers, brand color..." />
                  </div>

                  <button onClick={handleAddLostFound} className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-2.5 rounded-lg border border-white/5 shadow-md shadow-secondary/15">Submit Report</button>
                </div>

                {/* Feature 3 & 4: Registry Items List & Interactive Match trigger */}
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="font-bold text-sm uppercase text-textSecondary">Registry Items</h4>
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                    {lostFoundItems
                      .filter(item => {
                        const search = lostFoundSearch.toLowerCase();
                        return (
                          item.category.toLowerCase().includes(search) || 
                          item.description.toLowerCase().includes(search) ||
                          (item.location_lost && item.location_lost.toLowerCase().includes(search)) ||
                          (item.location_found && item.location_found.toLowerCase().includes(search))
                        );
                      })
                      .map(item => (
                        <div key={item.id} className="bg-[#0B1120] border border-borderSubtle rounded-xl p-4 text-xs space-y-2 card-hover">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${item.type === "Lost" ? "bg-error/20 text-error" : "bg-success/20 text-success"}`}>
                                {item.type}
                              </span>
                              <span className="font-bold text-white">{item.category}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-textMuted uppercase font-bold">{item.status}</span>
                              <button 
                                onClick={() => alert(`Auto-Match triggered for ID ${item.id}. AI similarity matched at 95%.`)}
                                className="bg-[#070B14] hover:bg-panelBg border border-borderSubtle text-primary py-0.5 px-2 rounded font-mono text-[9px] transition-colors"
                              >
                                Match Node
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-textSecondary leading-normal">{item.description}</p>
                          {item.status === "Matched" && (
                            <div className="flex justify-between items-center pt-2 border-t border-borderSubtle/50 text-[10px] text-primary font-bold font-mono">
                              <span>Similarity score: 94%</span>
                              <span>Matched ID: M-2849</span>
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ----------------- PAGE 16: COMPLIANCE & AUDIT ----------------- */}
          {currentTab === "audit" && (
            <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl space-y-6 entrance-anim">
              <h3 className="text-base font-bold text-white">Compliance &amp; Audit Logs</h3>
              
              <div className="bg-[#070B14] rounded-xl border border-borderSubtle p-4 overflow-x-auto max-h-[360px] scrollbar-thin">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-borderSubtle text-textMuted">
                      <th className="py-2.5">Timestamp</th>
                      <th className="py-2.5">User</th>
                      <th className="py-2.5">Action</th>
                      <th className="py-2.5">Resource</th>
                      <th className="py-2.5">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="border-b border-borderSubtle/30 text-textSecondary hover:bg-[#0B1120]">
                        <td className="py-2.5 text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-2.5">{log.user_email}</td>
                        <td className="py-2.5 text-primary">{log.action}</td>
                        <td className="py-2.5">{log.resource} ({log.resource_id})</td>
                        <td className="py-2.5 text-success">SUCCESS</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ----------------- OTHER TABS — FULLY DESIGNED ----------------- */}
          {currentTab === "match-ctrl" && (
            <div className="space-y-6 entrance-anim">
              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
                      Live Match Control
                    </h3>
                    <p className="text-xs text-textSecondary mt-1">Real-time scoring and match event management</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                    <span className="text-[10px] font-bold text-error uppercase tracking-widest">LIVE</span>
                  </div>
                </div>

                <div className="bg-[#070B14] border border-borderSubtle rounded-2xl p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest">India Championship Final</span>
                  <div className="flex items-center justify-center gap-8 mt-4 relative z-10">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-black text-primary">BT</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">Bengal Tigers</h4>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-black text-white tracking-wider">2 — 1</div>
                      <div className="flex flex-col items-center mt-2">
                        <span className="text-[10px] text-error font-bold uppercase tracking-widest">Second Half</span>
                        <span className="text-lg font-mono font-bold text-white mt-1">67:42</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-black text-secondary">MW</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">Mumbai Warriors</h4>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 stagger-children">
                  <button className="bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">sports_score</span> Goal +1 Tigers
                  </button>
                  <button className="bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 text-secondary text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">sports_score</span> Goal +1 Warriors
                  </button>
                  <button className="bg-warning/10 hover:bg-warning/20 border border-warning/20 text-warning text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">style</span> Yellow Card
                  </button>
                  <button className="bg-error/10 hover:bg-error/20 border border-error/20 text-error text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">style</span> Red Card
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
                {[
                  { label: "Possession", home: "58%", away: "42%", color: "primary" },
                  { label: "Shots on Target", home: "7", away: "4", color: "success" },
                  { label: "Fouls Committed", home: "8", away: "12", color: "warning" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4 shadow-md card-hover">
                    <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest block mb-3">{stat.label}</span>
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-primary">{stat.home}</span>
                      <div className="flex-1 mx-3 h-2 bg-[#070B14] rounded-full overflow-hidden flex">
                        <div className="bg-primary/60 rounded-l-full" style={{ width: stat.home }} />
                        <div className="bg-secondary/60 flex-1 rounded-r-full" />
                      </div>
                      <span className="text-secondary">{stat.away}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-lg">
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-4">Match Events Timeline</h4>
                <div className="space-y-3 text-xs">
                  {[
                    { time: "12'", event: "Goal — R. Sharma (Bengal Tigers)", icon: "sports_score", color: "primary" },
                    { time: "34'", event: "Yellow Card — K. Patel (Mumbai Warriors)", icon: "style", color: "warning" },
                    { time: "45+2'", event: "Goal — A. Khan (Mumbai Warriors)", icon: "sports_score", color: "secondary" },
                    { time: "58'", event: "Substitution — Bengal Tigers (D. Roy → S. Das)", icon: "swap_horiz", color: "info" },
                    { time: "63'", event: "Goal — R. Sharma (Bengal Tigers)", icon: "sports_score", color: "primary" }
                  ].map((e, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-[#0B1120] border border-borderSubtle rounded-xl">
                      <span className="font-mono font-bold text-textMuted w-12">{e.time}</span>
                      <span className={`material-symbols-outlined text-sm text-${e.color}`}>{e.icon}</span>
                      <span className="text-textPrimary font-medium">{e.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentTab === "team-ops" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: "Teams Registered", value: "16", icon: "groups", change: "+2 this week" },
                  { label: "Players Active", value: "352", icon: "person", change: "All present" },
                  { label: "Support Staff", value: "128", icon: "badge", change: "96% checked-in" },
                  { label: "Dressing Rooms", value: "4/4", icon: "meeting_room", change: "All assigned" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">{s.label}</span>
                      <span className="material-symbols-outlined text-textMuted text-lg">{s.icon}</span>
                    </div>
                    <h4 className="text-2xl font-black text-white mt-2">{s.value}</h4>
                    <span className="text-[10px] text-success font-semibold mt-2 block">{s.change}</span>
                  </div>
                ))}
              </div>

              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4">Team Arrival & Readiness</h3>
                <div className="space-y-3">
                  {[
                    { team: "Bengal Tigers", bus: "Arrived 10:30 AM", room: "Dressing Room A", warmup: "Completed", status: "Ready" },
                    { team: "Mumbai Warriors", bus: "Arrived 10:45 AM", room: "Dressing Room B", warmup: "In Progress", status: "Preparing" },
                    { team: "Match Officials", bus: "Arrived 09:15 AM", room: "Officials Suite", warmup: "N/A", status: "Ready" },
                    { team: "Medical Team", bus: "On-site", room: "Medical Bay 1-3", warmup: "N/A", status: "Standby" }
                  ].map((t, idx) => (
                    <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-4 rounded-xl flex flex-wrap md:flex-nowrap justify-between items-center gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-sm">groups</span>
                        </div>
                        <h4 className="font-bold text-white">{t.team}</h4>
                      </div>
                      <span className="text-textSecondary">{t.bus}</span>
                      <span className="text-textSecondary">{t.room}</span>
                      <span className="text-textSecondary">{t.warmup}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${t.status === "Ready" ? "bg-success/20 text-success" : t.status === "Standby" ? "bg-info/20 text-info" : "bg-warning/20 text-warning"}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentTab === "scheduling" && (
            <div className="space-y-6 entrance-anim">
              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">calendar_today</span>
                      Smart Tournament Scheduling
                    </h3>
                    <p className="text-[10px] text-textSecondary mt-0.5">Filter match days and manage official slot allocations</p>
                  </div>

                  {/* Filter and action toolbar */}
                  <div className="flex gap-2 flex-wrap items-center">
                    <input 
                      type="text" 
                      placeholder="Search matches..."
                      value={schedulingSearch}
                      onChange={e => setSchedulingSearch(e.target.value)}
                      className="bg-[#070B14] border border-borderSubtle rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-primary transition-all max-w-[180px]"
                    />
                    
                    <select 
                      value={schedulingFilter} 
                      onChange={e => setSchedulingFilter(e.target.value)}
                      className="bg-[#070B14] border border-borderSubtle rounded-xl py-1.5 px-3 text-xs text-textSecondary focus:outline-none focus:border-primary"
                    >
                      <option value="All">All Schedules</option>
                      <option value="Today">Today</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <button 
                      onClick={() => alert("Auto-Scheduler deployed. Resolving referee overlaps...")}
                      className="bg-primary hover:bg-primary/95 text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">auto_awesome</span> Optimize Slots
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { date: "Jul 5", time: "2:00 PM", match: "Delhi Capitals vs Rajasthan Royals", venue: "Court 1", status: "Completed", score: "3-1" },
                    { date: "Jul 7", time: "4:00 PM", match: "Chennai Kings vs Punjab Lions", venue: "Court 1", status: "Completed", score: "2-2 (PKs: 4-3)" },
                    { date: "Jul 9", time: "3:00 PM", match: "Bengal Tigers vs Delhi Capitals", venue: "Main Arena", status: "Today", score: "—" },
                    { date: "Jul 11", time: "6:00 PM", match: "Mumbai Warriors vs Chennai Kings", venue: "Main Arena", status: "Upcoming", score: "—" },
                    { date: "Jul 14", time: "7:30 PM", match: "Semi-Final 1", venue: "Main Arena", status: "Upcoming", score: "—" },
                    { date: "Jul 16", time: "7:30 PM", match: "Semi-Final 2", venue: "Main Arena", status: "Upcoming", score: "—" },
                    { date: "Jul 20", time: "8:00 PM", match: "Grand Final", venue: "Main Arena", status: "Upcoming", score: "—" }
                  ]
                  .filter(m => {
                    const matchesSearch = m.match.toLowerCase().includes(schedulingSearch.toLowerCase());
                    if (schedulingFilter === "All") return matchesSearch;
                    return matchesSearch && m.status.toLowerCase() === schedulingFilter.toLowerCase();
                  })
                  .map((m, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border flex flex-wrap md:flex-nowrap justify-between items-center gap-3 text-xs ${m.status === "Today" ? "bg-primary/5 border-primary/25 active-border-glow" : "bg-[#0B1120] border-borderSubtle"}`}>
                      <div className="flex items-center gap-3 min-w-[100px]">
                        <div className="text-center min-w-[50px]">
                          <span className="block text-[10px] text-textMuted uppercase font-bold">{m.date}</span>
                          <span className="block text-xs text-white font-mono font-bold">{m.time}</span>
                        </div>
                      </div>
                      <span className="font-bold text-white flex-1">{m.match}</span>
                      <span className="text-textSecondary">{m.venue}</span>
                      <span className="font-mono text-textMuted">{m.score}</span>
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        m.status === "Completed" ? "bg-success/20 text-success" :
                        m.status === "Today" ? "bg-primary/20 text-primary animate-pulse" :
                        "bg-[#1E293B] text-textSecondary"
                      }`}>{m.status}</span>
                      
                      <button 
                        onClick={() => alert(`Allocated officials for match: ${m.match}`)}
                        className="bg-[#070B14] hover:bg-panelBg border border-borderSubtle text-textSecondary hover:text-white py-1 px-2.5 rounded-lg transition-colors"
                      >
                        Assign Ref
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentTab === "gate-ctrl" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                {(gates.length ? gates.slice(0, 4) : [
                  { name: "Gate A", status: "Open", queue_length: 85, throughput: 340 },
                  { name: "Gate B", status: "Open", queue_length: 312, throughput: 520 },
                  { name: "Gate C", status: "Open", queue_length: 42, throughput: 280 },
                  { name: "Gate D", status: "Restricted", queue_length: 0, throughput: 0 }
                ] as any[]).map((g: any, idx: number) => (
                  <div key={idx} className={`bg-cardBg border rounded-2xl p-4.5 shadow-md card-hover relative overflow-hidden ${g.queue_length > 200 ? "border-error/30" : "border-borderSubtle"}`}>
                    {g.queue_length > 200 && <div className="absolute top-0 left-0 w-full h-0.5 bg-error animate-pulse" />}
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm">{g.name}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${g.status === "Open" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{g.status}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-textSecondary">Queue</span>
                        <span className={`font-bold ${g.queue_length > 200 ? "text-error" : "text-white"}`}>{g.queue_length} people</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#070B14] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${g.queue_length > 200 ? "bg-error" : g.queue_length > 100 ? "bg-warning" : "bg-success"}`} style={{ width: `${Math.min(100, (g.queue_length / 400) * 100)}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-textSecondary">Throughput</span>
                        <span className="text-primary font-bold font-mono">{g.throughput || 0}/hr</span>
                      </div>
                    </div>
                    {g.queue_length > 200 && (
                      <button className="w-full mt-3 bg-error/10 hover:bg-error/20 border border-error/20 text-error text-[10px] font-bold py-1.5 rounded-lg transition-colors">
                        Redirect Flow →
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-lg">
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-4">Gate Flow Analytics</h4>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gates.length ? gates.slice(0, 6) : [{ name: "Gate A", queue_length: 85 }, { name: "Gate B", queue_length: 312 }, { name: "Gate C", queue_length: 42 }, { name: "Gate D", queue_length: 0 }] as any}>
                      <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(148, 163, 184, 0.12)", borderRadius: "12px" }} />
                      <Bar dataKey="queue_length" fill="#3B82F6" name="Queue Length" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {currentTab === "fan-exp" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: "Fan Satisfaction", value: `${fanSentiment}%`, icon: "sentiment_satisfied", color: "primary", sub: "Based on 2,400 surveys" },
                  { label: "Concession Rating", value: `${concessionRating}%`, icon: "fastfood", color: "secondary", sub: "Average queue: 4.2 min" },
                  { label: "Net Promoter Score", value: "72", icon: "thumb_up", color: "success", sub: "+8 from last event" },
                  { label: "Wi-Fi Satisfaction", value: "91%", icon: "wifi", color: "info", sub: "12,400 connected" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">{s.label}</span>
                      <span className={`material-symbols-outlined text-${s.color} text-lg`}>{s.icon}</span>
                    </div>
                    <h4 className={`text-2xl font-black text-${s.color} mt-2`}>{s.value}</h4>
                    <span className="text-[10px] text-textSecondary mt-2 block">{s.sub}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-lg">
                  <h4 className="font-bold text-white text-sm mb-4">Satisfaction Trend (Today)</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{ time: "1 PM", score: 88 }, { time: "2 PM", score: 91 }, { time: "3 PM", score: 86 }, { time: "4 PM", score: 94 }, { time: "5 PM", score: 92 }]}>
                        <defs><linearGradient id="fanGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="time" stroke="#64748B" fontSize={10} />
                        <YAxis stroke="#64748B" fontSize={10} domain={[70, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(148, 163, 184, 0.12)", borderRadius: "12px" }} />
                        <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} fill="url(#fanGrad)" name="Satisfaction %" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-lg">
                  <h4 className="font-bold text-white text-sm mb-4">Concession Zone Demand</h4>
                  <div className="space-y-3">
                    {[
                      { zone: "North Stand Food Court", wait: "3.2 min", demand: 85, status: "High" },
                      { zone: "South Stand Beverages", wait: "1.8 min", demand: 45, status: "Normal" },
                      { zone: "East Wing Premium Lounge", wait: "0.5 min", demand: 20, status: "Low" },
                      { zone: "West Gate Snack Bar", wait: "5.1 min", demand: 92, status: "Critical" }
                    ].map((c, idx) => (
                      <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-3 rounded-xl text-xs">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-white">{c.zone}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.status === "Critical" ? "bg-error/20 text-error" : c.status === "High" ? "bg-warning/20 text-warning" : c.status === "Normal" ? "bg-success/20 text-success" : "bg-[#1E293B] text-textSecondary"}`}>{c.status}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-[#070B14] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${c.demand > 80 ? "bg-error" : c.demand > 50 ? "bg-warning" : "bg-success"}`} style={{ width: `${c.demand}%` }} />
                          </div>
                          <span className="text-textMuted font-mono text-[10px]">{c.wait}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "accessibility" && (
            <div className="space-y-6 entrance-anim">
              
              {/* Top Accessibility Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: "Wheelchair Escorts", value: "4 Active", icon: "accessible", color: "primary" },
                  { label: "Accessible Seats", value: "320 / 340", icon: "event_seat", color: "success" },
                  { label: "Service Requests", value: "3 Pending", icon: "support_agent", color: "warning" },
                  { label: "Elevator Status", value: "All Online", icon: "elevator", color: "info" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">{s.label}</span>
                      <span className={`material-symbols-outlined text-${s.color} text-lg`}>{s.icon}</span>
                    </div>
                    <h4 className="text-lg font-black text-white mt-2">{s.value}</h4>
                  </div>
                ))}
              </div>

              {/* Grid: Dispatch form, Requests log, and Elevator status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Requests (Col span 2) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                    <h3 className="text-sm font-bold text-white mb-4">Active Assistance Requests</h3>
                    <div className="space-y-3 text-xs">
                      {[
                        { id: "ACC-001", type: "Wheelchair Escort", location: "Gate A → Section 12", assigned: "Staff J. Kumar", eta: "3 min", priority: "High" },
                        { id: "ACC-002", type: "Audio Description", location: "Section 5, Row H", assigned: "Pending", eta: "—", priority: "Medium" },
                        { id: "ACC-003", type: "Visual Assistance", location: "Concourse North", assigned: "Staff M. Singh", eta: "1 min", priority: "High" }
                      ].map((r, idx) => (
                        <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-4 rounded-xl flex flex-wrap md:flex-nowrap justify-between items-center gap-3">
                          <span className="font-mono text-textMuted">{r.id}</span>
                          <span className="font-bold text-white">{r.type}</span>
                          <span className="text-textSecondary">{r.location}</span>
                          <span className="text-textSecondary">{r.assigned}</span>
                          <span className="text-primary font-mono font-bold">{r.eta}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.priority === "High" ? "bg-error/20 text-error" : "bg-warning/20 text-warning"}`}>{r.priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dispatch & Elevator controls (Col span 1) */}
                <div className="space-y-6">
                  {/* Dispatcher form */}
                  <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl space-y-3 text-xs">
                    <h4 className="font-bold text-white">Request Escort Dispatch</h4>
                    <div>
                      <label className="text-[10px] text-textMuted block mb-1">Service Type</label>
                      <select id="acc-type" className="w-full bg-[#070B14] border border-borderSubtle rounded-xl p-2 text-white">
                        <option>Wheelchair Assistance</option>
                        <option>Visual Guide escort</option>
                        <option>Hearing Loop headset</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-textMuted block mb-1">Pick-up Location</label>
                      <input id="acc-loc" type="text" placeholder="e.g. gate C turnstiles" className="w-full bg-[#070B14] border border-borderSubtle rounded-xl p-2 text-white" />
                    </div>
                    <button 
                      onClick={() => {
                        const loc = (document.getElementById("acc-loc") as HTMLInputElement)?.value;
                        const typ = (document.getElementById("acc-type") as HTMLSelectElement)?.value;
                        if (loc) {
                          alert(`Dispatched crew: ${typ} requested at ${loc}`);
                        } else {
                          alert("Please specify pick-up location!");
                        }
                      }}
                      className="w-full bg-primary hover:bg-primary/95 text-white py-2 rounded-xl font-bold transition-all border border-white/5"
                    >
                      Dispatch Assistance
                    </button>
                  </div>

                  {/* Elevator status controller */}
                  <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl space-y-3 text-xs">
                    <h4 className="font-bold text-white">Elevator Infrastructure (3 lifts)</h4>
                    <div className="space-y-2">
                      <div className="bg-[#0B1120] p-2.5 rounded-xl border border-borderSubtle flex justify-between items-center">
                        <span className="font-bold text-white">Lift #3 (VIP Stand)</span>
                        <button 
                          onClick={(e) => {
                            const btn = e.currentTarget;
                            if (btn.textContent === "Online") {
                              btn.textContent = "Offline";
                              btn.className = "bg-error/20 text-error py-0.5 px-2 rounded border border-error/30 text-[10px]";
                              alert("Lift #3 set to Maintenance mode.");
                            } else {
                              btn.textContent = "Online";
                              btn.className = "bg-success/20 text-success py-0.5 px-2 rounded border border-success/30 text-[10px]";
                              alert("Lift #3 restored to Service.");
                            }
                          }}
                          className="bg-success/20 text-success py-0.5 px-2 rounded border border-success/30 text-[10px]"
                        >
                          Online
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {currentTab === "medical" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: "Active Cases", value: "2", icon: "local_hospital", color: "error" },
                  { label: "Medical Staff", value: "24 On-Duty", icon: "medical_services", color: "primary" },
                  { label: "Avg Response", value: "2.4 min", icon: "timer", color: "success" },
                  { label: "Beds Available", value: "6 / 8", icon: "bed", color: "info" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">{s.label}</span>
                      <span className={`material-symbols-outlined text-${s.color} text-lg`}>{s.icon}</span>
                    </div>
                    <h4 className={`text-2xl font-black mt-2 ${s.color === "error" ? "text-error" : "text-white"}`}>{s.value}</h4>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4">First Aid Stations</h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { name: "North Stand Medical Bay", beds: "2/3", staff: 6, status: "Active Case" },
                      { name: "South Stand First Aid", beds: "3/3", staff: 4, status: "Available" },
                      { name: "East Wing Trauma Unit", beds: "1/2", staff: 8, status: "Active Case" },
                      { name: "VIP Medical Suite", beds: "2/2", staff: 2, status: "Standby" }
                    ].map((s, idx) => (
                      <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-4 rounded-xl flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white">{s.name}</h4>
                          <p className="text-textSecondary mt-1">Beds: {s.beds} • Staff: {s.staff}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.status === "Active Case" ? "bg-error/20 text-error" : s.status === "Available" ? "bg-success/20 text-success" : "bg-[#1E293B] text-textSecondary"}`}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4">Recent Medical Incidents</h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { time: "4:32 PM", type: "Heat Exhaustion", location: "Section 8", status: "Treated", severity: "Minor" },
                      { time: "3:18 PM", type: "Laceration", location: "Concourse B", status: "In Treatment", severity: "Moderate" },
                      { time: "2:45 PM", type: "Dehydration", location: "Section 3", status: "Discharged", severity: "Minor" }
                    ].map((m, idx) => (
                      <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-white">{m.type}</span>
                          <span className="text-[9px] font-mono text-textMuted">{m.time}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-textSecondary">{m.location}</span>
                          <div className="flex gap-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.severity === "Minor" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{m.severity}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.status === "Discharged" ? "bg-[#1E293B] text-textSecondary" : m.status === "Treated" ? "bg-success/20 text-success" : "bg-primary/20 text-primary"}`}>{m.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "threat-intel" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: "Threat Level", value: "LOW", icon: "shield", color: "success" },
                  { label: "Perimeter Sensors", value: "64 Active", icon: "radar", color: "primary" },
                  { label: "Anomalies Detected", value: "0", icon: "warning", color: "success" },
                  { label: "Intel Feeds Active", value: "12", icon: "rss_feed", color: "info" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">{s.label}</span>
                      <span className={`material-symbols-outlined text-${s.color} text-lg`}>{s.icon}</span>
                    </div>
                    <h4 className={`text-2xl font-black text-${s.color} mt-2`}>{s.value}</h4>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4">Perimeter Security Status</h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { sector: "North Perimeter", cameras: 12, sensors: 8, status: "Secure", lastScan: "12s ago" },
                      { sector: "South Perimeter", cameras: 10, sensors: 6, status: "Secure", lastScan: "8s ago" },
                      { sector: "East Gate Corridor", cameras: 8, sensors: 12, status: "Secure", lastScan: "4s ago" },
                      { sector: "West VIP Entrance", cameras: 6, sensors: 10, status: "Secure", lastScan: "15s ago" },
                      { sector: "Rooftop Access", cameras: 4, sensors: 4, status: "Locked", lastScan: "30s ago" }
                    ].map((s, idx) => (
                      <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-3.5 rounded-xl flex justify-between items-center">
                        <span className="font-bold text-white min-w-[140px]">{s.sector}</span>
                        <span className="text-textSecondary">{s.cameras} cam</span>
                        <span className="text-textSecondary">{s.sensors} sensor</span>
                        <span className="text-textMuted font-mono text-[10px]">{s.lastScan}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-success/20 text-success">{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4">Threat Log (Last 24h)</h3>
                  <div className="space-y-3 text-xs">
                    <div className="bg-success/5 border border-success/15 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-success text-sm">verified</span>
                        <span className="font-bold text-success">All Clear</span>
                      </div>
                      <p className="text-textSecondary leading-relaxed">No security threats or unauthorized access attempts detected in the last 24 hours. All perimeter zones reporting nominal status.</p>
                    </div>
                    <div className="bg-[#0B1120] border border-borderSubtle p-3 rounded-xl text-textSecondary">
                      <span className="font-mono text-[10px] text-textMuted">14:22</span> — Routine bag check completed at Gate B (842 scans)
                    </div>
                    <div className="bg-[#0B1120] border border-borderSubtle p-3 rounded-xl text-textSecondary">
                      <span className="font-mono text-[10px] text-textMuted">12:05</span> — Perimeter drone patrol completed — no anomalies
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "task-ops" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: "Total Tasks", value: "48", icon: "assignment", color: "primary" },
                  { label: "In Progress", value: "12", icon: "pending", color: "warning" },
                  { label: "Completed", value: "31", icon: "task_alt", color: "success" },
                  { label: "Overdue", value: "5", icon: "running_with_errors", color: "error" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">{s.label}</span>
                      <span className={`material-symbols-outlined text-${s.color} text-lg`}>{s.icon}</span>
                    </div>
                    <h4 className={`text-2xl font-black text-${s.color} mt-2`}>{s.value}</h4>
                  </div>
                ))}
              </div>

              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4">Active Task Board</h3>
                <div className="space-y-3 text-xs">
                  {[
                    { task: "Gate B scanner batteries check", assignee: "M. Singh", priority: "High", status: "Completed", due: "1:00 PM" },
                    { task: "Restock North Stand concession supplies", assignee: "R. Gupta", priority: "Medium", status: "In Progress", due: "2:30 PM" },
                    { task: "Deploy reserve stewards to Section 5", assignee: "J. Kumar", priority: "Critical", status: "In Progress", due: "Now" },
                    { task: "Test emergency PA system backup", assignee: "P. Sharma", priority: "High", status: "Pending", due: "3:00 PM" },
                    { task: "Update digital signage with gate redirect info", assignee: "A. Verma", priority: "Medium", status: "Completed", due: "12:00 PM" },
                    { task: "Inspect VIP lounge HVAC unit 3", assignee: "D. Khan", priority: "Low", status: "Pending", due: "5:00 PM" }
                  ].map((t, idx) => (
                    <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-4 rounded-xl flex flex-wrap md:flex-nowrap justify-between items-center gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`material-symbols-outlined text-sm ${t.status === "Completed" ? "text-success" : t.status === "In Progress" ? "text-primary" : "text-textMuted"}`}>
                          {t.status === "Completed" ? "check_circle" : t.status === "In Progress" ? "pending" : "radio_button_unchecked"}
                        </span>
                        <span className={`font-medium ${t.status === "Completed" ? "text-textSecondary line-through" : "text-white"}`}>{t.task}</span>
                      </div>
                      <span className="text-textSecondary">{t.assignee}</span>
                      <span className="text-textMuted font-mono text-[10px]">{t.due}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        t.priority === "Critical" ? "bg-error/20 text-error" : t.priority === "High" ? "bg-warning/20 text-warning" : t.priority === "Medium" ? "bg-primary/20 text-primary" : "bg-[#1E293B] text-textSecondary"
                      }`}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentTab === "shifts" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: "Active Shift", value: "Alpha", icon: "schedule", color: "primary", sub: "10:00 AM – 4:00 PM" },
                  { label: "Check-in Rate", value: "98%", icon: "login", color: "success", sub: "196 of 200" },
                  { label: "Next Rotation", value: "4:00 PM", icon: "swap_horiz", color: "warning", sub: "Shift Beta incoming" },
                  { label: "Overtime Hours", value: "12h", icon: "more_time", color: "info", sub: "6 staff extended" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">{s.label}</span>
                      <span className={`material-symbols-outlined text-${s.color} text-lg`}>{s.icon}</span>
                    </div>
                    <h4 className="text-2xl font-black text-white mt-2">{s.value}</h4>
                    <span className="text-[10px] text-textSecondary mt-1 block">{s.sub}</span>
                  </div>
                ))}
              </div>

              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4">Shift Roster Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {[
                    { shift: "Alpha", time: "10:00 AM – 4:00 PM", staff: 200, checkedIn: 196, status: "Active" },
                    { shift: "Beta", time: "4:00 PM – 10:00 PM", staff: 180, checkedIn: 0, status: "Standby" },
                    { shift: "Gamma (Overnight)", time: "10:00 PM – 6:00 AM", staff: 40, checkedIn: 0, status: "Scheduled" }
                  ].map((s, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${s.status === "Active" ? "bg-primary/5 border-primary/25" : "bg-[#0B1120] border-borderSubtle"}`}>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-white">Shift {s.shift}</h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${s.status === "Active" ? "bg-success/20 text-success" : s.status === "Standby" ? "bg-warning/20 text-warning" : "bg-[#1E293B] text-textSecondary"}`}>{s.status}</span>
                      </div>
                      <p className="text-textSecondary font-mono">{s.time}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-textSecondary">Staff: {s.staff}</span>
                        <span className="text-primary font-bold">{s.checkedIn}/{s.staff} in</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#070B14] rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(s.checkedIn / s.staff) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentTab === "sustainability" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: "Carbon Offset", value: "72.4%", icon: "eco", color: "success" },
                  { label: "Water Reclaimed", value: "8,400L", icon: "water_drop", color: "info" },
                  { label: "Waste Recycled", value: "68%", icon: "recycling", color: "primary" },
                  { label: "Solar Contribution", value: "22%", icon: "solar_power", color: "warning" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">{s.label}</span>
                      <span className={`material-symbols-outlined text-${s.color} text-lg`}>{s.icon}</span>
                    </div>
                    <h4 className={`text-2xl font-black text-${s.color} mt-2`}>{s.value}</h4>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4">Waste Management Breakdown</h3>
                  <div className="space-y-4 text-xs">
                    {[
                      { type: "Recyclable Plastics", amount: "420 kg", percent: 78, color: "primary" },
                      { type: "Food Waste (Compost)", amount: "280 kg", percent: 62, color: "success" },
                      { type: "General Waste", amount: "180 kg", percent: 32, color: "warning" },
                      { type: "Hazardous Materials", amount: "5 kg", percent: 100, color: "error" }
                    ].map((w, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-white font-medium">{w.type}</span>
                          <span className="text-textSecondary font-mono">{w.amount} ({w.percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-[#070B14] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-${w.color}`} style={{ width: `${w.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white mb-4">Energy Source Mix</h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{ source: "Solar", kw: 240 }, { source: "Wind", kw: 80 }, { source: "Grid", kw: 760 }]}>
                          <XAxis dataKey="source" stroke="#64748B" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(148, 163, 184, 0.12)", borderRadius: "12px" }} />
                          <Bar dataKey="kw" fill="#10B981" name="kW Output" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Feature 4: Water reclamation goal setting slider */}
                  <div className="mt-4 pt-4 border-t border-borderSubtle/60 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">Water Reclamation Efficiency Target</span>
                      <span className="font-mono font-bold text-success">{sustainabilityGoal}% Efficiency</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="98" 
                      value={sustainabilityGoal} 
                      onChange={e => setSustainabilityGoal(parseInt(e.target.value))}
                      className="w-full cursor-pointer accent-success"
                    />
                    <div className="flex justify-between text-[9px] text-textMuted">
                      <span>Low Reclamation Load</span>
                      <span>High Reclamation Load (Optimal)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "comm-hub" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4">Channels</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { name: "# general-ops", unread: 3, active: true },
                      { name: "# gate-control", unread: 8, active: false },
                      { name: "# security-alpha", unread: 0, active: false },
                      { name: "# medical-team", unread: 1, active: false },
                      { name: "# vip-services", unread: 0, active: false },
                      { name: "# ai-alerts", unread: 14, active: false }
                    ].map((ch, idx) => (
                      <button key={idx} className={`w-full text-left p-2.5 rounded-xl flex justify-between items-center transition-colors ${ch.active ? "bg-primary/10 border border-primary/20 text-white" : "hover:bg-panelBg text-textSecondary"}`}>
                        <span className="font-medium">{ch.name}</span>
                        {ch.unread > 0 && <span className="bg-primary text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{ch.unread}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-3 bg-cardBg border border-borderSubtle rounded-2xl shadow-xl flex flex-col h-[460px]">
                  <div className="p-4 border-b border-borderSubtle flex items-center gap-3">
                    <span className="text-sm font-bold text-white"># general-ops</span>
                    <span className="text-[10px] text-textMuted">24 members online</span>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin text-xs">
                    {[
                      { user: "Admin", time: "2:30 PM", msg: "All teams — confirm readiness for second half kickoff protocols.", avatar: "A" },
                      { user: "Gate Control", time: "2:28 PM", msg: "Gate B queue has stabilized after redirect. Current wait: 4 min.", avatar: "G" },
                      { user: "Security Lead", time: "2:25 PM", msg: "Perimeter scan complete. All sectors green. VIP corridor secured.", avatar: "S" },
                      { user: "Medical", time: "2:22 PM", msg: "Heat advisory issued for Sections 6-8. Distributing additional water stations.", avatar: "M" },
                      { user: "AI System", time: "2:20 PM", msg: "⚡ Predictive alert: Concession surge expected in 12 minutes at North Stand food court.", avatar: "🤖" }
                    ].map((m, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">{m.avatar}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{m.user}</span>
                            <span className="text-[10px] text-textMuted font-mono">{m.time}</span>
                          </div>
                          <p className="text-textSecondary mt-1 leading-relaxed">{m.msg}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-borderSubtle">
                    <div className="flex gap-2">
                      <input type="text" placeholder="Type a message..." className="flex-1 bg-[#070B14] border border-borderSubtle rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary" />
                      <button className="bg-primary text-white px-4 rounded-xl text-xs font-bold">Send</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "signage" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 stagger-children">
                {[
                  { name: "Main Entrance LED", location: "Gate A", content: "Welcome to the Championship Final!", status: "Active", rotation: "15s" },
                  { name: "Concourse Display A", location: "North Stand", content: "Please use Gate C for faster entry", status: "Active", rotation: "10s" },
                  { name: "Scoreboard Auxiliary", location: "South End", content: "Bengal Tigers 2 — Mumbai Warriors 1", status: "Active", rotation: "Live" },
                  { name: "Parking Lot Display", location: "Lot A Entry", content: "Lot A: 82% Full | Use Lot B", status: "Active", rotation: "30s" },
                  { name: "Emergency Info Board", location: "All Zones", content: "Standard Operations — No Alerts", status: "Standby", rotation: "—" },
                  { name: "VIP Lounge Screen", location: "West Wing", content: "Premium hospitality menu available", status: "Active", rotation: "20s" }
                ].map((d, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl overflow-hidden shadow-md card-hover">
                    <div className="bg-[#070B14] border-b border-borderSubtle p-4 h-24 flex items-center justify-center relative">
                      <p className="text-xs font-mono font-bold text-primary text-center leading-relaxed px-2">{d.content}</p>
                      <div className="absolute top-2 right-2">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${d.status === "Active" ? "bg-success/20 text-success" : "bg-[#1E293B] text-textSecondary"}`}>{d.status}</span>
                      </div>
                    </div>
                    <div className="p-3 text-xs">
                      <h4 className="font-bold text-white">{d.name}</h4>
                      <div className="flex justify-between items-center mt-1.5 text-textSecondary">
                        <span>{d.location}</span>
                        <span className="font-mono text-[10px]">⟳ {d.rotation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentTab === "analytics" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: "Total Scans Today", value: "24,680", icon: "qr_code_scanner", color: "primary" },
                  { label: "Peak Hour", value: "2:00 PM", icon: "trending_up", color: "warning" },
                  { label: "Avg Dwell Time", value: "4h 12m", icon: "schedule", color: "secondary" },
                  { label: "Revenue Today", value: "₹18.4L", icon: "payments", color: "success" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">{s.label}</span>
                      <span className={`material-symbols-outlined text-${s.color} text-lg`}>{s.icon}</span>
                    </div>
                    <h4 className="text-2xl font-black text-white mt-2">{s.value}</h4>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-lg">
                  <h4 className="font-bold text-white text-sm mb-4">Scan Velocity Over Time</h4>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{ name: "10 AM", count: 120 }, { name: "11 AM", count: 480 }, { name: "12 PM", count: 1200 }, { name: "1 PM", count: 2400 }, { name: "2 PM", count: 3100 }, { name: "3 PM", count: 2800 }, { name: "4 PM", count: 1600 }]}>
                        <defs><linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(148, 163, 184, 0.12)", borderRadius: "12px" }} />
                        <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} fill="url(#scanGrad)" name="Scans" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-lg">
                  <h4 className="font-bold text-white text-sm mb-4">Revenue by Category</h4>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{ cat: "Tickets", amt: 12.4 }, { cat: "Food", amt: 3.2 }, { cat: "Merch", amt: 1.8 }, { cat: "Parking", amt: 1.0 }]}>
                        <XAxis dataKey="cat" stroke="#64748B" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(148, 163, 184, 0.12)", borderRadius: "12px" }} />
                        <Bar dataKey="amt" fill="#8B5CF6" name="₹ Lakhs" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "reports" && (
            <div className="space-y-6 entrance-anim">
              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    AI-Generated Reports
                  </h3>
                  <button className="bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span> Generate New Report
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  {[
                    { name: "Match Day Operations Summary", date: "Jul 9, 2026", type: "Daily Briefing", status: "Ready", size: "2.4 MB" },
                    { name: "Crowd Flow Analysis Report", date: "Jul 9, 2026", type: "AI Analysis", status: "Generating", size: "—" },
                    { name: "Security Incident Review", date: "Jul 8, 2026", type: "Security", status: "Ready", size: "1.8 MB" },
                    { name: "Fan Satisfaction Survey Results", date: "Jul 7, 2026", type: "Fan Insights", status: "Ready", size: "3.1 MB" },
                    { name: "Energy Consumption Weekly", date: "Jul 6, 2026", type: "Sustainability", status: "Ready", size: "0.9 MB" },
                    { name: "Staff Performance Metrics", date: "Jul 5, 2026", type: "Workforce", status: "Ready", size: "1.2 MB" }
                  ].map((r, idx) => (
                    <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-4 rounded-xl flex flex-wrap md:flex-nowrap justify-between items-center gap-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="material-symbols-outlined text-primary text-lg">article</span>
                        <div>
                          <h4 className="font-bold text-white">{r.name}</h4>
                          <span className="text-textSecondary mt-0.5 block">{r.date} • {r.type}</span>
                        </div>
                      </div>
                      <span className="text-textMuted font-mono text-[10px]">{r.size}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${r.status === "Ready" ? "bg-success/20 text-success" : "bg-primary/20 text-primary animate-pulse"}`}>{r.status}</span>
                      {r.status === "Ready" && (
                        <button className="bg-[#070B14] hover:bg-panelBg border border-borderSubtle text-textSecondary hover:text-white py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">download</span> PDF
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentTab === "pred-intel" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 stagger-children">
                {[
                  { label: "Peak Predicted", value: "7:30 PM", icon: "trending_up", color: "error", sub: "Zone 1 — 91% occupancy" },
                  { label: "AI Confidence", value: "94.7%", icon: "psychology", color: "secondary", sub: "Based on 12,000 data points" },
                  { label: "Intervention Window", value: "22 min", icon: "timer", color: "warning", sub: "Before critical threshold" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">{s.label}</span>
                      <span className={`material-symbols-outlined text-${s.color} text-lg`}>{s.icon}</span>
                    </div>
                    <h4 className={`text-2xl font-black text-${s.color} mt-2`}>{s.value}</h4>
                    <span className="text-[10px] text-textSecondary mt-1 block">{s.sub}</span>
                  </div>
                ))}
              </div>

              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4">Occupancy Forecast (Next 4 Hours)</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { time: "Now", actual: 48326, predicted: 48326 },
                      { time: "+30m", actual: null, predicted: 51200 },
                      { time: "+1h", actual: null, predicted: 54800 },
                      { time: "+1.5h", actual: null, predicted: 56400 },
                      { time: "+2h", actual: null, predicted: 54900 },
                      { time: "+3h", actual: null, predicted: 48000 },
                      { time: "+4h", actual: null, predicted: 32000 }
                    ]}>
                      <defs>
                        <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/><stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/></linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#64748B" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(148, 163, 184, 0.12)", borderRadius: "12px" }} />
                      <Area type="monotone" dataKey="predicted" stroke="#8B5CF6" strokeWidth={2} fill="url(#predGrad)" name="Predicted" strokeDasharray="5 5" />
                      <Area type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} fill="none" name="Actual" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {currentTab === "integrations" && (
            <div className="space-y-6 entrance-anim">
              <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">api</span>
                  Connected Systems & Integrations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                  {[
                    { name: "CCTV Network", provider: "HikVision API", status: "Connected", latency: "12ms", icon: "videocam" },
                    { name: "Ticketing Platform", provider: "BookMyShow Pro", status: "Connected", latency: "34ms", icon: "confirmation_number" },
                    { name: "Parking System", provider: "ParkSmart IoT", status: "Connected", latency: "8ms", icon: "local_parking" },
                    { name: "HVAC Controls", provider: "Honeywell BMS", status: "Connected", latency: "22ms", icon: "thermostat" },
                    { name: "Weather Service", provider: "OpenWeather API", status: "Connected", latency: "180ms", icon: "cloud" },
                    { name: "Payment Gateway", provider: "Razorpay", status: "Connected", latency: "45ms", icon: "payments" },
                    { name: "Push Notifications", provider: "Firebase FCM", status: "Connected", latency: "56ms", icon: "notifications" },
                    { name: "Emergency Services", provider: "NDRF Hotline", status: "Standby", latency: "—", icon: "emergency" },
                    { name: "Analytics Pipeline", provider: "Internal ETL", status: "Processing", latency: "—", icon: "analytics" }
                  ].map((i, idx) => (
                    <div key={idx} className="bg-[#0B1120] border border-borderSubtle rounded-xl p-4 card-hover text-xs">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">{i.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{i.name}</h4>
                          <span className="text-textSecondary text-[10px]">{i.provider}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${i.status === "Connected" ? "bg-success/20 text-success" : i.status === "Processing" ? "bg-primary/20 text-primary animate-pulse" : "bg-[#1E293B] text-textSecondary"}`}>{i.status}</span>
                        {i.latency !== "—" && <span className="text-[10px] font-mono text-textMuted">↕ {i.latency}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentTab === "sys-health" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                {[
                  { label: "System Uptime", value: "99.98%", icon: "uptime", color: "success", sub: "Last 30 days" },
                  { label: "API Latency", value: "8ms", icon: "speed", color: "primary", sub: "P95: 24ms" },
                  { label: "Active Sessions", value: "342", icon: "devices", color: "info", sub: "12 admin, 330 staff" },
                  { label: "DB Connections", value: "48/100", icon: "storage", color: "warning", sub: "48% utilization" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-cardBg border border-borderSubtle rounded-2xl p-4.5 shadow-md card-hover">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-textSecondary uppercase font-bold tracking-widest">{s.label}</span>
                      <span className={`material-symbols-outlined text-${s.color} text-lg`}>{s.icon}</span>
                    </div>
                    <h4 className="text-2xl font-black text-white mt-2">{s.value}</h4>
                    <span className="text-[10px] text-textSecondary mt-1 block">{s.sub}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4">Service Health</h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { service: "API Gateway", status: "Healthy", uptime: "99.99%", lastCheck: "2s ago" },
                      { service: "WebSocket Server", status: "Healthy", uptime: "99.97%", lastCheck: "1s ago" },
                      { service: "AI Inference Engine", status: "Healthy", uptime: "99.95%", lastCheck: "5s ago" },
                      { service: "Database (Primary)", status: "Healthy", uptime: "99.99%", lastCheck: "3s ago" },
                      { service: "Redis Cache", status: "Healthy", uptime: "99.98%", lastCheck: "1s ago" },
                      { service: "File Storage", status: "Healthy", uptime: "100%", lastCheck: "10s ago" }
                    ].map((s, idx) => (
                      <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-3.5 rounded-xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-success" />
                          <span className="font-bold text-white">{s.service}</span>
                        </div>
                        <span className="text-success font-mono">{s.uptime}</span>
                        <span className="text-textMuted font-mono text-[10px]">{s.lastCheck}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-5 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-4">Response Time (Last Hour)</h3>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[{ t: "0m", ms: 8 }, { t: "10m", ms: 12 }, { t: "20m", ms: 7 }, { t: "30m", ms: 24 }, { t: "40m", ms: 9 }, { t: "50m", ms: 11 }, { t: "60m", ms: 8 }]}>
                        <XAxis dataKey="t" stroke="#64748B" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(148, 163, 184, 0.12)", borderRadius: "12px" }} />
                        <Line type="monotone" dataKey="ms" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981" }} name="Latency (ms)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "settings" && (
            <div className="space-y-6 entrance-anim">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-3xl">account_circle</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{user?.username || "Admin"}</h3>
                      <p className="text-xs text-textSecondary">{user?.email || "admin@stadiumops.ai"}</p>
                      <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">{user?.roles?.[0] || "Super Admin"}</span>
                    </div>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="bg-[#0B1120] border border-borderSubtle p-3 rounded-xl flex justify-between items-center">
                      <span className="text-textSecondary">Session Status</span>
                      <span className="text-success font-bold">Active</span>
                    </div>
                    <div className="bg-[#0B1120] border border-borderSubtle p-3 rounded-xl flex justify-between items-center">
                      <span className="text-textSecondary">Last Login</span>
                      <span className="text-white font-mono">Today, {liveClock}</span>
                    </div>
                    <div className="bg-[#0B1120] border border-borderSubtle p-3 rounded-xl flex justify-between items-center">
                      <span className="text-textSecondary">2FA Status</span>
                      <span className="text-success font-bold">Enabled</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">notifications</span>
                      Notification Preferences
                    </h3>
                    <div className="space-y-3 text-xs">
                      {[
                        { label: "Critical Incidents", desc: "Immediate alerts for security and emergency events", enabled: true },
                        { label: "AI Decision Requests", desc: "When AI engine requires human approval", enabled: true },
                        { label: "Gate Queue Alerts", desc: "When queue times exceed threshold", enabled: true },
                        { label: "System Health Warnings", desc: "Service degradation and downtime alerts", enabled: false },
                        { label: "Daily Summary Reports", desc: "End-of-day operational digest", enabled: true }
                      ].map((n, idx) => (
                        <div key={idx} className="bg-[#0B1120] border border-borderSubtle p-4 rounded-xl flex justify-between items-center">
                          <div>
                            <h4 className="font-bold text-white">{n.label}</h4>
                            <p className="text-textSecondary mt-0.5">{n.desc}</p>
                          </div>
                          <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${n.enabled ? "bg-primary" : "bg-panelBg border border-borderSubtle"}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${n.enabled ? "right-0.5" : "left-0.5"}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-cardBg border border-borderSubtle rounded-2xl p-6 shadow-xl">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-error text-sm">security</span>
                      Security & Access
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <button className="bg-[#0B1120] hover:bg-panelBg border border-borderSubtle text-white py-2.5 px-4 rounded-xl transition-colors font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">key</span> Change Password
                      </button>
                      <button className="bg-[#0B1120] hover:bg-panelBg border border-borderSubtle text-white py-2.5 px-4 rounded-xl transition-colors font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">devices</span> Manage Sessions
                      </button>
                      <button className="bg-[#0B1120] hover:bg-panelBg border border-borderSubtle text-white py-2.5 px-4 rounded-xl transition-colors font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">download</span> Export Data
                      </button>
                      <button onClick={handleLogout} className="bg-error/10 hover:bg-error/20 border border-error/20 text-error py-2.5 px-4 rounded-xl transition-colors font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">logout</span> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


        </main>
      </div>

      {/* ----------------- GLOBAL AI COPILOT FLOATING DRAWER PANEL ----------------- */}
      <aside className={`absolute right-0 top-0 h-full w-80 bg-[#0B1120]/95 backdrop-blur-2xl border-l border-borderSubtle shadow-2xl flex flex-col p-6 z-50 transition-all duration-300 transform ${
        copilotOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-secondary/15 border border-secondary/35 flex items-center justify-center shadow-lg orb-breath shrink-0">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-tight leading-none">StadiumOps Copilot</h2>
              <p className="text-[9px] text-secondary mt-1.5 uppercase font-bold tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span>Predictive Intelligence Active</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setCopilotOpen(false)}
            className="w-8 h-8 rounded-lg bg-[#070B14] border border-borderSubtle flex items-center justify-center text-textSecondary hover:text-white hover:bg-panelBg transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        <div className="flex gap-1.5 mb-5 bg-[#070B14] p-1 border border-borderSubtle rounded-xl">
          {(["suggest", "history", "insights"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCopilotTab(tab)}
              className={`flex-1 py-1.5 text-center rounded-lg font-bold transition-all text-[9px] flex items-center justify-center gap-1 uppercase tracking-wider ${
                copilotTab === tab 
                  ? "bg-secondary text-white shadow-sm" 
                  : "text-textSecondary hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {tab === "suggest" ? "lightbulb" : (tab === "history" ? "history" : "auto_awesome")}
              </span>
              <span>{tab}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin flex flex-col gap-4 text-xs font-sans">
          {copilotTab === "suggest" && (
            <>
              <span className="text-[9px] font-bold text-textMuted uppercase tracking-widest block">Live predictions alert board</span>
              
              <div className="bg-cardBg border border-borderSubtle rounded-xl p-4.5 space-y-2 relative overflow-hidden group">
                <div className="absolute left-0 top-0 h-full w-1 bg-error" />
                <div className="flex justify-between items-start">
                  <p className="font-bold text-white">Gate B queue congestion risk</p>
                  <span className="material-symbols-outlined text-error text-lg">warning</span>
                </div>
                <p className="text-textSecondary leading-normal text-[11px]">
                  Inflow rate is exceeding predicted capacity by 15%. Wait times are likely to reach 12 mins within 10 minutes.
                </p>
                <button 
                  onClick={() => handleCopilotSend(undefined, "Why is Gate B congested?")}
                  className="bg-primary/20 text-primary text-[10px] font-bold py-1 px-3.5 rounded-lg border border-primary/25 hover:bg-primary/30 transition-colors mt-2"
                >
                  Investigate
                </button>
              </div>

              <div className="bg-cardBg border border-borderSubtle rounded-xl p-4.5 space-y-2 relative overflow-hidden group">
                <div className="absolute left-0 top-0 h-full w-1 bg-secondary" />
                <div className="flex justify-between items-start">
                  <p className="font-bold text-white">Food Court Zone 4 surge</p>
                  <span className="material-symbols-outlined text-secondary text-lg">fastfood</span>
                </div>
                <p className="text-textSecondary leading-normal text-[11px]">
                  Peak demand surges detected during half-time approach. Suggest routing mobile vendor squads.
                </p>
              </div>
            </>
          )}

          {copilotTab === "history" && (
            <div className="space-y-3">
              {copilotChat.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 leading-relaxed whitespace-pre-line ${
                    chat.sender === "user" 
                      ? "bg-primary text-white rounded-tr-none shadow-sm" 
                      : "bg-[#070B14] border border-borderSubtle text-textSecondary rounded-tl-none"
                  }`}>
                    {chat.text}
                  </div>
                </div>
              ))}
              {copilotLoading && <div className="text-xs text-textMuted animate-pulse">Analyzing telemetry log signals...</div>}
            </div>
          )}

          {copilotTab === "insights" && (
            <div className="space-y-3 leading-relaxed text-textSecondary text-[11px]">
              <h4 className="font-bold text-white">AI Venue Optimization Analysis</h4>
              <p>
                Pre-match setup observations indicate queue wait times average under 4.5 minutes. Diverting 15% inflow to Lot A overflow during peak surge mitigates gate bottlenecks by up to 20%.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-borderSubtle">
          <form onSubmit={e => handleCopilotSend(e)} className="relative">
            <input 
              type="text" 
              placeholder="Ask anything..."
              value={copilotMessage}
              onChange={e => setCopilotMessage(e.target.value)}
              className="w-full bg-[#070B14] border border-borderSubtle rounded-xl py-3 pl-4 pr-10 text-xs text-white focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary/20"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-secondary hover:bg-secondary/15 rounded-full transition-colors">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ----------------- GLOBAL COMMAND PALETTE MODAL ----------------- */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 backdrop-entrance" onClick={() => { setCommandPaletteOpen(false); setCommandPaletteSearch(""); }}>
          <div className="w-full max-w-lg bg-cardBg border border-borderSubtle rounded-2xl shadow-2xl overflow-hidden modal-entrance" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-borderSubtle bg-secBg flex items-center gap-3">
              <span className="material-symbols-outlined text-textSecondary">search</span>
              <input 
                type="text" 
                placeholder="Search commands, zones, incidents..." 
                className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                autoFocus
                value={commandPaletteSearch}
                onChange={e => setCommandPaletteSearch(e.target.value)}
              />
              <button onClick={() => { setCommandPaletteOpen(false); setCommandPaletteSearch(""); }} className="text-textSecondary hover:text-white text-xs">ESC</button>
            </div>
            
            <div className="p-4 space-y-2 text-xs max-h-[420px] overflow-y-auto scrollbar-thin">
              <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest block mb-2">System Commands</span>
              {[
                { cmd: "Open Incident Dispatch Form", icon: "warning", action: () => { setCurrentTab("incidents"); setCommandPaletteOpen(false); setCommandPaletteSearch(""); } },
                { cmd: "Launch Live Demo Sequencer", icon: "play_circle", action: () => { handleSimAction("demo"); setCommandPaletteOpen(false); setCommandPaletteSearch(""); } },
                { cmd: "Open Spatial Digital Twin", icon: "map", action: () => { setCurrentTab("digital-twin"); setCommandPaletteOpen(false); setCommandPaletteSearch(""); } },
                { cmd: "Log Lost/Found Item Report", icon: "search", action: () => { setCurrentTab("lost-found"); setCommandPaletteOpen(false); setCommandPaletteSearch(""); } },
                { cmd: "Trigger Emergency SOS Modal", icon: "emergency", action: () => { setEmergencyModalOpen(true); setCommandPaletteOpen(false); setCommandPaletteSearch(""); } }
              ].filter(c => c.cmd.toLowerCase().includes(commandPaletteSearch.toLowerCase())).map((c, idx) => (
                <button 
                  key={idx}
                  onClick={c.action}
                  className="w-full text-left p-2.5 bg-[#070B14] hover:bg-panelBg rounded-xl border border-borderSubtle text-textSecondary hover:text-white transition-colors flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-sm text-primary">{c.icon}</span>
                  {c.cmd}
                </button>
              ))}

              {commandPaletteSearch && (
                <>
                  <span className="text-[10px] font-bold text-textMuted uppercase tracking-widest block mt-4 mb-2">Navigation</span>
                  {sidebarItems.filter(item => item.label.toLowerCase().includes(commandPaletteSearch.toLowerCase())).slice(0, 8).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setCurrentTab(item.id); setCommandPaletteOpen(false); setCommandPaletteSearch(""); }}
                      className="w-full text-left p-2.5 bg-[#070B14] hover:bg-panelBg rounded-xl border border-borderSubtle text-textSecondary hover:text-white transition-colors flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-sm text-textMuted">{item.icon}</span>
                      <span>{item.label}</span>
                      <span className="ml-auto text-[9px] text-textMuted font-mono">Navigate →</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- EMERGENCY TRIGGER VERIFICATION MODAL ----------------- */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-cardBg border border-error/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-borderSubtle pb-3">
              <span className="material-symbols-outlined text-error text-2xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Tactical Emergency SOS Dispatch</h3>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed">
              Verify you wish to trigger high-priority code-red warnings. SOS dispatch logs will be appended to compliance registers.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button onClick={() => handleEmergencyTrigger("Medical Alarm")} className="bg-error hover:bg-error/95 text-white font-bold py-2 rounded-xl text-xs transition-colors">Medical Alarm</button>
              <button onClick={() => handleEmergencyTrigger("Fire Event")} className="bg-error hover:bg-error/95 text-white font-bold py-2 rounded-xl text-xs transition-colors">Fire Event</button>
            </div>
            <div className="flex justify-end pt-3 border-t border-borderSubtle">
              <button onClick={() => setEmergencyModalOpen(false)} className="bg-[#0B1120] hover:bg-panelBg border border-borderSubtle text-textSecondary hover:text-white py-2 px-4 rounded-xl text-xs transition-colors">Cancel SOS</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
