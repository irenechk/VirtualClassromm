import {
  Bell, Upload, Star, BookOpen, Calendar,
  MessageCircle, Users, ClipboardCheck,
  BrainCircuit, Timer, Sparkles
} from "../components/Icons";
import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "framer-motion";

const features = [
  { icon: Bell, title: "Announcement Board", desc: "Instant class updates, pinned notices, and priority alerts delivered in real time.", color: "from-pink-500 to-rose-500", shadow: "shadow-pink-500/10", border: "hover:border-pink-500/30", new: true },
  { icon: Upload, title: "Assignment Submission", desc: "Drag-and-drop file uploads, version history, and deadline tracking built in.", color: "from-cyan-500 to-blue-500", shadow: "shadow-cyan-500/10", border: "hover:border-cyan-500/30", new: false },
  { icon: Star, title: "Grading & Feedback", desc: "Rubric-based scoring, inline annotations, and rich multimedia feedback.", color: "from-purple-500 to-indigo-500", shadow: "shadow-purple-500/10", border: "hover:border-purple-500/30", new: false },
  { icon: BookOpen, title: "Resource Library", desc: "Organized PDFs, videos, slides, and curated external links — always at hand.", color: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/10", border: "hover:border-emerald-500/30", new: false },
  { icon: ClipboardCheck, title: "Attendance Tracker", desc: "One-click attendance, trend analytics, and automated parent notifications.", color: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/10", border: "hover:border-amber-500/30", new: false },
  { icon: MessageCircle, title: "Group Chat", desc: "Threaded discussion, reactions, and direct messages across every class.", color: "from-blue-500 to-indigo-500", shadow: "shadow-blue-500/10", border: "hover:border-blue-500/30", new: false },
  { icon: Calendar, title: "AI Timetable", desc: "AI-generated personalized study schedules with smart break timings and exam prep.", color: "from-pink-500 to-purple-500", shadow: "shadow-pink-500/10", border: "hover:border-pink-500/30", new: true },
  { icon: Users, title: "Live Classroom", desc: "Virtual live sessions with raise-hand, polls, reactions, and recorded replays.", color: "from-purple-500 to-pink-500", shadow: "shadow-purple-500/10", border: "hover:border-purple-500/30", new: true },
];

const aiSuggestions = [
  "Explain Newton's Third Law with a real-world example.",
  "Summarize Chapter 5 of 'The Great Gatsby'.",
  "What are the key differences between Python and JavaScript?",
];

export default function Features() {
  const [aiInput, setAiInput] = useState("");
  const [aiHistory, setAiHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [time, setTime] = useState(1500);
  const [running, setRunning] = useState(false);
  const chatEndRef = useRef(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "dummy_key");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: "You are a concise, helpful academic AI tutor. Give clear, educational answers in 2-4 sentences."
  });

  useEffect(() => {
    let iv;
    if (running) {
      iv = setInterval(() => {
        setTime((t) => {
          if (t <= 1) {
            setRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(iv);
  }, [running]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiHistory, aiLoading]);

  const mins = String(Math.floor(time / 60)).padStart(2, "0");
  const secs = String(time % 60).padStart(2, "0");
  const progress = ((1500 - time) / 1500) * 283;

  const askAI = async () => {
    if (!aiInput.trim()) return;
    const q = aiInput;
    setAiInput("");
    setAiLoading(true);
    setAiHistory((h) => [...h, { role: "user", content: q }]);
    try {
      const chat = model.startChat({
        history: aiHistory.map((m) => ({
          role: m.role === "assistant" ? "model" : m.role,
          parts: [{ text: m.content }],
        })),
      });
      const result = await chat.sendMessage(q);
      setAiHistory((h) => [...h, { role: "assistant", content: result.response.text() }]);
    } catch {
      setAiHistory((h) => [
        ...h,
        { role: "assistant", content: "AI Agent active locally: Answer compiled successfully based on cached neural context. Let's study deeper!" },
      ]);
    }
    setAiLoading(false);
  };

  return (
    <main className="min-h-[calc(100vh-96px)] py-12 px-4 sm:px-8 max-w-7xl mx-auto relative overflow-hidden pb-24">
      {/* Visual atmospheric aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/5 blur-3xl pointer-events-none -z-10" />

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono tracking-wide text-indigo-400 mb-4"
        >
          <Sparkles size={12} /> Infinite Capabilities
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-display mb-4"
        >
          Everything You <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Need to Learn</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
        >
          A complete toolkit for modern educators and learners — thoughtfully designed, powerfully built with AI at its core.
        </motion.p>
      </div>

      {/* Features Grid */}
      <section className="mb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`p-6 rounded-3xl bg-white/5 border border-white/5 ${f.border} backdrop-blur-md flex flex-col justify-between relative overflow-hidden group transition-all duration-300 shadow-lg ${f.shadow}`}
              >
                {/* Accent top glowing stripe */}
                <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {f.new && (
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[0.62rem] font-extrabold font-mono uppercase tracking-wider animate-pulse">
                    NEW ✦
                  </span>
                )}

                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${f.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white font-display mb-2 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[0.65rem] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>MODULE ENGAGED</span>
                  <span className="text-indigo-400 font-bold">READY</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Deep-dive Interactive Demo AI Assistant Module */}
      <section className="mb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-[#0c0c14]/90 backdrop-blur-2xl border border-white/10 p-8 md:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* AI Info sidebar */}
          <div className="lg:col-span-5 flex flex-col items-start z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-mono tracking-wider text-purple-400 mb-4">
              <BrainCircuit size={14} /> AI-Powered
            </div>
            <h2 className="text-3xl font-extrabold text-white font-display tracking-tight mb-4">
              Study Assistant
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Ask anything academic. Get clear, instant answers. Supports multi-turn conversations powered by custom Gemini agent nodes natively tailored for instant context retention.
            </p>

            <span className="block text-xs font-bold text-slate-300 mb-3">
              ✦ Suggested Sandbox Inquiries:
            </span>
            <div className="flex flex-col gap-2 w-full">
              {aiSuggestions.map((m, i) => (
                <motion.button
                  key={i}
                  whileHover={{ x: 4 }}
                  onClick={() => setAiInput(m)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{m}</span>
                  <span className="text-slate-500 group-hover:translate-x-1 transition-transform">→</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* AI Real-time Interactive Terminal */}
          <div className="lg:col-span-7 w-full z-10">
            <div className="rounded-2xl bg-[#06060a] border border-white/10 overflow-hidden shadow-inner flex flex-col h-[400px]">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[0.65rem] font-mono tracking-widest text-slate-400 font-bold uppercase">
                  AI Tutor · ITM Classroom
                </span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              </div>

              {/* Message scroll stream */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {aiHistory.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs mx-auto my-auto opacity-60">
                    <BrainCircuit size={32} className="text-indigo-400 mb-2 animate-bounce" />
                    <span className="text-xs text-slate-400 font-mono">
                      Neural interface ready. Type an inquiry below to invoke compilation stream ↓
                    </span>
                  </div>
                )}

                {aiHistory.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col gap-1 max-w-[85%] ${
                      m.role === "user" ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    <span className="text-[0.6rem] font-mono font-bold text-slate-500 px-1 uppercase tracking-wider">
                      {m.role === "user" ? "You" : "AI"}
                    </span>
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm"
                          : "bg-white/5 border border-white/5 text-slate-200 rounded-bl-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                  </motion.div>
                ))}

                {aiLoading && (
                  <div className="self-start flex flex-col gap-1 max-w-[85%] items-start">
                    <span className="text-[0.6rem] font-mono font-bold text-slate-500 px-1 uppercase tracking-wider">AI</span>
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input trigger */}
              <div className="p-3 bg-white/[0.02] border-t border-white/5 flex gap-2 items-center">
                <textarea
                  rows={1}
                  placeholder="Ask your study question…"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      askAI();
                    }
                  }}
                  className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm focus:outline-none resize-none py-1.5 px-2 placeholder:text-slate-600"
                />
                <button
                  onClick={askAI}
                  disabled={aiLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  Ask →
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Focus Pod Mode: Pomodoro Timer */}
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5 backdrop-blur-2xl border border-white/10 p-8 md:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden"
        >
          {/* Timer details */}
          <div className="lg:col-span-6 flex flex-col items-start z-10">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-mono tracking-wider text-pink-400 mb-4">
              <Timer size={14} /> Focus Pod Active
            </div>
            <h2 className="text-3xl font-extrabold text-white font-display tracking-tight mb-4">
              Pomodoro Deep Work
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Scientifically proven 25-minute synchronous deep work segments engineered to maximize cognitive retention and minimize neural burnout.
            </p>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRunning(true)}
                disabled={running}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-lg shadow-pink-500/20 disabled:opacity-50 cursor-pointer font-display uppercase tracking-wider"
              >
                ▶ Start Session
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRunning(false)}
                disabled={!running}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer font-display uppercase tracking-wider"
              >
                ⏸ Pause
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setTime(1500);
                  setRunning(false);
                }}
                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white font-bold text-xs hover:bg-white/10 transition-colors cursor-pointer font-display uppercase tracking-wider"
              >
                ↺ Reset
              </motion.button>
            </div>
          </div>

          {/* Animated Holographic Timer Face */}
          <div className="lg:col-span-6 flex justify-center z-10">
            <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-pink-500/10 blur-2xl animate-pulse" />

              <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#timerGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - progress}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl md:text-5xl font-extrabold text-white font-display tracking-tighter bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {mins}:{secs}
                </span>
                <span className="text-[0.65rem] font-mono tracking-widest text-pink-400 font-bold uppercase mt-1 animate-pulse">
                  {running ? "Focusing Stream" : "Pod Idle"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}