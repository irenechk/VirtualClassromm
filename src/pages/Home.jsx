import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Zap, Shield, Globe } from "../components/Icons";
import { motion } from "framer-motion";

const pillars = [
  { icon: <Zap size={18} className="text-[#00f2ff]" />, title: "Real-time Sync", desc: "Instant collaborative state updates across all connected peers with near-zero latency." },
  { icon: <Shield size={18} className="text-[#7000ff]" />, title: "Secure & Private", desc: "End-to-end telemetry encryption preserving full enterprise data sovereignty." },
  { icon: <Globe size={18} className="text-white" />, title: "Learn Anywhere", desc: "Optimized multi-platform accessibility running flawlessly on mobile, desktop, and XR." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Home() {
  return (
    <main className="relative overflow-hidden pb-24">
      {/* Subtle Premium Background Spotlights & Grid Mask */}
      <div className="absolute top-0 inset-x-0 h-[800px] hero-grid opacity-25 pointer-events-none -z-10" />
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#7000ff]/15 via-[#00f2ff]/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 lg:pt-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Left Hero Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            {/* Tagline Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md mb-6 cursor-pointer hover:bg-white/[0.06] transition-colors shadow-inner"
            >
              <Sparkles size={14} className="text-[#00f2ff] animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase text-gradient font-mono">
                Next-Generation Learning Platform
              </span>
            </motion.div>

            {/* Optimized Header Title with balanced widths & tight line heights */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-6 font-display max-w-2xl"
            >
              Where Every <br />
              <span className="text-gradient drop-shadow-[0_0_30px_rgba(0,242,255,0.25)]">
                Classroom
              </span>{" "}
              <br />
              Becomes Infinite
            </motion.h1>

            {/* Subtitle with high legibility contrast */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-300 dark:text-slate-300 max-w-xl mb-8 leading-relaxed"
            >
              ITM Classroom — a radically reimagined education platform with AI tutoring,
              gamification, live lectures, smart assignments, and analytics. All in one beautiful space.
            </motion.p>

            {/* Aligned Premium CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <Link
                to="/dashboard"
                className="btn-shimmer text-center block font-display tracking-wide shadow-lg shadow-[#7000ff]/10"
              >
                Get Started Free
              </Link>

              <Link
                to="/features"
                className="flex items-center justify-center px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold backdrop-blur-md transition-all duration-300 text-center font-display"
              >
                <span>Explore Features</span>
              </Link>
            </motion.div>

            {/* Feature Pillars Integrated Elegantly */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full pt-8 border-t border-white/10"
            >
              {pillars.map((p, i) => (
                <div key={i} className="flex flex-col gap-2 group">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                      {p.icon}
                    </span>
                    <span className="text-xs font-bold text-slate-100 tracking-wide">{p.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Hero Integrated Interactive Widget Dock */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 relative flex justify-center w-full"
          >
            {/* Ambient Backlight Aura for Depth Layering */}
            <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-tr from-[#7000ff]/20 to-[#00f2ff]/20 blur-[100px] pointer-events-none -z-10" />

            {/* Master Card Frame */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md glass-card p-6 relative overflow-hidden"
            >
              {/* Top Frame Controls */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500/80" />
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] animate-pulse" />
                  <span className="text-[0.65rem] font-mono font-bold tracking-widest text-slate-300 uppercase">
                    Live Telemetry
                  </span>
                </div>
              </div>

              {/* Internal Dashboard Grid Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { val: "1,240", label: "Students Online", color: "text-[#00f2ff]" },
                  { val: "98%", label: "Attendance Rate", color: "text-white" },
                  { val: "342", label: "Assignments Due", color: "text-purple-300" },
                  { val: "4.9★", label: "Avg Rating", color: "text-[#00f2ff]" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between relative group hover:bg-white/[0.04] transition-colors"
                  >
                    <span className={`text-xl font-extrabold font-display tracking-tight ${s.color}`}>
                      {s.val}
                    </span>
                    <span className="text-xs font-medium text-slate-400 mt-1">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Equalizer Stream Simulator Frame */}
              <div className="flex flex-col gap-2 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-[0.7rem] font-mono text-slate-400">
                  <span>NETWORK LOAD</span>
                  <span className="text-[#00f2ff] font-bold tracking-wider">STABLE</span>
                </div>
                {/* Responsive Stream Bars */}
                <div className="flex items-end gap-1.5 h-16 pt-2">
                  {[80, 55, 90, 65, 75, 40, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-white/5 rounded-full overflow-hidden h-full relative"
                    >
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{
                          duration: 1,
                          delay: 0.3 + i * 0.1,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#7000ff] to-[#00f2ff] rounded-full"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[0.6rem] font-mono text-slate-500 mt-1">
                  <span>08:00 AM</span>
                  <span>12:00 PM</span>
                  <span>NOW</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Infinite Scrolling Premium Tech Marquee */}
      <section className="mt-20 border-y border-white/10 bg-white/[0.01] py-4 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#030303] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#030303] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-8 w-max animate-marquee">
          {[...Array(2)].flatMap(() =>
            [
              "AI Tutor",
              "Assignments",
              "Gamification",
              "Live Classes",
              "Attendance",
              "Analytics",
              "Focus Timer",
              "Leaderboards",
              "Smart Grades",
              "Notifications",
              "Timetable",
              "Resources",
            ].map((t, i) => (
              <span
                key={`${t}${i}`}
                className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider font-mono text-slate-400"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f2ff]" />
                <span>{t}</span>
              </span>
            ))
          )}
        </div>
      </section>

      {/* Proof Grid Section with Luxurious Card Alignment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-widest text-slate-400 font-bold font-mono mb-8"
        >
          Trusted by educators & students worldwide
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { val: "50K+", desc: "Active Students" },
            { val: "3K+", desc: "Educators" },
            { val: "99.9%", desc: "Uptime SLA" },
            { val: "140+", desc: "Institutions" },
          ].map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6 text-center relative overflow-hidden group flex flex-col justify-center"
            >
              {/* Premium top subtle accent line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00f2ff]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="block text-3xl font-extrabold text-white font-display mb-1 tracking-tight">
                {n.val}
              </span>
              <span className="text-xs font-medium text-slate-400 tracking-wide">{n.desc}</span>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}