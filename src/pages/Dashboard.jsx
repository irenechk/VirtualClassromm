import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, BookOpen, Star, Sparkles, ArrowRight } from "../components/Icons";

const publicStats = [
  { label: "Active Students", val: "50,000+", icon: "🎓", color: "from-pink-500 to-rose-500", shadow: "shadow-rose-500/10" },
  { label: "Educators", val: "3,000+", icon: "👩‍🏫", color: "from-purple-500 to-indigo-500", shadow: "shadow-indigo-500/10" },
  { label: "Assignments Graded", val: "1.2M+", icon: "✅", color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/10" },
  { label: "Institutions", val: "140+", icon: "🏫", color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/10" },
];

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-96px)] py-16 px-4 sm:px-8 flex items-center justify-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/10 to-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl rounded-3xl bg-[#0c0c14]/90 dark:bg-[#0c0c14]/90 backdrop-blur-2xl border border-white/10 p-8 md:p-12 shadow-2xl relative"
        >
          <div className="absolute top-0 right-1/4 w-96 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

          <div className="text-center max-w-2xl mx-auto mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner"
            >
              🔐
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-display mb-4">
              Sign in to Access Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Your personalized next-generation ITM Classroom portal is locked. Authenticate to sync state, review insights, and connect with peers.
            </p>
          </div>

          {/* Premium Bento Grid of Public Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {publicStats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between relative overflow-hidden group shadow-lg ${s.shadow}`}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl mb-4 group-hover:bg-white/10 transition-colors">
                  {s.icon}
                </div>
                <div>
                  <span className="block text-2xl font-extrabold text-white font-display tracking-tight mb-1">
                    {s.val}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {s.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 cursor-pointer font-display"
            >
              <span>Sign In to Continue</span>
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-96px)] py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Authenticated user premium Dashboard Hub */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10 mb-8">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-purple-500/20 relative"
          >
            {user.avatar}
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-blue-500 text-[0.6rem] font-bold uppercase tracking-wider text-white border border-[#06060a]">
              {user.role}
            </span>
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user.name}</span>!
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Access your digital workspace, assignments matrix, and real-time live lectures.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/app")}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 cursor-pointer self-stretch md:self-auto justify-center font-display"
        >
          <span>Open My Classroom</span>
          <ArrowRight size={16} />
        </motion.button>
      </div>

      {/* Modern Bento Grid interface preview tailored for user */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento Box 1: Quick Access Gate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <LayoutDashboard size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Classroom Central</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Launch into your interactive dashboard powered by live streaming, persistent focus tools, and assignment submission pipelines.
            </p>
          </div>

          <button
            onClick={() => navigate("/app")}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <span>Enter Studio</span>
            <span className="text-slate-500 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </motion.div>

        {/* Bento Box 2: Smart Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group md:col-span-2"
        >
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[0.65rem] font-bold tracking-widest uppercase font-mono">
                  Telemetry Active
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">System Status Overview</h3>
              <p className="text-xs text-slate-400">Real-time engagement variables synced for your account</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xl font-extrabold text-white font-mono">99.8%</span>
                <span className="text-[0.65rem] text-slate-500 font-bold uppercase">Sync Quality</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-end">
                <span className="text-xl font-extrabold text-emerald-400 font-mono">Secure</span>
                <span className="text-[0.65rem] text-slate-500 font-bold uppercase">Connection</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: <BookOpen size={16} />, title: "Curriculum Modules", desc: "Always aligned with automated rubrics" },
              { icon: <Users size={16} />, title: "Peer Networking", desc: "Optimized connection speeds" },
              { icon: <Star size={16} />, title: "AI Accelerated", desc: "Powered by Gemini custom agents" },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1.5">
                <div className="text-slate-400">{item.icon}</div>
                <span className="text-xs font-bold text-white">{item.title}</span>
                <span className="text-[0.7rem] text-slate-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}