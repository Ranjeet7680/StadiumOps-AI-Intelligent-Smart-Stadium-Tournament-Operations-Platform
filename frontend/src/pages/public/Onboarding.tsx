import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [orgName, setOrgName] = useState("National Cricket Association");
  const [orgType, setOrgType] = useState("League Operator");
  const [venueName, setVenueName] = useState("Emirates Stadium");
  const [venueCapacity, setVenueCapacity] = useState(60000);
  const [venueLocation, setVenueLocation] = useState("London");
  const [zonesCount, setZonesCount] = useState(8);
  const [gatesCount, setGatesCount] = useState(6);
  const [activeTournament, setActiveTournament] = useState("India Championship Final");
  const [sportType, setSportType] = useState("Cricket");
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(["cctv", "ticketing", "parking"]);
  const [invitesEmails, setInvitesEmails] = useState("");
  const [aiAutonomyLevel, setAiAutonomyLevel] = useState("Medium");
  const [aiMfaRequirement, setAiMfaRequirement] = useState(true);

  // Load from localStorage if present
  useEffect(() => {
    const savedStep = localStorage.getItem("onboarding_step");
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
  }, []);

  const saveAndProceed = (nextStep: number) => {
    localStorage.setItem("onboarding_step", String(nextStep));
    setCurrentStep(nextStep);
  };

  const handleNext = () => {
    if (currentStep < 8) {
      saveAndProceed(currentStep + 1);
    } else {
      // Done - launch command center
      localStorage.removeItem("onboarding_step");
      navigate("/app/command-center");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      saveAndProceed(currentStep - 1);
    }
  };

  const handleToggleIntegration = (id: string) => {
    setSelectedIntegrations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const stepsList = [
    "Organization Profile",
    "Venue Information",
    "Stadium Zones",
    "Tournament Setup",
    "Data Integrations",
    "Team Invitations",
    "AI Permissions",
    "Launch Shell",
  ];

  return (
    <div className="min-h-screen bg-[#060A12] text-[#F8FAFC] font-sans flex flex-col justify-between p-6">
      {/* TOP HEADER */}
      <header className="flex justify-between items-center max-w-4xl mx-auto w-full border-b border-[#94A3B8]/14 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-base text-[#4F8CFF]">stadium</span>
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">StadiumOps AI</span>
        </div>
        <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest bg-[#111B2E] border border-[#94A3B8]/14 py-1 px-3 rounded-full">
          Step {currentStep} of 8: {stepsList[currentStep - 1]}
        </div>
      </header>

      {/* CENTER WORKSPACE */}
      <main className="flex-1 flex items-center justify-center max-w-4xl mx-auto w-full my-6">
        <div className="w-full bg-[#0B1220] border border-[#94A3B8]/14 rounded-2xl p-8 shadow-2xl relative grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* STEPPER PROGRESS INDEX */}
          <div className="md:col-span-4 border-r border-[#94A3B8]/10 pr-6 space-y-3.5 hidden md:block">
            <span className="text-[10px] font-bold text-[#4F8CFF] uppercase tracking-widest block mb-4">Command Map</span>
            {stepsList.map((stepName, idx) => {
              const num = idx + 1;
              const isActive = num === currentStep;
              const isPast = num < currentStep;
              return (
                <div key={num} className="flex items-center gap-3 text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold font-mono transition-all border shrink-0 ${
                    isActive 
                      ? "bg-[#4F8CFF] border-[#4F8CFF] text-[#060A12]"
                      : isPast 
                      ? "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]"
                      : "bg-[#111B2E] border-[#94A3B8]/10 text-[#94A3B8]"
                  }`}>
                    {isPast ? <span className="material-symbols-outlined text-xs">check</span> : num}
                  </div>
                  <span className={`font-semibold truncate ${isActive ? "text-white" : "text-[#94A3B8]"}`}>
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* STEP FORM WRAPPERS */}
          <div className="md:col-span-8 space-y-6">
            {/* STEP 1: ORGANIZATION PROFILE */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-white">Create Organization Profile</h2>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-normal">Provide company credentials and administrative structure details.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1">Organization Name</label>
                    <input
                      type="text"
                      className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF]"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1">Organization Type</label>
                    <select
                      className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF]"
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                    >
                      <option>League Operator</option>
                      <option>Stadium Owner</option>
                      <option>Security Contractor</option>
                      <option>Municipal Agency</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: VENUE INFORMATION */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-white">Venue Configuration</h2>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-normal">Configure the primary digital twin stadium bounds.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1">Venue Name</label>
                    <input
                      type="text"
                      className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF]"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1">Capacity Bounds</label>
                      <input
                        type="number"
                        className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF]"
                        value={venueCapacity}
                        onChange={(e) => setVenueCapacity(parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1">Geographic Location</label>
                      <input
                        type="text"
                        className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF]"
                        value={venueLocation}
                        onChange={(e) => setVenueLocation(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: STADIUM ZONES */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-white">Define Stadium Sector Zones</h2>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-normal">Split the venue space into distinct crowd tracking sectors.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111B2E] border border-[#94A3B8]/10 rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-[#4F8CFF] text-2xl">grid_view</span>
                    <span className="text-[9px] font-bold text-[#94A3B8] uppercase block mt-2">Telemetry Zones</span>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <button onClick={() => setZonesCount(Math.max(1, zonesCount - 1))} className="text-[#4F8CFF] font-bold text-lg">-</button>
                      <span className="font-mono font-bold text-white text-base">{zonesCount}</span>
                      <button onClick={() => setZonesCount(zonesCount + 1)} className="text-[#4F8CFF] font-bold text-lg">+</button>
                    </div>
                  </div>

                  <div className="bg-[#111B2E] border border-[#94A3B8]/10 rounded-xl p-4 text-center">
                    <span className="material-symbols-outlined text-[#22D3EE] text-2xl">door_sliding</span>
                    <span className="text-[9px] font-bold text-[#94A3B8] uppercase block mt-2">Turnstile Entry Gates</span>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <button onClick={() => setGatesCount(Math.max(1, gatesCount - 1))} className="text-[#22D3EE] font-bold text-lg">-</button>
                      <span className="font-mono font-bold text-white text-base">{gatesCount}</span>
                      <button onClick={() => setGatesCount(gatesCount + 1)} className="text-[#22D3EE] font-bold text-lg">+</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: TOURNAMENT SETUP */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-white">Tournament & Match Control Setup</h2>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-normal">Import initial fixtures or event brackets information.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1">Active Event Name</label>
                    <input
                      type="text"
                      className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF]"
                      value={activeTournament}
                      onChange={(e) => setActiveTournament(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1">Sport Type</label>
                    <select
                      className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF]"
                      value={sportType}
                      onChange={(e) => setSportType(e.target.value)}
                    >
                      <option>Cricket</option>
                      <option>Soccer</option>
                      <option>Athletics</option>
                      <option>Basketball</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: DATA INTEGRATIONS */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-white">System Data Integrations</h2>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-normal">Synchronize with local hardware APIs and cameras.</p>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  {[
                    { id: "cctv", label: "CCTV Camera Grid", icon: "videocam" },
                    { id: "ticketing", label: "Scanner API Link", icon: "confirmation_number" },
                    { id: "parking", label: "Parking Sensors", icon: "local_parking" },
                    { id: "hvac", label: "HVAC & Energy API", icon: "bolt" },
                  ].map((integ) => {
                    const isSelected = selectedIntegrations.includes(integ.id);
                    return (
                      <button
                        key={integ.id}
                        type="button"
                        onClick={() => handleToggleIntegration(integ.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-bold transition-all text-left ${
                          isSelected
                            ? "bg-[#4F8CFF]/10 border-[#4F8CFF] text-white"
                            : "bg-[#111B2E] border-[#94A3B8]/10 text-[#94A3B8] hover:border-[#94A3B8]/20"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{integ.icon}</span>
                        <span>{integ.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 6: TEAM INVITATIONS */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-white">Invite Team & Operations Staff</h2>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-normal">Deploy verification keys to responders or volunteer leaders.</p>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1">Terminal Invites (Comma Separated)</label>
                  <textarea
                    rows={4}
                    placeholder="email1@stadiumops.ai, email2@stadiumops.ai"
                    className="w-full bg-[#060A12] border border-[#94A3B8]/14 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-[#4F8CFF]"
                    value={invitesEmails}
                    onChange={(e) => setInvitesEmails(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* STEP 7: AI PERMISSIONS */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-black text-white">AI Agent Autonomy Thresholds</h2>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-normal">Establish permission envelopes for automated signage and queue redirection.</p>
                </div>
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest block mb-1.5">Autonomy Level</label>
                    <div className="flex gap-2">
                      {["Low", "Medium", "High"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setAiAutonomyLevel(level)}
                          className={`flex-1 border text-xs font-bold py-2 rounded-xl transition-all ${
                            aiAutonomyLevel === level
                              ? "bg-[#8B5CF6]/15 border-[#8B5CF6] text-[#8B5CF6]"
                              : "bg-[#111B2E] border-[#94A3B8]/10 text-white hover:border-[#94A3B8]/20"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer select-none bg-[#111B2E] p-3.5 border border-[#94A3B8]/10 rounded-xl">
                    <input
                      type="checkbox"
                      className="accent-[#8B5CF6]"
                      checked={aiMfaRequirement}
                      onChange={(e) => setAiMfaRequirement(e.target.checked)}
                    />
                    <div className="text-xs">
                      <span className="font-bold text-white block">Require SOS Multi-Factor Auth</span>
                      <span className="text-[10px] text-[#94A3B8] block mt-0.5">Prompt for secondary key validation for SOS overrides.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 8: LAUNCH COMMAND CENTER */}
            {currentStep === 8 && (
              <div className="space-y-4 text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <span className="material-symbols-outlined text-4xl animate-pulse">rocket_launch</span>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-white">System Configured Successfully</h2>
                  <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
                    Digital twin meshes are constructed. Real-time uvicorn socket pipes are online. You are ready to open the tactical command console.
                  </p>
                </div>

                <div className="bg-[#111B2E] border border-[#94A3B8]/10 rounded-xl p-4 text-left max-w-md mx-auto text-[10px] font-mono space-y-1 text-[#94A3B8]">
                  <div><span className="text-white">Organization:</span> {orgName}</div>
                  <div><span className="text-white">Venue Node:</span> {venueName} ({venueCapacity} Capacity)</div>
                  <div><span className="text-white">Zones Map:</span> {zonesCount} active sectors</div>
                  <div><span className="text-white">Integrations:</span> {selectedIntegrations.join(", ") || "None"}</div>
                  <div><span className="text-white">AI Autonomy:</span> Level {aiAutonomyLevel} (MFA {aiMfaRequirement ? "Yes" : "No"})</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* BOTTOM ACTION BAR */}
      <footer className="max-w-4xl mx-auto w-full flex justify-between items-center border-t border-[#94A3B8]/14 pt-4 mt-6">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 text-xs font-bold border border-[#94A3B8]/14 px-5 py-2.5 rounded-xl transition-all ${
            currentStep === 1 
              ? "opacity-50 cursor-not-allowed text-[#94A3B8]" 
              : "hover:bg-[#111B2E] text-white"
          }`}
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 bg-[#4F8CFF] hover:bg-[#4F8CFF]/90 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-[#4F8CFF]/20"
        >
          <span>{currentStep === 8 ? "Launch Command Console" : "Next Step"}</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
}
