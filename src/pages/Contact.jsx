import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Phone, Send, Github, Twitter, Linkedin, Sparkles } from "../components/Icons";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="min-h-[calc(100vh-96px)] py-12 px-4 sm:px-8 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background visual atmosphere */}
      <div className="absolute top-1/4 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/10 via-pink-600/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono tracking-wide text-pink-400 mb-4"
        >
          <Sparkles size={12} /> Partner & Connect
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-display mb-4"
        >
          Get in <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">Touch</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
        >
          Have a technical query, custom integration requirement, or want to partner with us? Reach out directly to our engineering core.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
        {/* Left Info Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 rounded-3xl bg-white/5 border border-white/5 p-8 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          <div>
            <h2 className="text-xl font-bold text-white font-display mb-2">Direct Channel</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-8">
              Every message passes directly into our core routing framework. Expect automated telemetry receipt followed by human intervention within 24 hours.
            </p>

            <div className="flex flex-col gap-6">
              {[
                { icon: Mail, label: "Email Pipeline", val: "hello@virtualclassroom.io" },
                { icon: Phone, label: "Voice Dispatch", val: "+91 98765 43210" },
                { icon: MapPin, label: "HQ Coordinates", val: "Mumbai, Maharashtra, India" },
              ].map(({ icon: Icon, label, val }, i) => (
                <motion.div
                  key={i}
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-4 group/item"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-300 group-hover/item:text-white group-hover/item:bg-white/10 transition-all flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      {label}
                    </span>
                    <strong className="text-xs font-semibold text-slate-200 truncate">
                      {val}
                    </strong>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-white/5 flex items-center gap-3">
            {[
              { icon: Github, href: "#" },
              { icon: Twitter, href: "#" },
              { icon: Linkedin, href: "#" },
            ].map(({ icon: Icon, href }, i) => (
              <motion.a
                key={i}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href={href}
                className="w-9 h-9 rounded-lg bg-white/[0.03] hover:bg-white/10 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Icon size={16} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Right Form Component */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 rounded-3xl bg-[#0c0c14]/90 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl flex flex-col justify-center relative"
        >
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 flex flex-col items-center justify-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl mb-4 shadow-inner">
                  ✓
                </div>
                <h3 className="text-2xl font-extrabold text-white font-display mb-2">
                  Message Dispatched!
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-sm mb-8 leading-relaxed">
                  Your variables were processed via REST payload successfully. Our node routers are analyzing the priority queue.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSent(false);
                    setForm({ name: "", email: "", message: "" });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors cursor-pointer font-display"
                >
                  Send Another Transmission
                </motion.button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Sender Identity</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-300">Reply Payload</label>
                    <input
                      required
                      type="email"
                      placeholder="sarah@company.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Transmission Body</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide full technical context or collaboration parameters…"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer font-display tracking-wide uppercase"
                >
                  <Send size={14} />
                  <span>Transmit Payload</span>
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}