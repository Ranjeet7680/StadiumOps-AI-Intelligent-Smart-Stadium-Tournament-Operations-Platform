import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";

interface LoginProps {
  setToken: (token: string | null) => void;
  setUser: (user: any) => void;
}

export default function Login({ setToken, setUser }: LoginProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register" | "forgot" | "verify">("login");

  // Form fields
  const [email, setEmail] = useState("admin@stadiumops.ai");
  const [password, setPassword] = useState("stadium123");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [selectedRole, setSelectedRole] = useState("Operations Manager");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem("token", res.access_token);
      setToken(res.access_token);
      setUser({
        id: 0,
        username: res.username,
        email: res.email,
        roles: res.roles,
      });
      // Navigate to onboarding or command-center
      navigate("/onboarding");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate keys.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Console keys do not match.");
      return;
    }
    setLoading(true);
    // Simulate register
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Account registered. Multi-factor code dispatched.");
      setMode("verify");
    }, 1200);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Simulate forgot
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Verification reset key sent to registered terminal.");
    }, 1200);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (verificationCode.length < 6) {
      setError("Security token must be 6 digits.");
      return;
    }
    setLoading(false);
    setSuccessMsg("Console code verified. Access granted.");
    // Auto login
    setTimeout(() => {
      // Mock login token setting
      localStorage.setItem("token", "mock_token_success");
      setToken("mock_token_success");
      setUser({
        id: 1,
        username: username || "Operator",
        email: email,
        roles: [selectedRole],
      });
      navigate("/onboarding");
    }, 1000);
  };

  const demoRoles = [
    { label: "Super Admin", email: "admin@stadiumops.ai" },
    { label: "Stadium Manager", email: "manager@stadiumops.ai" },
    { label: "Security Commander", email: "security@stadiumops.ai" },
    { label: "Operations Staff", email: "staff@stadiumops.ai" },
  ];

  const handleQuickSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("stadium123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#060A12] text-[#F8FAFC] font-sans flex overflow-hidden">
      {/* LEFT PANEL: ANIMATION & BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1220] border-r border-[#94A3B8]/14 relative flex-col justify-between p-12 overflow-hidden">
        {/* Grids and blobs */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(#4F8CFF 1px, transparent 0)", backgroundSize: "30px 30px" }} />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#4F8CFF]/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/5 blur-[120px]" />

        {/* Header */}
        <div className="flex items-center gap-3 relative z-10">
          <Link to="/" className="w-10 h-10 rounded-xl bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-[#4F8CFF]">stadium</span>
          </Link>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white">StadiumOps AI</h1>
            <span className="text-[9px] text-[#4F8CFF] font-bold tracking-widest uppercase block">INTELLIGENT OPERATING SYSTEM</span>
          </div>
        </div>

        {/* Center Graphic */}
        <div className="relative flex-1 flex flex-col justify-center items-center py-12 z-10">
          <div className="w-80 h-80 rounded-full border border-[#4F8CFF]/10 flex items-center justify-center animate-spin" style={{ animationDuration: "60s" }}>
            <div className="w-72 h-72 rounded-full border border-dashed border-[#8B5CF6]/20 flex items-center justify-center">
              <div className="w-56 h-56 rounded-full border border-[#22D3EE]/10 flex items-center justify-center relative">
                {/* Simulated Core */}
                <div className="w-24 h-24 rounded-full bg-[#060A12] border border-[#4F8CFF]/30 flex flex-col items-center justify-center shadow-lg relative">
                  <span className="material-symbols-outlined text-3xl text-[#4F8CFF] animate-pulse">lock</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center max-w-sm space-y-3">
            <h2 className="text-xl font-black text-white">Secure Command Tunnel</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Verify credentials, establish end-to-end telemetry encryption, and synchronize with the local venue database server.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-[#94A3B8] relative z-10">
          <span>&copy; StadiumOps AI Operations. All rights reserved.</span>
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            TUNNEL VERIFIED
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: SECURE FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Floating circles on mobile */}
        <div className="absolute top-10 right-10 w-48 h-48 bg-[#4F8CFF]/5 rounded-full blur-[80px] lg:hidden" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#8B5CF6]/5 rounded-full blur-[80px] lg:hidden" />

        <div className="w-full max-w-md bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-8 shadow-2xl relative z-10 space-y-6">
          
          {/* Header titles */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {mode === "login" && "Establish Command Link"}
              {mode === "register" && "Deploy Terminal Node"}
              {mode === "forgot" && "Reset Terminal Key"}
              {mode === "verify" && "Verify Secure Token"}
            </h2>
            <p className="text-[11px] text-[#94A3B8] uppercase font-bold tracking-widest">
              {mode === "login" && "Tactical Authorization"}
              {mode === "register" && "Create Operations Identity"}
              {mode === "forgot" && "Verify Security Node"}
              {mode === "verify" && "Secure Session Tokens"}
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] text-xs rounded-xl p-3.5 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sm shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-[#22C55E]/10 border border-[#22C55E]/25 text-[#22C55E] text-xs rounded-xl p-3.5 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1.5">Security Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block">Console Key</label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[10px] text-[#4F8CFF] hover:underline"
                  >
                    Forgot Key?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="accent-[#4F8CFF]" defaultChecked />
                  <span>Remember Device</span>
                </label>
                <span className="flex items-center gap-1 text-[#22D3EE] font-bold">
                  <span className="material-symbols-outlined text-[12px]">vpn_key</span>
                  AES-256 Enabled
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white font-bold rounded-xl py-3.5 mt-2 transition-all shadow-md shadow-[#4F8CFF]/20 flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating Node..." : "Establish Command Link"}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-[#94A3B8]">
                  Need a secure terminal account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-[#4F8CFF] hover:underline font-bold"
                  >
                    Deploy Node
                  </button>
                </p>
              </div>

              {/* Quick login list */}
              <div className="border-t border-[#94A3B8]/14 pt-4 space-y-2.5">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block">Authorized Demo Nodes</span>
                <div className="grid grid-cols-2 gap-2">
                  {demoRoles.map((role, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickSelect(role.email)}
                      className={`border text-[10px] rounded-xl py-2 px-3 transition-colors text-left font-semibold ${
                        email === role.email
                          ? "bg-[#4F8CFF]/10 border-[#4F8CFF] text-[#4F8CFF]"
                          : "bg-[#111B2E] border-[#94A3B8]/10 text-white hover:border-[#94A3B8]/20"
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1.5">User Identity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Officer Ranjeet"
                  className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1.5">Security Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1.5">Assigned Operational Role</label>
                <select
                  className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option>Super Admin</option>
                  <option>Venue Director</option>
                  <option>Operations Manager</option>
                  <option>Security Commander</option>
                  <option>Tournament Manager</option>
                  <option>Medical Lead</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1.5">Console Key</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1.5">Verify Key</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white font-bold rounded-xl py-3.5 mt-2 transition-all shadow-md shadow-[#4F8CFF]/20 flex items-center justify-center gap-2"
              >
                {loading ? "Spawning Node..." : "Deploy Terminal Node"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-xs text-[#4F8CFF] hover:underline"
                >
                  Back to Command Tunnel
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Provide your security terminal email. We will broadcast a cryptography reset token to your security system.
              </p>

              <div>
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1.5">Registered Email</label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF] transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white font-bold rounded-xl py-3.5 transition-all shadow-md shadow-[#4F8CFF]/20 flex items-center justify-center gap-2"
              >
                {loading ? "Broadcasting Token..." : "Dispatch Cryptography Key"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-xs text-[#4F8CFF] hover:underline"
                >
                  Back to Command Tunnel
                </button>
              </div>
            </form>
          )}

          {/* VERIFY CODE FORM */}
          {mode === "verify" && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <p className="text-xs text-[#94A3B8] leading-relaxed text-center">
                Check your terminal logs. Enter the 6-digit session validation code.
              </p>

              <div>
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1.5 text-center">Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 768042"
                  className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-3 px-4 text-center tracking-widest text-base text-white focus:outline-none focus:border-[#4F8CFF] transition-colors font-mono"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#22C55E] hover:bg-[#22C55E]/90 text-white font-bold rounded-xl py-3.5 transition-all shadow-md shadow-[#22C55E]/20 flex items-center justify-center gap-2"
              >
                Verify Terminal Token
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-xs text-[#4F8CFF] hover:underline"
                >
                  Cancel Connection
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
