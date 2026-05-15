import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotes, useAssignments, useLiveSession, usePoll, fileToDataURL, useGrades, useXp } from "../hooks/useClassroomStore";

const MY_TASKS = [
  { id: 1, title: "Chapter 5 Problems", subject: "Math", due: "2025-05-15", status: "pending", grade: null },
  { id: 2, title: "Lab Report: Pendulum", subject: "Physics", due: "2025-05-18", status: "submitted", grade: 88 },
  { id: 3, title: "Essay: Shakespeare", subject: "English", due: "2025-05-12", status: "graded", grade: 95 },
  { id: 4, title: "Chemistry Worksheet", subject: "Chemistry", due: "2025-05-20", status: "pending", grade: null },
];
const MY_SCORES = { Math: 92, Physics: 88, English: 95, Chemistry: 79 };
const RESOURCES = [
  { id: 1, title: "Newton's Laws — Notes", type: "PDF", subject: "Physics", size: "2.3 MB" },
  { id: 2, title: "Algebra Chapter 5 Slides", type: "PPT", subject: "Math", size: "4.1 MB" },
  { id: 3, title: "Photosynthesis Video", type: "Video", subject: "Biology", size: "45 MB" },
  { id: 4, title: "Shakespeare Essay Guide", type: "PDF", subject: "English", size: "1.1 MB" },
];

const PEER_LEADERBOARD = [
  { name: "Kavya Nair", avatar: "KN", xp: 2840, streak: 12, badges: 6 },
  { name: "Aarav Singh", avatar: "AS", xp: 1980, streak: 7, badges: 3 },
  { name: "Dev Sharma", avatar: "DS", xp: 1540, streak: 4, badges: 2 },
  { name: "Priya Joshi", avatar: "PJ", xp: 1200, streak: 2, badges: 2 },
];

const ALL_BADGES = [
  { id: "warrior", icon: "⚔️", label: "Assignment Warrior", desc: "Submit 3 assignments", xpRequired: 500 },
  { id: "streak7", icon: "🔥", label: "7-Day Streak", desc: "Attend 7 days in a row", xpRequired: 800 },
  { id: "top", icon: "🏆", label: "Top Performer", desc: "Score 90%+ average", xpRequired: 2000 },
  { id: "aiexplore", icon: "🧠", label: "AI Explorer", desc: "Ask AI 5 questions", xpRequired: 300 },
  { id: "never_late", icon: "📅", label: "Never Late", desc: "Submit before due date", xpRequired: 1200 },
  { id: "focus", icon: "🎯", label: "Focus Master", desc: "Complete 10 focus sessions", xpRequired: 1500 },
  { id: "quiz5", icon: "🎮", label: "Quiz Rookie", desc: "Complete 5 quizzes", xpRequired: 600 },
  { id: "perfect", icon: "💎", label: "Perfect Score", desc: "Score 100% in a quiz", xpRequired: 900 },
];

// Topic-based MCQ bank
const QUIZ_BANK = {
  Math: [
    { q: "What is the value of x in: 2x + 6 = 18?", options: ["4", "5", "6", "7"], ans: 2 },
    { q: "What is the area of a circle with radius 7?", options: ["154", "144", "196", "49π"], ans: 0 },
    { q: "Simplify: (x² - 4) / (x - 2)", options: ["x+2", "x-2", "x²+2", "2x"], ans: 0 },
    { q: "What is the sum of angles in a triangle?", options: ["90°", "270°", "180°", "360°"], ans: 2 },
    { q: "What is √144?", options: ["11", "12", "13", "14"], ans: 1 },
  ],
  Physics: [
    { q: "Newton's 2nd Law states F =", options: ["mv", "ma", "½mv²", "mv/t"], ans: 1 },
    { q: "The unit of power is:", options: ["Joule", "Newton", "Watt", "Pascal"], ans: 2 },
    { q: "Speed of light is approximately:", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], ans: 1 },
    { q: "What is the formula for kinetic energy?", options: ["mgh", "½mv²", "mv", "Fd"], ans: 1 },
    { q: "Ohm's Law: V = ?", options: ["I/R", "IR", "I²R", "R/I"], ans: 1 },
  ],
  Chemistry: [
    { q: "The atomic number of Carbon is:", options: ["6", "8", "12", "14"], ans: 0 },
    { q: "What is the chemical symbol for Gold?", options: ["Gd", "Go", "Au", "Ag"], ans: 2 },
    { q: "pH of pure water at 25°C:", options: ["5", "6", "7", "8"], ans: 2 },
    { q: "Covalent bonds involve sharing of:", options: ["Protons", "Neutrons", "Electrons", "Nuclei"], ans: 2 },
    { q: "The lightest element is:", options: ["Helium", "Oxygen", "Hydrogen", "Lithium"], ans: 2 },
  ],
  English: [
    { q: "Who wrote 'Romeo and Juliet'?", options: ["Dickens", "Shakespeare", "Austen", "Keats"], ans: 1 },
    { q: "A word opposite in meaning is called:", options: ["Synonym", "Antonym", "Homonym", "Acronym"], ans: 1 },
    { q: "Which is a simile?", options: ["The sun is a golden coin", "He ran like the wind", "Time is money", "The stars danced"], ans: 1 },
    { q: "Passive voice of 'She writes a letter':", options: ["A letter is written by her", "She is written a letter", "A letter writes her", "Letter was written"], ans: 0 },
    { q: "'Brevity is the soul of wit' is from:", options: ["Othello", "Hamlet", "Macbeth", "King Lear"], ans: 1 },
  ],
};

// ── MCQ Quiz Game Component ─────────────────────────────────────────────────
function QuizGame({ user, xp, setXp, earnedBadges, setEarnedBadges, onQuizComplete }) {
  const [phase, setPhase] = useState("pick"); // pick | playing | result
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [results, setResults] = useState([]);
  const timerRef = useRef(null);

  const startQuiz = (t) => {
    const qs = [...QUIZ_BANK[t]].sort(() => Math.random() - 0.5).slice(0, 5);
    setTopic(t);
    setQuestions(qs);
    setQIndex(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setTimeLeft(20);
    setXpEarned(0);
    setStreak(0);
    setResults([]);
    setPhase("playing");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleAnswer(null);
          return 20;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, qIndex]);

  const handleAnswer = (idx) => {
    if (answered) return;
    clearInterval(timerRef.current);
    setSelected(idx);
    setAnswered(true);
    const correct = idx === questions[qIndex].ans;
    const gained = correct ? (timeLeft >= 15 ? 30 : timeLeft >= 10 ? 20 : 10) : 0;
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
    setXpEarned((p) => p + gained);
    setResults((r) => [...r, { correct, gained, time: 20 - timeLeft }]);
    setTimeout(() => {
      if (qIndex + 1 < questions.length) {
        setQIndex((i) => i + 1);
        setSelected(null);
        setAnswered(false);
        setTimeLeft(20);
      } else {
        setPhase("result");
        const totalGained = xpEarned + gained;
        setXp((x) => x + totalGained);
        // Badge checks
        const newBadges = [...earnedBadges];
        if (!newBadges.includes("quiz5")) newBadges.push("quiz5");
        if (score + (correct ? 1 : 0) === 5 && !newBadges.includes("perfect")) newBadges.push("perfect");
        setEarnedBadges(newBadges);
        // Notify parent to show XP toast and increment quiz count
        if (onQuizComplete) onQuizComplete(totalGained);
      }
    }, 1200);
  };

  // PICK TOPIC
  if (phase === "pick") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(QUIZ_BANK).map((t) => (
            <motion.button
              key={t}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startQuiz(t)}
              className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/30 backdrop-blur-md flex flex-col items-center text-center transition-all group relative overflow-hidden shadow-lg cursor-pointer"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">
                {t === "Math" ? "📐" : t === "Physics" ? "⚛️" : t === "Chemistry" ? "🧪" : "📖"}
              </span>
              <span className="font-extrabold text-white text-base tracking-tight block">
                {t}
              </span>
              <span className="text-[0.65rem] text-slate-500 font-mono mt-1 block">
                5 questions · 20s each
              </span>
              <div className="mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[0.65rem] font-mono font-bold text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                +10–30 XP
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  // PLAYING
  if (phase === "playing") {
    const q = questions[qIndex];
    const pct = (timeLeft / 20) * 100;
    return (
      <motion.div
        key={qIndex}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-2xl mx-auto w-full flex flex-col gap-4"
      >
        {/* Header Stream indicators */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 flex-1 max-w-xs">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${i < qIndex
                  ? "bg-emerald-500"
                  : i === qIndex
                    ? "bg-indigo-500 shadow-sm shadow-indigo-500/50"
                    : "bg-white/10"
                  }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            {topic} · Q{qIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Dynamic Timeline Countdown */}
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${timeLeft > 10 ? "bg-emerald-500" : timeLeft > 5 ? "bg-amber-500" : "bg-rose-500"
              }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Question Container */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0c0c14]/90 backdrop-blur-xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[0.65rem] font-mono font-bold tracking-widest text-slate-500 uppercase">
              Inquiry Segment {qIndex + 1}
            </span>
            <span
              className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-full border ${timeLeft > 10
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : timeLeft > 5
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse"
                }`}
            >
              ⏱ {timeLeft}s
            </span>
          </div>
          <p className="text-base sm:text-lg text-white font-medium leading-relaxed">
            {q.q}
          </p>
        </div>

        {/* Options Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            let bg = "bg-white/5",
              border = "border-white/5",
              text = "text-slate-300";

            if (answered) {
              if (i === q.ans) {
                bg = "bg-emerald-500/10";
                border = "border-emerald-500/30";
                text = "text-emerald-300 font-bold";
              } else if (i === selected && i !== q.ans) {
                bg = "bg-rose-500/10";
                border = "border-rose-500/30";
                text = "text-rose-300 font-bold";
              }
            } else if (selected === i) {
              bg = "bg-indigo-500/10";
              border = "border-indigo-500/30";
              text = "text-indigo-300 font-bold";
            }

            return (
              <motion.button
                key={i}
                whileHover={!answered ? { scale: 1.01, x: 2 } : {}}
                whileTap={!answered ? { scale: 0.99 } : {}}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                className={`p-4 rounded-2xl border ${bg} ${border} ${text} flex items-center gap-3 text-left transition-all ${!answered ? "hover:bg-white/10 hover:border-white/10 cursor-pointer" : "cursor-default"
                  }`}
              >
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 shadow-inner ${answered && i === q.ans
                    ? "bg-emerald-500 text-white"
                    : answered && i === selected && i !== q.ans
                      ? "bg-rose-500 text-white"
                      : "bg-white/5 text-slate-400"
                    }`}
                >
                  {answered && i === q.ans ? "✓" : answered && i === selected && i !== q.ans ? "✗" : ["A", "B", "C", "D"][i]}
                </span>
                <span className="text-xs sm:text-sm leading-normal flex-1">{opt}</span>
              </motion.button>
            );
          })}
        </div>

        {streak > 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center text-xs font-mono font-bold text-amber-400 mt-2 animate-bounce"
          >
            🔥 {streak} Streak active! +Bonus Matrix Multiplier
          </motion.div>
        )}
      </motion.div>
    );
  }

  // RESULT
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const pct = Math.round((correct / total) * 100) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto w-full flex flex-col gap-6"
    >
      <div className="p-8 rounded-3xl bg-[#0c0c14]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
        <span className="text-5xl block mb-3 animate-bounce">
          {pct === 100 ? "🏆" : pct >= 80 ? "🎉" : pct >= 60 ? "👍" : "💪"}
        </span>
        <h3 className="text-2xl font-extrabold text-white font-display tracking-tight mb-1">
          {correct}/{total} Correctly Assessed
        </h3>
        <span className="text-xs font-mono text-slate-400 block mb-6">
          {topic} Module Summary · {pct}% Synthesis
        </span>

        <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
            <span className="text-2xl font-extrabold text-indigo-400 font-mono">+{xpEarned}</span>
            <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider mt-0.5">XP Rewarded</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">{pct}%</span>
            <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Accuracy</span>
          </div>
        </div>
      </div>

      {/* Breakdown per segment list */}
      <div className="flex flex-col gap-2">
        <span className="text-[0.65rem] font-mono font-bold tracking-widest text-slate-500 uppercase px-1">
          ✦ Segment Log Matrix
        </span>
        {questions.map((q, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300"
          >
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center text-[0.65rem] font-bold flex-shrink-0 ${results[i]?.correct ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }`}
            >
              {results[i]?.correct ? "✓" : "✗"}
            </span>
            <span className="flex-1 truncate">{q.q}</span>
            <span className="text-[0.65rem] font-mono text-slate-500 font-bold flex-shrink-0">
              {results[i]?.gained > 0 ? `+${results[i].gained}xp` : "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 justify-center pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => startQuiz(topic)}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-md cursor-pointer font-display uppercase tracking-wider"
        >
          🔄 Retry Stream
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPhase("pick")}
          className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-colors cursor-pointer font-display uppercase tracking-wider"
        >
          🏠 Change Topic
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function StudentApp({ user }) {
  const [tab, setTab] = useState("dashboard");
  const [tasks, setTasks] = useState(MY_TASKS);
  const [timerTime, setTimerTime] = useState(1500);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState("focus");
  const [sessions, setSessions] = useState(0);
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "Dr. Priya Sharma", text: "Don't forget Chapter 5 is due Thursday!", time: "9:00 AM", avatar: "PS" },
    { id: 2, sender: "Aarav Singh", text: "Anyone done Q4 yet? It's tricky", time: "10:15 AM", avatar: "AS" },
    { id: 3, sender: "You", text: "Yes! Use substitution method for Q4.", time: "10:20 AM", avatar: user?.avatar || "U" },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiHistory, setAiHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [liveRaised, setLiveRaised] = useState(false);
  const [liveReactions, setLiveReactions] = useState({ "\ud83d\udc4d": 12, "\ud83d\udd25": 5, "\ud83d\udc4f": 8, "\u2753": 2 });
  const [analyzerText, setAnalyzerText] = useState("");
  const [analyzerResult, setAnalyzerResult] = useState(null);
  const [analyzerLoading, setAnalyzerLoading] = useState(false);

  // Gamification variables
  const { studentXp, updateXp: broadcastXp } = useXp();
  const { grades } = useGrades();

  // Dynamic scores for the current student
  const [scores, setScores] = useState(MY_SCORES);
  const [xp, setXp] = useState(2310);

  // Sync shared grades into local scores state
  useEffect(() => {
    if (user?.id && grades[user.id]) {
      const newScores = { ...scores, ...grades[user.id] };
      // Check if any score improved to show a toast
      Object.keys(grades[user.id]).forEach(sub => {
        if (grades[user.id][sub] > scores[sub]) {
          showXpToast(100, `Improved in ${sub}! 🚀`);
          setXp(x => x + 100);
        }
      });
      setScores(newScores);
    }
  }, [grades, user?.id]);

  // Sync shared XP into local state
  useEffect(() => {
    if (user?.id && studentXp[user.id] !== undefined) {
      setXp(studentXp[user.id]);
    }
  }, [studentXp, user?.id]);

  // Broadcast XP changes to other devices
  useEffect(() => {
    if (user?.id && xp !== studentXp[user.id]) {
      broadcastXp(user.id, xp);
    }
  }, [xp, user?.id]);

  const [earnedBadges, setEarnedBadges] = useState(["warrior", "streak7", "aiexplore"]);
  const [xpToast, setXpToast] = useState(null); // { amount, label }
  const [quizzesCompleted, setQuizzesCompleted] = useState(0);
  const [assignmentsSubmitted, setAssignmentsSubmitted] = useState(0);
  const xpToastTimerRef = useRef(null);

  // Show an XP toast pop-up
  const showXpToast = (amount, label = "XP Earned!") => {
    setXpToast({ amount, label });
    clearTimeout(xpToastTimerRef.current);
    xpToastTimerRef.current = setTimeout(() => setXpToast(null), 2800);
  };

  // Auto-unlock XP-gated badges whenever XP changes
  useEffect(() => {
    setEarnedBadges(prev => {
      const next = [...prev];
      ALL_BADGES.forEach(b => {
        if (!next.includes(b.id) && xp >= b.xpRequired) next.push(b.id);
      });
      return next;
    });
  }, [xp]);

  // Build a live, sorted leaderboard that always includes the current student
  const liveLeaderboard = (() => {
    const withoutMe = PEER_LEADERBOARD.filter(p => p.name !== user.name);
    const myEntry = { name: user.name, avatar: user.avatar, xp, streak: 7, badges: earnedBadges.length, isMe: true };
    return [...withoutMe, myEntry].sort((a, b) => b.xp - a.xp);
  })();
  const myRank = liveLeaderboard.findIndex(p => p.isMe) + 1;

  // ── Shared Classroom Store hooks ──
  const { notes } = useNotes();
  const { assignments: sharedAssignments, submitAssignment } = useAssignments();
  const { liveSession, joinSession } = useLiveSession();
  const { poll, votePoll } = usePoll();
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Clear vote selection when a fresh poll arrives
  useEffect(() => {
    if (poll) {
      setHasVoted(false);
      setSelectedOption(null);
    }
  }, [poll?.pushedAt]);

  const [joinedLive, setJoinedLive] = useState(false);
  const [liveNotifShown, setLiveNotifShown] = useState(false);
  const [studentCamOn, setStudentCamOn] = useState(true);
  const [studentMicOn, setStudentMicOn] = useState(true);
  const studentVideoRef = useRef(null);
  const studentStreamRef = useRef(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [submitFile, setSubmitFile] = useState(null);
  const submitFileRef = useRef(null);
  const [submitText, setSubmitText] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTaskId, setConfirmTaskId] = useState(null);
  const [submissionView, setSubmissionView] = useState(null); // null or task id being worked on

  // Show notification when teacher goes live — with audio alert + browser notification
  useEffect(() => {
    if (liveSession?.active && !liveNotifShown) {
      setLiveNotifShown(true);
      // Play an alert sound using Web Audio API
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        // Create a pleasant notification chime
        const playTone = (freq, startTime, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.3, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };
        const now = ctx.currentTime;
        playTone(523, now, 0.15);       // C5
        playTone(659, now + 0.15, 0.15); // E5
        playTone(784, now + 0.3, 0.3);   // G5
      } catch { }
      // Show browser notification if allowed
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🔴 Live Session Started!", {
          body: `${liveSession.teacher?.name} is now live. Click to join!`,
          icon: "🎥",
        });
      } else if ("Notification" in window && Notification.permission !== "denied") {
        Notification.requestPermission();
      }
      // Auto-switch to live tab so the student sees the join prompt
      setTab("live");
    }
    if (!liveSession?.active) {
      setLiveNotifShown(false);
      setJoinedLive(false);
      if (studentStreamRef.current) {
        studentStreamRef.current.getTracks().forEach(t => t.stop());
        studentStreamRef.current = null;
      }
    }
  }, [liveSession]);

  const handleJoinLive = async () => {
    setJoinedLive(true);
    joinSession({ name: user.name, avatar: user.avatar });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      studentStreamRef.current = stream;
      if (studentVideoRef.current) studentVideoRef.current.srcObject = stream;
    } catch { }
  };

  const toggleStudentCam = () => {
    studentStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !studentCamOn; });
    setStudentCamOn(v => !v);
  };

  const toggleStudentMic = () => {
    studentStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !studentMicOn; });
    setStudentMicOn(v => !v);
  };

  const handleSubmitAssignment = async (assignmentId) => {
    let fileData = null;
    if (submitFile) {
      fileData = { name: submitFile.name, size: (submitFile.size / 1024).toFixed(1) + " KB", dataUrl: await fileToDataURL(submitFile) };
    }
    submitAssignment(assignmentId, { studentName: user.name, avatar: user.avatar, file: fileData });
    setSubmittingId(null);
    setSubmitFile(null);
    if (submitFileRef.current) submitFileRef.current.value = "";
    setXp(x => x + 50);
    setAssignmentsSubmitted(c => c + 1);
    showXpToast(50, "Assignment Submitted!");
  };
  const level = Math.floor(xp / 500) + 1;

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  useEffect(() => {
    let iv;
    if (timerRunning) {
      iv = setInterval(() => {
        setTimerTime((t) => {
          if (t <= 1) {
            setTimerRunning(false);
            if (timerMode === "focus") {
              setSessions((s) => s + 1);
              setTimerMode("break");
              return 300;
            } else {
              setTimerMode("focus");
              return 1500;
            }
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(iv);
  }, [timerRunning, timerMode]);

  const mins = String(Math.floor(timerTime / 60)).padStart(2, "0");
  const secs = String(timerTime % 60).padStart(2, "0");
  const progress = timerMode === "focus" ? ((1500 - timerTime) / 1500) * 283 : ((300 - timerTime) / 300) * 283;
  const avgScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 4);

  const submitTask = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "submitted" } : t)));
  };

  // Full submission handler — syncs file + text to shared store, then marks as submitted
  const handleFullSubmit = async (taskId) => {
    let fileData = null;
    if (submitFile) {
      fileData = { name: submitFile.name, size: (submitFile.size / 1024).toFixed(1) + " KB", dataUrl: await fileToDataURL(submitFile) };
    }
    // Find the matching shared assignment ID if this is a shared assignment
    const matchedShared = sharedAssignments.find(a => a.title === tasks.find(t => t.id === taskId)?.title);
    if (matchedShared) {
      submitAssignment(matchedShared.id, {
        studentName: user.name,
        avatar: user.avatar,
        file: fileData,
        text: submitText,
      });
    }
    // Also submit any standalone shared assignment by ID
    const directShared = sharedAssignments.find(a => a.id === taskId);
    if (directShared && !matchedShared) {
      submitAssignment(taskId, {
        studentName: user.name,
        avatar: user.avatar,
        file: fileData,
        text: submitText,
      });
    }
    submitTask(taskId);
    setXp((x) => x + 50);
    setAssignmentsSubmitted(c => c + 1);
    showXpToast(50, "Assignment Submitted! 🎓");
    // Reset submission workspace
    setSubmissionView(null);
    setSubmitFile(null);
    setSubmitText("");
    setShowConfirmModal(false);
    setConfirmTaskId(null);
    if (submitFileRef.current) submitFileRef.current.value = "";
  };

  const askAI = async () => {
    if (!aiInput.trim()) return;
    const q = aiInput;
    setAiInput("");
    setAiLoading(true);
    const newHistory = [...aiHistory, { role: "user", content: q }];
    setAiHistory(newHistory);
    try {
      const contents = newHistory.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY || "dummy_key"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [
                {
                  text: `You are a concise, friendly academic AI tutor helping ${user.name}, a student. Give clear, educational answers with examples.`,
                },
              ],
            },
            contents,
            generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
          }),
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Agent processed: Compilation success.";
      setAiHistory((h) => [...h, { role: "assistant", content: reply }]);
    } catch (e) {
      setAiHistory((h) => [
        ...h,
        { role: "assistant", content: "AI Agent Context cached natively: " + e.message + " — Local sandbox ready for multi-turn assistance!" },
      ]);
    }
    setAiLoading(false);
  };

  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    setMessages((m) => [
      ...m,
      {
        id: Date.now(),
        sender: "You",
        text: chatMsg,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        avatar: user.avatar,
      },
    ]);
    setChatMsg("");
  };

  const analyzeAssignment = async () => {
    if (!analyzerText.trim()) return;
    setAnalyzerLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const plagiarism = Math.floor(Math.random() * 15);
    const grammar = Math.floor(85 + Math.random() * 15);
    const predicted = Math.floor(70 + Math.random() * 28);
    setAnalyzerResult({
      plagiarism,
      grammar,
      predicted,
      words: analyzerText.trim().split(" ").length,
      feedback:
        "Good structure and vocabulary. Consider adding more specific examples to strengthen your arguments. The introduction could be more compelling — try opening with a hook or thought-provoking question.",
    });
    setAnalyzerLoading(false);
  };

  const downloadScores = () => {
    const rows = [
      "Subject,Score,Grade\n",
      ...Object.entries(scores).map(
        (([s, v]) => `${s},${v},${v >= 90 ? "A" : v >= 80 ? "B" : v >= 70 ? "C" : "D"}\n`)
      ),
    ];
    const blob = new Blob(rows, { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${user.name.replace(/\s+/g, "_")}_scores.csv`;
    a.click();
  };

  const handleDownload = (item, type = "note") => {
    if (item.file && item.file.dataUrl) {
      const link = document.createElement("a");
      link.href = item.file.dataUrl;
      link.download = item.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      let content = "";
      let filename = "";
      if (type === "note") {
        content = `Title: ${item.title}\nSubject: ${item.subject}\nUploaded: ${new Date(item.uploadedAt || Date.now()).toLocaleString()}\nTeacher: ${item.teacher || "Teacher"}\n\nDescription:\n${item.description || "No description provided."}`;
        filename = `${item.title.replace(/\s+/g, "_")}_Note.txt`;
      } else if (type === "task") {
        content = `Task: ${item.title}\nSubject: ${item.subject}\nDeadline: ${item.due}\nTeacher: ${item.teacher || "Teacher"}\n\nInstructions/Parameters:\n${item.desc || "No special instructions."}`;
        filename = `${item.title.replace(/\s+/g, "_")}_Task.txt`;
      } else if (type === "submission") {
        content = `Submission by: ${item.studentName}\nSubmitted: ${new Date(item.submittedAt || Date.now()).toLocaleString()}\n\nAnswer/Content:\n${item.text || "No text provided."}`;
        filename = `Submission_${item.studentName.replace(/\s+/g, "_")}.txt`;
      } else if (type === "resource") {
        content = `Resource: ${item.title}\nSubject: ${item.subject}\nType: ${item.type}\nSize: ${item.size}\n\nThis is a simulated platform resource file.`;
        filename = `${item.title.replace(/\s+/g, "_")}.${item.type.toLowerCase()}`;
      }
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const tabsList = [
    { id: "dashboard", label: "Dashboard Overview", icon: "📊" },
    { id: "tasks", label: "Assignment Tasks", icon: "📝" },
    { id: "grades", label: "My Grades", icon: "⭐" },
    { id: "resources", label: "Resource Store", icon: "📚" },
    { id: "live", label: "Live Broadcast", icon: "🎥" },
    { id: "timer", label: "Focus Timer", icon: "⏱️" },
    { id: "gamify", label: "Achievements", icon: "🏆" },
    { id: "quiz", label: "Quiz Sandbox", icon: "🎮" },
    { id: "analyzer", label: "Smart Analyzer", icon: "📄" },
    { id: "chat", label: "Peer Chat", icon: "💬" },
    { id: "ai", label: "AI Tutor Node", icon: "🤖" },
  ];

  // Handler for when a quiz finishes
  const handleQuizComplete = (xpGained) => {
    setQuizzesCompleted(c => c + 1);
    showXpToast(xpGained, "Quiz Complete! 🎮");
  };

  return (
    <div className="min-h-[calc(100vh-96px)] py-8 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-stretch relative">
      {/* XP Toast Notification */}
      <AnimatePresence>
        {xpToast && (
          <motion.div
            key="xp-toast"
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90 border border-indigo-400/30 backdrop-blur-xl shadow-2xl shadow-indigo-500/30 pointer-events-none"
          >
            <span className="text-2xl">⚡</span>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-white font-display">+{xpToast.amount} XP</span>
              <span className="text-[0.7rem] text-indigo-200 font-mono">{xpToast.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Left Studio Control Navigation Sidebar */}
      <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex items-center gap-4 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-md flex-shrink-0">
            {user.avatar}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">{user.name}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono mt-0.5">
              <span>🎒</span> Student · {user.grade || "11-A"}
            </span>
          </div>
        </div>

        {/* Tab links container */}
        <nav className="flex lg:flex-col gap-1.5 p-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md overflow-x-auto lg:overflow-x-visible">
          {tabsList.map((t) => {
            const active = tab === t.id;
            return (
              <motion.button
                key={t.id}
                whileHover={{ x: active ? 0 : 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all flex-shrink-0 lg:flex-shrink relative cursor-pointer ${active
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-white/10 shadow-inner"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <span className="text-base flex-shrink-0">{t.icon}</span>
                <span className="truncate block">{t.label}</span>
                {active && (
                  <motion.div
                    layoutId="studentSidebarActiveIndicator"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    className="absolute inset-0 border border-indigo-500/30 rounded-xl pointer-events-none"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </aside>

      {/* Right Studio Main Feed Container */}
      <main className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Dynamic AI Banner Notice */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
              🤖
            </span>
            <div>
              <span className="block text-xs font-bold text-white">
                Hello, {user.name.split(" ")[0]}! Active Copilot Node synced.
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                {tasks.filter((t) => t.status === "pending").length > 0
                  ? `📝 Task-queue contains ${tasks.filter((t) => t.status === "pending").length} awaiting verification.`
                  : "✅ Task queue perfectly pristine. Optimal parameters."}
              </span>
            </div>
          </div>
          <button
            onClick={() => setTab("ai")}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors cursor-pointer self-stretch sm:self-auto text-center"
          >
            Launch Copilot →
          </button>
        </motion.div>

        {/* GLOBAL PERSISTENT LIVE SESSION ALERT MODAL */}
        <AnimatePresence>
          {liveSession?.active && !joinedLive && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-full max-w-lg p-5 rounded-3xl bg-gradient-to-r from-red-600/95 via-rose-600/95 to-red-700/95 border border-white/20 backdrop-blur-2xl shadow-2xl shadow-red-600/40 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <span className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shadow-inner flex-shrink-0 animate-bounce">
                  🎥
                </span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">LIVE STREAM DETECTED</span>
                  </div>
                  <span className="text-sm font-bold text-white truncate block mt-0.5">
                    {liveSession.teacher?.name || "Teacher"} is broadcasting!
                  </span>
                  <span className="text-[0.65rem] text-red-100 font-mono">
                    Subject: {liveSession.teacher?.subject || "General"} · Face-to-Face Grid enabled
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setTab("live");
                  // Trigger direct navigation
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-red-600 hover:bg-red-50 text-xs font-extrabold shadow-md active:scale-95 transition-all cursor-pointer flex-shrink-0 text-center font-display uppercase tracking-wider"
              >
                Open Studio →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {tab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Quick Metrics Stream */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Avg Synthesis", val: avgScore + "%", icon: "⭐", accent: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                { label: "Pending Tasks", val: tasks.filter((t) => t.status === "pending").length, icon: "📝", accent: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                { label: "Submitted Queue", val: tasks.filter((t) => t.status !== "pending").length, icon: "✅", accent: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                { label: "Level Matrix", val: `Lv. ${level}`, icon: "🎮", accent: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl bg-white/5 border ${c.border} flex flex-col justify-between relative overflow-hidden`}
                >
                  <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.accent} flex items-center justify-center text-sm mb-3`}>
                    {c.icon}
                  </div>
                  <div>
                    <span className="block text-xl font-extrabold text-white font-display tracking-tight">
                      {c.val}
                    </span>
                    <span className="text-[0.7rem] font-medium text-slate-400 block mt-0.5">
                      {c.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Exp Hub Panel */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Experience Level Matrix</span>
                <span className="text-xs font-mono font-bold text-indigo-400">{xp} XP Raw</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((xp % 500) / 500) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[0.65rem] font-mono text-slate-500">
                <span>LEVEL {level} ENGAGED</span>
                <span>{500 - (xp % 500)} XP TO LEVEL {level + 1}</span>
              </div>

              {/* Earned Badges Row */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                {ALL_BADGES.filter((b) => earnedBadges.includes(b.id)).map((b, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-slate-200"
                  >
                    <span>{b.icon}</span>
                    <span>{b.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Split row: Tasks vs Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left upcoming tasks */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <div>
                  <span className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">
                    ✦ Pending Deadlines
                  </span>
                  <div className="flex flex-col gap-3">
                    {tasks.filter((t) => t.status === "pending").map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-white truncate">{t.title}</span>
                          <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5">
                            {t.subject} · Due {t.due}
                          </span>
                        </div>
                        <button
                          onClick={() => submitTask(t.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Submit
                        </button>
                      </div>
                    ))}
                    {tasks.filter((t) => t.status === "pending").length === 0 && (
                      <span className="text-xs text-slate-400 block text-center py-4">
                        🎉 All assigned tasks processed successfully.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right simple synthesis list */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                      ✦ Matrix Output
                    </span>
                    <button
                      onClick={downloadScores}
                      className="text-[0.65rem] font-bold text-purple-400 hover:underline cursor-pointer"
                    >
                      Export CSV
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {Object.entries(scores).map(([sub, val]) => (
                      <div key={sub} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-300 w-20 truncate">{sub}</span>
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            className={`h-full rounded-full ${val >= 85 ? "bg-emerald-500" : val >= 70 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-white w-8 text-right">
                          {val}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ASSIGNMENT TASKS */}
        {tab === "tasks" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* CONFIRMATION MODAL */}
            <AnimatePresence>
              {showConfirmModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                  onClick={() => setShowConfirmModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#12121a] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-4xl">📋</span>
                    <h3 className="text-lg font-extrabold text-white font-display tracking-tight text-center">
                      Are you sure you want to submit?
                    </h3>
                    <p className="text-xs text-slate-400 text-center leading-relaxed max-w-xs">
                      Once submitted, you won't be able to modify your answer. Make sure you've reviewed everything carefully.
                    </p>
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => {
                          setShowConfirmModal(false);
                          // Go back to submission workspace for re-check
                        }}
                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-colors cursor-pointer uppercase tracking-wider"
                      >
                        🔍 Re-check
                      </button>
                      <button
                        onClick={() => handleFullSubmit(confirmTaskId)}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer uppercase tracking-wider"
                      >
                        ✅ Confirm Submit
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SUBMISSION WORKSPACE — Full-page editor view */}
            {submissionView !== null ? (() => {
              const task = tasks.find(t => t.id === submissionView) ||
                sharedAssignments.find(a => a.id === submissionView);
              if (!task) return null;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4"
                >
                  {/* Back button */}
                  <button
                    onClick={() => { setSubmissionView(null); setSubmitFile(null); setSubmitText(""); }}
                    className="self-start px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Back to Tasks
                  </button>

                  {/* Task info header */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-2.5 py-1 rounded bg-purple-500/10 text-[0.65rem] font-bold font-mono text-purple-400 uppercase">
                        {task.subject}
                      </span>
                      <span className="text-sm font-bold text-white">{task.title}</span>
                    </div>
                    {task.desc && <p className="text-xs text-slate-400 leading-relaxed mb-2">{task.desc}</p>}
                    <span className="text-[0.65rem] text-slate-500 font-mono">
                      Deadline: {task.due} {task.teacher && `· Assigned by: ${task.teacher}`}
                    </span>
                    {task.file && (
                      <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2">
                        <span>📎</span>
                        <span className="text-xs text-indigo-400 font-bold">{task.file.name}</span>
                        {task.file.dataUrl && (
                          <a href={task.file.dataUrl} download={task.file.name} className="ml-auto text-xs text-slate-400 hover:text-white cursor-pointer">⬇ Download</a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submission workspace */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col gap-4">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                      Your Submission
                    </span>

                    {/* Text area */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-300">Type or Paste Your Answer</label>
                      <textarea
                        rows={8}
                        placeholder="Type your answer, paste content, or write your solution here..."
                        value={submitText}
                        onChange={(e) => setSubmitText(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder:text-slate-600 leading-relaxed"
                      />
                    </div>

                    {/* File upload */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-300">Or Upload a File</label>
                      <div
                        onClick={() => submitFileRef.current?.click()}
                        className="w-full px-4 py-6 rounded-xl bg-white/[0.02] border-2 border-dashed border-white/10 hover:border-indigo-500/40 text-center cursor-pointer transition-colors group"
                      >
                        <input
                          ref={submitFileRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.png,.zip"
                          onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                        />
                        {submitFile ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">📎</span>
                            <span className="text-xs font-bold text-indigo-400">{submitFile.name}</span>
                            <span className="text-[0.65rem] text-slate-500 font-mono">({(submitFile.size / 1024).toFixed(1)} KB)</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSubmitFile(null); if (submitFileRef.current) submitFileRef.current.value = ""; }}
                              className="ml-2 text-rose-400 text-xs hover:text-rose-300"
                            >✕</button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl group-hover:scale-110 transition-transform">📁</span>
                            <span className="text-xs text-slate-400">Click to browse or drop a file</span>
                            <span className="text-[0.6rem] text-slate-600 font-mono">PDF, DOC, PPT, Images, ZIP</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => { setSubmissionView(null); setSubmitFile(null); setSubmitText(""); }}
                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-colors cursor-pointer uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (!submitText.trim() && !submitFile) return;
                          setConfirmTaskId(submissionView);
                          setShowConfirmModal(true);
                        }}
                        disabled={!submitText.trim() && !submitFile}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-transform cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
                      >
                        Submit Assignment →
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })() : (
              /* Normal task list view */
              <>
                <span className="text-sm font-bold text-white px-1">Assignment Tasks Queue</span>
                <div className="flex flex-col gap-3">
                  {/* Local hardcoded tasks */}
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${t.status === "pending"
                        ? "bg-amber-500/5 border-amber-500/20"
                        : t.status === "submitted"
                          ? "bg-blue-500/5 border-blue-500/20"
                          : "bg-emerald-500/5 border-emerald-500/20"
                        }`}
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-[0.65rem] font-bold font-mono text-slate-300 uppercase">
                            {t.subject}
                          </span>
                          <span className="text-xs font-bold text-white truncate">{t.title}</span>
                        </div>
                        <span className="text-[0.7rem] text-slate-500 font-mono">Deadline: {t.due}</span>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {t.grade && (
                          <span className="text-xs font-mono font-extrabold text-emerald-400">
                            Score: {t.grade}%
                          </span>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider ${t.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : t.status === "submitted"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                        >
                          {t.status}
                        </span>
                        {t.status === "pending" && (
                          <button
                            onClick={() => setSubmissionView(t.id)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Teacher-assigned tasks from shared store */}
                  {sharedAssignments.length > 0 && (
                    <>
                      <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest px-1 mt-3">
                        ✦ Teacher Assigned ({sharedAssignments.length})
                      </span>
                      {sharedAssignments.map((a) => {
                        const mySubmission = a.submissions?.find(s => s.studentName === user.name);
                        const isSubmitted = !!mySubmission;
                        return (
                          <div
                            key={a.id}
                            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${isSubmitted
                              ? "bg-blue-500/5 border-blue-500/20"
                              : "bg-indigo-500/5 border-indigo-500/20"
                              }`}
                          >
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-[0.65rem] font-bold font-mono text-indigo-400 uppercase">
                                  {a.subject}
                                </span>
                                <span className="text-xs font-bold text-white truncate">{a.title}</span>
                                {a.file && <span className="text-[0.6rem] text-slate-500">📎</span>}
                              </div>
                              <span className="text-[0.7rem] text-slate-500 font-mono">
                                Deadline: {a.due} · by {a.teacher || "Teacher"}
                              </span>
                              {a.desc && <span className="text-[0.65rem] text-slate-400 mt-0.5 line-clamp-1">{a.desc}</span>}
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider ${isSubmitted
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  }`}
                              >
                                {isSubmitted ? "submitted" : "pending"}
                              </span>
                              {!isSubmitted && (
                                <button
                                  onClick={() => setSubmissionView(a.id)}
                                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                                >
                                  Submit
                                </button>
                              )}
                              {isSubmitted && (
                                <span className="text-[0.65rem] text-blue-400 font-mono">✓ Submitted {new Date(mySubmission.submittedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* TAB 3: MY GRADES */}
        {tab === "grades" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Score Synthesis Array</span>
              <button
                onClick={downloadScores}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                ⬇ Download Score Card
              </button>
            </div>

            {/* GPA preview block */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-center gap-6 justify-around text-center sm:text-left">
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Overall Index
                </span>
                <span className="text-4xl font-extrabold text-white font-display tracking-tight block">
                  {avgScore}%
                </span>
              </div>
              <div className="w-full sm:w-px h-px sm:h-12 bg-white/10" />
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Verification State
                </span>
                <span className="text-xs font-bold text-emerald-400 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider block">
                  Optimal Matrix
                </span>
              </div>
            </div>

            {/* Multi-Subject Skill Matrix */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                  ✦ Cognitive Skill Distribution
                </span>
                <span className="text-[0.65rem] font-bold text-indigo-400 font-mono">
                  AGGREGATE: {avgScore}%
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Object.entries(scores).map(([sub, val]) => (
                  <div key={sub} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">{sub}</span>
                      <span className="text-xs font-mono font-bold text-white">{val}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        className={`h-full rounded-full ${val >= 90 ? "bg-emerald-500" : val >= 75 ? "bg-blue-500" : "bg-amber-500"
                          }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks Graded Simple logs */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
                ✦ Verified Rubric Scores
              </span>
              {tasks.filter((t) => t.grade).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">{t.title}</span>
                    <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5">{t.subject}</span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded">
                    {t.grade}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 4: RESOURCES STORE */}
        {tab === "resources" && (() => {
          const mySubmissions = sharedAssignments.flatMap(a =>
            (a.submissions || []).filter(sub => sub.studentName === user.name).map(sub => ({ ...sub, assignmentTitle: a.title, subject: a.subject }))
          );
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-white px-1">Curated Resources & Workspace Repository</span>
                <span className="text-xs text-slate-400 px-1">Access and download teacher notes, task parameters, and your submitted assignment archives.</span>
              </div>

              {/* Teacher uploaded notes */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest px-1">
                  ✦ Teacher Uploaded Notes ({notes.length})
                </span>
                {notes.length === 0 && (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-500">
                    No notes available yet. Notes uploaded by teachers will sync here immediately.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between gap-3 group hover:border-indigo-500/40 transition-colors"
                    >
                      <span className="text-2xl p-2 rounded-xl bg-indigo-500/10 flex-shrink-0">
                        {n.file ? "📎" : "📓"}
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-white truncate">{n.title}</span>
                        <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5">
                          {n.subject} · by {n.teacher || "Teacher"}
                          {n.file && ` · ${n.file.name}`}
                        </span>
                        {n.description && (
                          <span className="text-[0.65rem] text-slate-400 mt-1 line-clamp-2">{n.description}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDownload(n, "note")}
                        className="px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[0.65rem] font-bold font-mono transition-colors cursor-pointer flex-shrink-0"
                      >
                        ⬇ Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks by Teacher */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest px-1">
                  ✦ Tasks Dispatched by Teacher ({sharedAssignments.length})
                </span>
                {sharedAssignments.length === 0 && (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-500">
                    No tasks dispatched yet. Teacher tasks will appear here for reference downloads.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sharedAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between gap-3 group hover:border-purple-500/40 transition-colors"
                    >
                      <span className="text-2xl p-2 rounded-xl bg-purple-500/10 flex-shrink-0">
                        {a.file ? "📎" : "📝"}
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-white truncate">{a.title}</span>
                        <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5">
                          {a.subject} · Due: {a.due} {a.file && ` · ${a.file.name}`}
                        </span>
                        {a.desc && (
                          <span className="text-[0.65rem] text-slate-400 mt-1 line-clamp-1">{a.desc}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDownload(a, "task")}
                        className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[0.65rem] font-bold font-mono transition-colors cursor-pointer flex-shrink-0"
                      >
                        ⬇ Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignments Submitted by Student */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest px-1">
                  ✦ My Submitted Assignments Archives ({mySubmissions.length})
                </span>
                {mySubmissions.length === 0 && (
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-500">
                    No assignment archives found. Submissions you complete will be stored here for backup downloads.
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mySubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-3 group hover:border-emerald-500/40 transition-colors"
                    >
                      <span className="text-2xl p-2 rounded-xl bg-emerald-500/10 flex-shrink-0">
                        {sub.file ? "📎" : "✅"}
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-white truncate">{sub.assignmentTitle || "Assignment Submission"}</span>
                        <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5">
                          {sub.subject} · Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                          {sub.file && ` · ${sub.file.name}`}
                        </span>
                        {sub.text && (
                          <span className="text-[0.65rem] text-slate-400 mt-1 line-clamp-1">"{sub.text}"</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDownload(sub, "submission")}
                        className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[0.65rem] font-bold font-mono transition-colors cursor-pointer flex-shrink-0"
                      >
                        ⬇ Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Default static resources */}
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest px-1">
                ✦ Platform General Resources
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {RESOURCES.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 group hover:border-white/10 transition-colors"
                  >
                    <span className="text-2xl p-2 rounded-xl bg-white/5 flex-shrink-0">
                      {r.type === "PDF" ? "📄" : r.type === "PPT" ? "📊" : "🎬"}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-white truncate">{r.title}</span>
                      <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5">
                        {r.subject} · {r.size}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownload(r, "resource")}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold font-mono text-slate-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                    >
                      ⬇ Download
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })()}

        {/* TAB 5: LIVE BROADCAST */}
        {tab === "live" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {!liveSession?.active ? (
              /* No live session */
              <div className="p-12 rounded-3xl bg-white/5 border border-white/5 text-center max-w-xl mx-auto w-full flex flex-col items-center justify-center">
                <span className="text-5xl block mb-3">📡</span>
                <h3 className="text-xl font-extrabold text-white font-display tracking-tight mb-2">
                  No Live Session Active
                </h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Your teacher hasn't started a live session yet. When they go live, an instant high-fidelity floating alert will summon you to connect.
                </p>
              </div>
            ) : !joinedLive ? (
              /* Teacher is live, student hasn't joined */
              <div className="p-12 rounded-3xl bg-red-500/5 border border-red-500/20 text-center max-w-xl mx-auto w-full flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-rose-500 to-red-500 animate-pulse" />
                <span className="w-4 h-4 rounded-full bg-red-500 animate-pulse mb-4" />
                <h3 className="text-xl font-extrabold text-white font-display tracking-tight mb-1">
                  {liveSession.teacher?.name || "Teacher"} is LIVE!
                </h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                  {liveSession.teacher?.subject || "General"} session in progress. Join now to face your instructor and classmates in a collaborative Zoom-style conference grid.
                </p>
                <button
                  onClick={handleJoinLive}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-sm shadow-lg shadow-red-500/20 active:scale-95 transition-transform cursor-pointer font-display uppercase tracking-wider"
                >
                  🎥 Join Live Session
                </button>
                <span className="text-[0.65rem] text-slate-500 font-mono mt-3">
                  {liveSession.participants?.length || 0} peer endpoints currently connected
                </span>
              </div>
            ) : (
              /* Student has joined the live session */
              <div className="flex flex-col gap-6">
                {/* Live telemetry banner */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    <span>SYNCHRONOUS CONFERENCE — {liveSession.teacher?.name} · {liveSession.teacher?.subject || "General"}</span>
                  </div>
                  <span className="text-slate-400 font-mono hidden sm:inline">👥 {liveSession.participants?.length || 1} participant endpoints</span>
                </div>

                {/* Primary Cinema view: Teacher Feed */}
                <div className="flex flex-col gap-2">
                  <span className="text-[0.65rem] font-mono font-bold text-slate-400 uppercase tracking-widest px-1">
                    ✦ Primary Audio-Visual Stream (Teacher)
                  </span>
                  <div className="h-64 sm:h-80 rounded-3xl bg-[#06060a] border border-white/10 overflow-hidden shadow-2xl relative flex flex-col items-center justify-center">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-gradient-to-b from-transparent via-[#06060a]/40 to-[#06060a]/90 z-10">
                      <span className="text-6xl mb-3 animate-pulse">{liveSession.teacher?.avatar || "👨‍🏫"}</span>
                      <span className="font-extrabold text-white text-lg tracking-tight block">
                        {liveSession.teacher?.name || "Teacher"}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[0.65rem] font-mono font-bold text-red-400 mt-1">
                        Broadcasting WebRTC Matrix
                      </span>
                    </div>
                  </div>
                </div>

                {/* Zoom-Style Video Grid: "Facing Each Other" */}
                <div className="flex flex-col gap-2">
                  <span className="text-[0.65rem] font-mono font-bold text-slate-400 uppercase tracking-widest px-1">
                    ✦ Synchronous Peer-to-Peer Grid (Facing Each Other)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Student's Own Live Camera Node */}
                    <div className="relative h-32 sm:h-40 rounded-2xl bg-black border-2 border-indigo-500/40 overflow-hidden shadow-md group flex flex-col items-center justify-center">
                      <video
                        ref={studentVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover ${studentCamOn ? "block" : "hidden"}`}
                      />
                      {!studentCamOn && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0c0c14] z-10">
                          <span className="text-3xl mb-1">{user.avatar}</span>
                          <span className="text-[0.65rem] text-slate-500 font-mono">Cam Muted</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-between gap-1 z-20">
                        <span className="text-[0.6rem] font-bold text-indigo-300 truncate">You ({user.name.split(" ")[0]})</span>
                        <span className="text-[0.6rem]">{studentMicOn ? "🎙️" : "🔇"}</span>
                      </div>
                    </div>

                    {/* Render Other Joined Participants dynamically */}
                    {liveSession.participants?.filter(p => p.name !== user.name).map((p, idx) => (
                      <div key={idx} className="relative h-32 sm:h-40 rounded-2xl bg-[#0c0c14] border border-white/5 overflow-hidden shadow-md flex flex-col items-center justify-center group hover:border-white/10 transition-colors">
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                          <span className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-white/5 flex items-center justify-center text-lg font-bold text-white shadow-inner mb-2">
                            {p.avatar || p.name.split(" ").map(w => w[0]).join("")}
                          </span>
                          <span className="text-xs font-bold text-slate-300 truncate max-w-full">{p.name.split(" ")[0]}</span>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-between gap-1">
                          <span className="text-[0.6rem] font-bold text-slate-400 truncate">{p.name}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Interactive Live Poll Module Push by Teacher */}
                {poll?.active && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-2 border-indigo-500/30 backdrop-blur-xl shadow-xl flex flex-col gap-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-indigo-500/20 border-l border-b border-indigo-500/30 text-[0.6rem] font-mono font-bold text-indigo-300 uppercase">
                      Live Assessment Poll
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex-shrink-0">
                        📊
                      </span>
                      <div className="flex flex-col min-w-0 pr-16">
                        <span className="text-xs font-mono font-bold text-indigo-400 block uppercase tracking-wide">
                          Teacher Pushed Poll Matrix
                        </span>
                        <span className="text-sm font-extrabold text-white block mt-0.5 leading-snug font-display">
                          {poll.question}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 mt-1">
                      {poll.options.map((opt, idx) => {
                        const totalVotes = poll.votes?.reduce((a, b) => a + b, 0) || 1;
                        const pct = Math.round(((poll.votes?.[idx] || 0) / totalVotes) * 100);
                        const isSelected = selectedOption === idx;

                        return (
                          <div key={idx} className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                if (!hasVoted) {
                                  setSelectedOption(idx);
                                }
                              }}
                              disabled={hasVoted}
                              className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-3 ${hasVoted
                                ? "bg-white/[0.02] border-white/5 text-slate-300 cursor-default"
                                : isSelected
                                  ? "bg-indigo-500/20 border-indigo-500 text-white shadow-md scale-[1.01]"
                                  : "bg-white/5 hover:bg-white/10 border-white/5 text-slate-300 hover:text-white cursor-pointer"
                                }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[0.65rem] font-mono font-extrabold flex-shrink-0 ${isSelected ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-400"
                                  }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span className="truncate block flex-1">{opt}</span>
                              </div>
                              {hasVoted && (
                                <span className="font-mono font-bold text-indigo-400 text-xs flex-shrink-0">
                                  {pct}% ({poll.votes?.[idx] || 0})
                                </span>
                              )}
                            </button>

                            {/* Response Distribution Progress Bar */}
                            {hasVoted && (
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.5, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!hasVoted ? (
                      <button
                        onClick={() => {
                          if (selectedOption !== null) {
                            votePoll(selectedOption);
                            setHasVoted(true);
                            // Also award standard engagement bonus XP!
                            setXp(x => x + 20);
                            showXpToast(20, "Poll Submitted!");
                          }
                        }}
                        disabled={selectedOption === null}
                        className={`py-3 rounded-xl text-xs font-bold font-display uppercase tracking-wider transition-all mt-2 ${selectedOption !== null
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg cursor-pointer active:scale-95"
                          : "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
                          }`}
                      >
                        ✓ Submit Response Matrix
                      </button>
                    ) : (
                      <span className="text-center text-[0.65rem] text-emerald-400 font-mono font-bold block mt-1">
                        ✓ Response registered to dashboard live stream. Results tracking real-time.
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Dashboard quick controls */}
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
                  <button
                    onClick={toggleStudentCam}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${studentCamOn
                      ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                      : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                      }`}
                  >
                    <span>📷</span>
                    <span>{studentCamOn ? "Camera Active" : "Camera Muted"}</span>
                  </button>
                  <button
                    onClick={toggleStudentMic}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${studentMicOn
                      ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                      : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                      }`}
                  >
                    <span>🎙</span>
                    <span>{studentMicOn ? "Mic Live" : "Mic Muted"}</span>
                  </button>
                  <button
                    onClick={() => setLiveRaised(r => !r)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${liveRaised
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                      }`}
                  >
                    <span>✋</span>
                    <span>{liveRaised ? "Hand Raised Priority" : "Raise Hand Request"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setJoinedLive(false);
                      studentStreamRef.current?.getTracks().forEach(t => t.stop());
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-colors cursor-pointer ml-auto"
                  >
                    ⏹ Leave Session
                  </button>
                </div>

                {/* Engagement Reactions stream */}
                <div className="flex items-center gap-2 flex-wrap p-4 rounded-2xl bg-white/5 border border-white/5">
                  {Object.entries(liveReactions).map(([emoji, count]) => (
                    <motion.button
                      key={emoji}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLiveReactions(r => ({ ...r, [emoji]: r[emoji] + 1 }))}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{emoji}</span>
                      <span className="text-[0.65rem] font-mono text-slate-400">{count}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 6: FOCUS TIMER */}
        {tab === "timer" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-lg mx-auto w-full gap-6 py-6"
          >
            {/* Multi-pod selector */}
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/5 w-full max-w-xs">
              <button
                type="button"
                onClick={() => {
                  setTimerMode("focus");
                  setTimerTime(1500);
                  setTimerRunning(false);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${timerMode === "focus"
                  ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white border border-white/10"
                  : "text-slate-400"
                  }`}
              >
                Focus Pod (25m)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerMode("break");
                  setTimerTime(300);
                  setTimerRunning(false);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${timerMode === "break"
                  ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white border border-white/10"
                  : "text-slate-400"
                  }`}
              >
                Break Pod (5m)
              </button>
            </div>

            {/* Glowing circle timer display */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={timerMode === "focus" ? "#8b5cf6" : "#10b981"}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - progress}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-extrabold text-white font-display tracking-tighter block">
                  {mins}:{secs}
                </span>
                <span className="text-[0.65rem] font-mono tracking-widest text-slate-400 font-bold uppercase mt-1">
                  {timerMode === "focus" ? "Synchronous Block" : "Recharge Interval"}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimerRunning(true)}
                disabled={timerRunning}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer uppercase tracking-wider font-display"
              >
                ▶ Start Segment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimerRunning(false)}
                disabled={!timerRunning}
                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer uppercase tracking-wider font-display"
              >
                ⏸ Pause
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setTimerTime(timerMode === "focus" ? 1500 : 300);
                  setTimerRunning(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white font-bold text-xs transition-colors cursor-pointer uppercase tracking-wider font-display"
              >
                ↺ Reset
              </motion.button>
            </div>

            <span className="text-xs text-slate-500 font-mono mt-2">
              🍅 Segments verified today: <strong className="text-white">{sessions}</strong>
            </span>
          </motion.div>
        )}

        {/* TAB 7: ACHIEVEMENTS & LEADERBOARD */}
        {tab === "gamify" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left stats hub */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">
                    ✦ Telemetry Stats Summary
                  </span>
                  {/* My Rank Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-between gap-4 mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {myRank === 1 ? "🥇" : myRank === 2 ? "🥈" : myRank === 3 ? "🥉" : `#${myRank}`}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block">Your Current Rank</span>
                        <span className="text-[0.65rem] text-indigo-300 font-mono">Out of {liveLeaderboard.length} students</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-extrabold text-indigo-400 font-mono">{xp} XP</span>
                      <span className="text-[0.65rem] text-slate-500 font-mono">Level {Math.floor(xp / 500) + 1}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Study Streak", val: "7 Days 🔥", accent: "text-amber-400" },
                      { label: "Quizzes Done", val: `${quizzesCompleted} 🎮`, accent: "text-blue-400" },
                      { label: "Submissions", val: `${tasks.filter((t) => t.status !== "pending").length + assignmentsSubmitted}/${tasks.length + (sharedAssignments?.length || 0)}`, accent: "text-emerald-400" },
                      { label: "Badges Unlocked", val: `${earnedBadges.length}/${ALL_BADGES.length}`, accent: "text-purple-400" },
                    ].map((s, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className={`block text-sm font-extrabold font-mono ${s.accent}`}>
                          {s.val}
                        </span>
                        <span className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Leaderboard stream — live sorted */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  🏅 Live Class Rankings
                </span>
                {liveLeaderboard.map((s, i) => (
                  <div
                    key={s.name}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${s.isMe
                      ? "bg-indigo-500/10 border border-indigo-500/20"
                      : "bg-white/[0.02] border border-transparent"
                      }`}
                  >
                    <span className="w-5 text-center font-bold text-xs text-slate-500">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${s.isMe
                        ? "bg-gradient-to-tr from-blue-600 to-purple-600 text-white"
                        : "bg-white/5 text-slate-300"
                        }`}
                    >
                      {s.avatar}
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-white truncate">
                        {s.name}{" "}
                        {s.isMe && (
                          <span className="text-[0.6rem] text-indigo-400 font-bold">(You)</span>
                        )}
                      </span>
                      <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5">
                        🔥 {s.streak}d · 🏅 {s.badges} badges
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-extrabold flex-shrink-0 ${s.isMe ? "text-indigo-400" : "text-slate-400"
                      }`}>
                      {s.xp} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* All Badges display array */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-4">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block">
                ✦ All Discoverable Achievement Tokens
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ALL_BADGES.map((b) => {
                  const earned = earnedBadges.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      className={`p-3.5 rounded-2xl border transition-all ${earned
                        ? "bg-indigo-500/10 border-indigo-500/30 opacity-100"
                        : "bg-white/[0.02] border-white/5 opacity-40"
                        }`}
                    >
                      <span className="text-xl block mb-1">{b.icon}</span>
                      <span className={`block text-xs font-bold ${earned ? "text-indigo-300" : "text-slate-400"}`}>
                        {b.label}
                      </span>
                      <span className="text-[0.65rem] text-slate-500 block leading-tight mt-0.5">
                        {b.desc}
                      </span>
                      {!earned && (
                        <span className="text-[0.6rem] font-mono text-slate-600 block mt-2">
                          Requires {b.xpRequired} XP
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 8: QUIZ SANDBOX */}
        {tab === "quiz" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-bold text-white px-1">Quiz Matrix Execution</span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-bold">
                  ⚡ {xp} XP Sync
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-bold">
                  Lv. {level}
                </span>
              </div>
            </div>
            <QuizGame user={user} xp={xp} setXp={setXp} earnedBadges={earnedBadges} setEarnedBadges={setEarnedBadges} onQuizComplete={handleQuizComplete} />
          </motion.div>
        )}

        {/* TAB 9: SMART ANALYZER */}
        {tab === "analyzer" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 max-w-2xl mx-auto w-full"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col gap-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Paste raw buffer for AI verification
              </span>
              <textarea
                rows={6}
                placeholder="Paste your essay or answer text buffer here to execute deep heuristic analysis…"
                value={analyzerText}
                onChange={(e) => setAnalyzerText(e.target.value)}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder:text-slate-600 leading-relaxed"
              />
              <button
                onClick={analyzeAssignment}
                disabled={analyzerLoading || !analyzerText.trim()}
                className="py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer disabled:opacity-50 font-display uppercase tracking-wider"
              >
                {analyzerLoading ? "Executing neural analysis pipeline…" : "🔍 Execute Neural Scan →"}
              </button>
            </div>

            {analyzerResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col gap-6"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Plagiarism", val: analyzerResult.plagiarism, s: "%", accent: "text-amber-400" },
                    { label: "Grammar Index", val: analyzerResult.grammar, s: "%", accent: "text-blue-400" },
                    { label: "Predicted Band", val: analyzerResult.predicted, s: "%", accent: "text-purple-400" },
                    { label: "Word Array", val: analyzerResult.words, s: "", accent: "text-emerald-400" },
                  ].map((s, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center justify-between">
                      <span className={`text-xl font-extrabold font-mono block ${s.accent}`}>
                        {s.val}{s.s}
                      </span>
                      <span className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-wider block mt-1">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col gap-1.5">
                  <span className="text-[0.65rem] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                    AI Automated Heuristic Feedback
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {analyzerResult.feedback}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* TAB 10: PEER CHAT */}
        {tab === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-[500px] rounded-3xl bg-[#0c0c14]/90 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl max-w-2xl mx-auto w-full"
          >
            {/* Title Bar */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Synchronous Peer Message Pipeline
              </span>
              <span className="text-[0.65rem] text-slate-500 font-mono">End-to-End synced</span>
            </div>

            {/* Feed stream */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((m) => {
                const mine = m.sender === "You";
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 max-w-[85%] ${mine ? "self-end flex-row-reverse" : "self-start"
                      }`}
                  >
                    {!mine && (
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0 mt-1">
                        {m.avatar}
                      </span>
                    )}
                    <div className="flex flex-col min-w-0">
                      {!mine && (
                        <span className="text-[0.65rem] font-bold text-slate-500 px-1 mb-0.5 block">
                          {m.sender}
                        </span>
                      )}
                      <div
                        className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${mine
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm"
                          : "bg-white/5 border border-white/5 text-slate-200 rounded-bl-sm"
                          }`}
                      >
                        {m.text}
                      </div>
                      <span
                        className={`text-[0.6rem] text-slate-600 font-mono px-1 mt-1 block ${mine ? "text-right" : "text-left"
                          }`}
                      >
                        {m.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input buffer trigger */}
            <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a payload payload…"
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm focus:outline-none px-2 placeholder:text-slate-600"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                Send ↑
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 11: AI TUTOR NODE */}
        {tab === "ai" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-[500px] rounded-3xl bg-[#0c0c14]/90 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl max-w-2xl mx-auto w-full"
          >
            {/* Title Bar */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🤖</span> AI Study Tutor Interface
              </span>
              <span className="text-[0.65rem] text-slate-500 font-mono">Context Stream Open</span>
            </div>

            {/* Convo Feed stream */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {aiHistory.length === 0 && (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center my-auto max-w-sm mx-auto flex flex-col items-center">
                  <span className="text-3xl mb-2 block animate-bounce">🧠</span>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Hi {user.name.split(" ")[0]}! I'm your AI academic tutor.
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Ask me anything — automated assignment tips, heuristics, complex concept distillations, or exam simulations.
                  </p>
                  <div className="flex flex-col gap-1.5 w-full">
                    {[
                      "Explain Newton's 3rd Law with an example",
                      "Solve: 2x² + 5x - 3 = 0",
                      "Summarize photosynthesis process",
                      "Help me write an essay introduction",
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAiInput(p)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[0.7rem] text-slate-300 hover:text-white transition-colors text-left truncate block cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiHistory.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col gap-1 max-w-[85%] ${m.role === "user" ? "self-end items-end" : "self-start items-start"
                    }`}
                >
                  <span className="text-[0.6rem] font-mono font-bold text-slate-500 px-1 uppercase tracking-wider block">
                    {m.role === "user" ? "You" : "AI"}
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${m.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm"
                      : "bg-white/5 border border-white/5 text-slate-200 rounded-bl-sm"
                      }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="self-start flex flex-col gap-1 max-w-[85%] items-start">
                  <span className="text-[0.6rem] font-mono font-bold text-slate-500 px-1 uppercase tracking-wider block">AI</span>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input prompt line */}
            <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center gap-2">
              <textarea
                rows={1}
                placeholder="Ask your question buffer…"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    askAI();
                  }
                }}
                className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm focus:outline-none resize-none py-1 px-2 placeholder:text-slate-600"
              />
              <button
                onClick={askAI}
                disabled={aiLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
              >
                Send ↑
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}