import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "../components/Icons";

const DEMO_USERS = [
  { id: "t1", name: "Dr. Priya Sharma", role: "teacher", email: "priya@itm.edu", password: "teacher123", subject: "Mathematics", avatar: "PS" },
  { id: "t2", name: "Prof. Arjun Mehta", role: "teacher", email: "arjun@itm.edu", password: "teacher123", subject: "Physics", avatar: "AM" },
  { id: "s1", name: "Riya Patel", role: "student", email: "riya@student.edu", password: "student123", grade: "10-A", avatar: "RP" },
  { id: "s2", name: "Aarav Singh", role: "student", email: "aarav@student.edu", password: "student123", grade: "10-A", avatar: "AS" },
  { id: "s3", name: "Kavya Nair", role: "student", email: "kavya@student.edu", password: "student123", grade: "10-B", avatar: "KN" },
];

export default function Login({ setUser }) {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 700));

    if (isNew) {
      // Register new user
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
      const initials = name
        .trim()
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const newUser = {
        id: `new_${Date.now()}`,
        name: name.trim(),
        role,
        email,
        password,
        grade: role === "student" ? "11-A" : undefined,
        subject: role === "teacher" ? "General" : undefined,
        avatar: initials || "U",
      };
      setUser(newUser);
      navigate("/app");
    } else {
      const found = DEMO_USERS.find(
        (u) => u.email === email && u.password === password && u.role === role
      );
      if (found) {
        setUser(found);
        navigate("/app");
      } else {
        setError("Invalid credentials. Please click a demo account below or register.");
      }
    }
    setLoading(false);
  };

  const demoLogin = (u) => {
    setEmail(u.email);
    setPassword(u.password);
    setRole(u.role);
    setIsNew(false);
    setError("");
  };

  return (
    <main className="min-h-[calc(100vh-96px)] flex items-center justify-center py-12 px-4 sm:px-8 relative overflow-hidden">
      {/* Cinematic grid overlay and glowing aura behind auth container */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-blue-600/10 via-purple-600/10 to-pink-600/5 rounded-full blur-3xl pointer-events-none -z-10 animate-spin-slow" />

      {/* Floating particles background mimicking interactive code lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse"
            style={{
              top: `${(i * 13) % 100}%`,
              left: `${(i * 17) % 100}%`,
              animationDuration: `${3 + (i % 5)}s`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl rounded-3xl bg-[#0c0c14]/90 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
      >
        {/* Left Interactive / Cinematic Identity sidebar */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono tracking-wider text-indigo-400 mb-6">
              <Sparkles size={12} /> Secure Auth
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight mb-3">
              {isNew ? "Begin Your Infinite Class" : "Enter Platform Studio"}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {isNew
                ? "Provision an account with automatic state syncing, dynamic focus pods, and AI-assisted curriculum alignment."
                : "Resume active connection sessions. Access real-time analytics, synchronous messaging channels, and assignments."}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                ⚡
              </div>
              <div>
                <span className="block text-xs font-bold text-white">ITM Authentication Gate</span>
                <span className="text-[0.65rem] text-slate-500 font-mono">TLS 1.3 Encryption active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Container */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          {/* Top segment switcher: Sign In vs Register */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mb-8 max-w-xs mx-auto w-full">
            <button
              type="button"
              onClick={() => {
                setIsNew(false);
                setError("");
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                !isNew
                  ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white border border-white/10 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsNew(true);
                setError("");
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                isNew
                  ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white border border-white/10 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* Target Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                role === "student"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-inner"
                  : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>🎓</span>
              <span>Student Pod</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("teacher")}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                role === "teacher"
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-inner"
                  : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>📚</span>
              <span>Educator Pod</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <AnimatePresence>
              {isNew && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-1.5 overflow-hidden"
                >
                  <label className="text-xs font-bold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300">Email Address</label>
              <input
                type="email"
                placeholder={role === "teacher" ? "teacher@itm.edu" : "student@itm.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300">Secure Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 font-mono"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide uppercase"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isNew ? "Initialize Account" : "Authenticate Access"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </motion.button>
          </form>

          {/* Quick interactive demo configurations */}
          {!isNew && (
            <div className="mt-8 pt-6 border-t border-white/5">
              <span className="block text-[0.65rem] uppercase tracking-widest text-slate-500 font-mono font-bold mb-3 text-center">
                ✦ Pre-configured Sandbox Identities
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Teachers Demo list */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[0.65rem] font-bold text-slate-400 px-1">Educators</span>
                  {DEMO_USERS.filter((u) => u.role === "teacher").map((u) => (
                    <motion.button
                      key={u.id}
                      whileHover={{ x: 2 }}
                      onClick={() => demoLogin(u)}
                      type="button"
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-left transition-colors group cursor-pointer"
                    >
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[0.65rem] font-bold text-white shadow-inner flex-shrink-0">
                        {u.avatar}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {u.name}
                        </span>
                        <span className="text-[0.6rem] text-slate-500 font-mono truncate">
                          {u.subject}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Students Demo list */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[0.65rem] font-bold text-slate-400 px-1">Students</span>
                  {DEMO_USERS.filter((u) => u.role === "student").map((u) => (
                    <motion.button
                      key={u.id}
                      whileHover={{ x: 2 }}
                      onClick={() => demoLogin(u)}
                      type="button"
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-left transition-colors group cursor-pointer"
                    >
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-[0.65rem] font-bold text-white shadow-inner flex-shrink-0">
                        {u.avatar}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                          {u.name}
                        </span>
                        <span className="text-[0.6rem] text-slate-500 font-mono truncate">
                          Grade {u.grade}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}