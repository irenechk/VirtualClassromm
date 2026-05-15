import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import TeacherApp from "./pages/TeacherApp";
import StudentApp from "./pages/StudentApp";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("itm-theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export default function AppRouter() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("itm-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <BrowserRouter>
      <div className="app">
        <div className="bg-classroom">
          <div className="bg-float bf-1" />
          <div className="bg-float bf-2" />
          <div className="bg-float bf-3" />
        </div>
        <div className="deco-icons">
          {["📚","✏️","🎓","📐","🔬","📖","🖊️","📝","🔭","💡","🎨","📏"].map((icon, i) => (
            <span key={i} className="deco-icon" style={{
              top: `${8 + (i * 7.5) % 85}%`,
              left: `${3 + (i * 8.1) % 92}%`,
              "--dur": `${6 + (i % 5)}s`,
              animationDelay: `${i * 0.4}s`,
            }}>{icon}</span>
          ))}
        </div>
        <div className="noise-overlay" />
        <Navbar user={user} setUser={setUser} theme={theme} onToggleTheme={toggleTheme} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/app" element={
            !user ? <Navigate to="/login" /> :
            user.role === "teacher" ? <TeacherApp user={user} /> : <StudentApp user={user} />
          } />
        </Routes>
        {/* Luxury Multi-Column Connected Footer */}
        <footer className="relative border-t border-white/10 bg-white/[0.01] pt-16 pb-12 overflow-hidden mt-auto">
          {/* Subtle Glow divider line on top */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#00f2ff]/50 to-transparent blur-[1px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/5">
              {/* Brand Column */}
              <div className="md:col-span-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00f2ff] to-[#7000ff] flex items-center justify-center text-base shadow-md">
                    🎓
                  </div>
                  <span className="font-extrabold text-lg tracking-tight text-white font-display">
                    ITM <span className="text-gradient">Classroom</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  The ultimate spatial OS for real-time education. Engineered with advanced state synchronization, AI Copilots, and premium cinematic layouts.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  {["𝕏", "𝔾", "𝕃", "𝔻"].map((soc, i) => (
                    <span key={i} className="w-8 h-8 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                      {soc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Links Column 1: Platform */}
              <div className="md:col-span-2 flex flex-col gap-3">
                <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">Platform</span>
                {["AI Copilot", "Live Simulator", "Smart Roster", "Focus Pod", "Telemetry"].map((item, i) => (
                  <span key={i} className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                    {item}
                  </span>
                ))}
              </div>

              {/* Links Column 2: Resources */}
              <div className="md:col-span-2 flex flex-col gap-3">
                <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">Resources</span>
                {["Documentation", "API References", "Status SLA", "Educator Pack", "Community"].map((item, i) => (
                  <span key={i} className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                    {item}
                  </span>
                ))}
              </div>

              {/* Links Column 3: Company */}
              <div className="md:col-span-2 flex flex-col gap-3">
                <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">Company</span>
                {["About Studio", "Careers", "Press Kit", "Security", "Contact Hub"].map((item, i) => (
                  <span key={i} className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer">
                    {item}
                  </span>
                ))}
              </div>

              {/* Status column */}
              <div className="md:col-span-2 flex flex-col gap-3 items-start md:items-end text-left md:text-right">
                <span className="text-xs font-bold text-white tracking-wider uppercase font-mono">Telemetry</span>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[0.65rem] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Fully Operational
                </div>
                <span className="text-[0.65rem] text-slate-500 mt-2 block font-mono">Latency: 12ms</span>
              </div>
            </div>

            {/* Bottom Copyright Row */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
              <span>© 2026 ITM Classroom. Award-winning spatial education OS.</span>
              <div className="flex gap-4">
                <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
                <span className="hover:text-slate-400 cursor-pointer transition-colors">Telemetry Hub</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}