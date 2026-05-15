import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotes, useAssignments, useLiveSession, usePoll, fileToDataURL, useGrades, useXp } from "../hooks/useClassroomStore";

const INITIAL_STUDENTS = [
  { id: "s1", name: "Riya Patel", grade: "10-A", avatar: "RP", scores: { Math: 92, Physics: 88, English: 95, Chemistry: 79 }, attendance: 94, status: "online" },
  { id: "s2", name: "Aarav Singh", grade: "10-A", avatar: "AS", scores: { Math: 78, Physics: 85, English: 72, Chemistry: 91 }, attendance: 87, status: "online" },
  { id: "s3", name: "Kavya Nair", grade: "10-B", avatar: "KN", scores: { Math: 96, Physics: 93, English: 89, Chemistry: 87 }, attendance: 98, status: "away" },
  { id: "s4", name: "Dev Sharma", grade: "10-A", avatar: "DS", scores: { Math: 65, Physics: 70, English: 80, Chemistry: 68 }, attendance: 76, status: "offline" },
  { id: "s5", name: "Priya Joshi", grade: "10-B", avatar: "PJ", scores: { Math: 88, Physics: 91, English: 94, Chemistry: 86 }, attendance: 92, status: "online" },
];

const INIT_TASKS = [
  { id: 1, title: "Chapter 5 Problems", subject: "Math", due: "2025-05-15", assigned: "10-A", submissions: 3, total: 3, status: "active" },
  { id: 2, title: "Lab Report: Pendulum", subject: "Physics", due: "2025-05-18", assigned: "10-A", submissions: 1, total: 3, status: "active" },
  { id: 3, title: "Essay: Shakespeare", subject: "English", due: "2025-05-12", assigned: "10-B", submissions: 2, total: 2, status: "completed" },
];

const TIMETABLE_DEFAULT = [
  { time: "08:00 AM", subject: "Mathematics", type: "Lecture", accent: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/10" },
  { time: "09:30 AM", subject: "Physics", type: "Lab Session", accent: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
  { time: "11:00 AM", subject: "English Literature", type: "Seminar", accent: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
  { time: "01:00 PM", subject: "Break / Lunch", type: "30 min", accent: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
  { time: "02:00 PM", subject: "Chemistry", type: "Practical", accent: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" },
];

// ── Toast notification component ───────────────────────────────────────────
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="fixed top-24 right-6 z-50 p-4 rounded-2xl bg-[#0c0c14]/95 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl flex items-center gap-3 max-w-sm"
    >
      <span className="text-xl animate-pulse">🔴</span>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-bold text-white truncate">{message.title}</span>
        <span className="text-[0.65rem] text-slate-400 leading-tight block mt-0.5">
          {message.body}
        </span>
      </div>
      <button
        onClick={onClose}
        className="p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
      >
        ✕
      </button>
    </motion.div>
  );
}

// ── Live Session component (WebRTC camera + mic) ────────────────────────────
function LiveSession({ user, students, liveSession, poll, pushPoll, closePoll, onEnd }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [chat, setChat] = useState([
    { sender: "Riya Patel", text: "Joining stream setup!", time: "just now" },
    { sender: "Aarav Singh", text: "Audio and video crystal clear, sir!", time: "just now" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [pollActive, setPollActive] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["Option A", "Option B", "Option C"]);
  const chatEndRef = useRef(null);

  // start camera stream simulation logic
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        /* silent fallback if simulated or deniable permissions */
      });

    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      clearInterval(iv);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = !camOn;
    });
    setCamOn((v) => !v);
  };

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = !micOn;
    });
    setMicOn((v) => !v);
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const watching = liveSession?.participants?.length || students.filter((s) => s.status !== "offline").length;

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChat((c) => [...c, { sender: "You (Teacher)", text: chatInput, time: "now" }]);
    setChatInput("");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      {/* Main Broadcast Screen */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono font-bold text-red-400">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
            <span>STUDIO LIVE MATRIX · {watching} peer endpoints synchronized</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 hidden sm:inline">⏱ {fmt(elapsed)}</span>
            <button
              onClick={() => {
                streamRef.current?.getTracks().forEach((t) => t.stop());
                if (poll?.active) closePoll();
                onEnd();
              }}
              className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors cursor-pointer text-xs uppercase tracking-wider"
            >
              ⏹ Terminate Stream
            </button>
          </div>
        </div>

        {/* Primary Broadcast Player Feed */}
        <div className="flex flex-col gap-2">
          <span className="text-[0.65rem] font-mono font-bold text-slate-400 uppercase tracking-widest px-1">
            ✦ Educator Broadcast Stream (You)
          </span>
          <div className="relative h-64 sm:h-80 rounded-3xl bg-black border border-white/10 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${camOn ? "block" : "hidden"}`}
            />
            {!camOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-[#06060a]/95 z-10">
                <span className="text-6xl mb-3 animate-pulse">{user.avatar}</span>
                <span className="font-extrabold text-white text-base tracking-tight block">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                  Broadcasting Stream Idle (Camera Muted)
                </span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[0.65rem] font-bold text-white z-20">
              🎙️ You (Educator Host)
            </div>
          </div>
        </div>

        {/* Zoom-Style Video Grid: "Facing Each Other" */}
        <div className="flex flex-col gap-2">
          <span className="text-[0.65rem] font-mono font-bold text-slate-400 uppercase tracking-widest px-1">
            ✦ Synchronous Participant Grid (Facing Each Other)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* List synced WebRTC endpoint participants dynamically */}
            {liveSession?.participants?.map((p, idx) => (
              <div key={idx} className="relative h-32 sm:h-40 rounded-2xl bg-[#0c0c14] border border-white/10 overflow-hidden shadow-md flex flex-col items-center justify-center group hover:border-indigo-500/40 transition-colors">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <span className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-white/5 flex items-center justify-center text-lg font-bold text-white shadow-inner mb-2">
                    {p.avatar || p.name.split(" ").map(w=>w[0]).join("")}
                  </span>
                  <span className="text-xs font-bold text-slate-300 truncate max-w-full">{p.name.split(" ")[0]}</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-between gap-1">
                  <span className="text-[0.6rem] font-bold text-slate-400 truncate">{p.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                </div>
              </div>
            ))}
            {(!liveSession?.participants || liveSession.participants.length === 0) && (
              <div className="col-span-full p-8 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-2xl animate-spin">⌛</span>
                <span className="text-xs text-slate-400 font-mono">Awaiting student client endpoint handshakes... Global toast notifications deployed.</span>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard quick commands */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleCam}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              camOn
                ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
            }`}
          >
            <span>📷</span>
            <span>{camOn ? "Camera Live Stream" : "Camera Muted"}</span>
          </button>
          <button
            onClick={toggleMic}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              micOn
                ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
            }`}
          >
            <span>🎙</span>
            <span>{micOn ? "Audio Feed Active" : "Muted"}</span>
          </button>
          <button
            onClick={() => {
              setPollActive(true);
              if (!pollQuestion) setPollQuestion("How clear is the quadratic derivation module so far?");
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors cursor-pointer"
          >
            📊 Configure Interactive Poll
          </button>
        </div>

        {/* Live Custom Poll Synced Module */}
        {poll?.active && (
          <div className="p-6 rounded-3xl bg-white/5 border-2 border-emerald-500/30 flex flex-col gap-4 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-emerald-500/20 border-l border-b border-emerald-500/30 text-[0.6rem] font-mono font-bold text-emerald-300 uppercase">
              Live Broadcast Assessment Poll Active
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                📊
              </span>
              <div className="flex flex-col min-w-0 pr-16">
                <span className="text-xs font-mono font-bold text-emerald-400 block uppercase tracking-wider">
                  Live Response Distribution Tracker
                </span>
                <span className="text-sm font-extrabold text-white block mt-0.5 font-display">
                  {poll.question}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-1">
              {poll.options.map((opt, idx) => {
                const totalVotes = poll.votes?.reduce((a, b) => a + b, 0) || 1;
                const count = poll.votes?.[idx] || 0;
                const pct = Math.round((count / totalVotes) * 100);

                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-bold gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[0.65rem] font-mono font-extrabold text-slate-400 flex-shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-slate-300 truncate">{opt}</span>
                      </div>
                      <span className="font-mono text-emerald-400 flex-shrink-0">{pct}% ({count})</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={closePoll}
              className="self-end px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[0.65rem] font-bold transition-colors cursor-pointer uppercase tracking-wider mt-1"
            >
              🛑 Terminate Active Poll
            </button>
          </div>
        )}

        {/* Configure Poll Form Module */}
        <AnimatePresence>
          {pollActive && !poll?.active && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex flex-col gap-4"
            >
              <span className="text-xs font-mono font-bold text-slate-300 block uppercase tracking-wider">
                📊 Configure Matrix Parameters
              </span>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Type lesson poll inquiry segment…"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />

              <div className="flex flex-col gap-2">
                <span className="text-[0.65rem] font-mono text-slate-400 font-bold block">Options List</span>
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[0.65rem] font-mono font-bold text-slate-400 flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const o = [...pollOptions];
                        o[i] = e.target.value;
                        setPollOptions(o);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2 mt-2">
                <button
                  onClick={() => setPollActive(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[0.65rem] font-bold text-slate-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (pollQuestion.trim()) {
                      pushPoll({ question: pollQuestion, options: pollOptions });
                      setPollActive(false);
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold shadow-md active:scale-95 transition-all cursor-pointer font-display uppercase tracking-wider"
                >
                  🚀 Broadcast Live Poll →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Synchronous Chat Side Feed */}
      <div className="w-full lg:w-72 h-[450px] lg:h-auto rounded-3xl bg-white/5 border border-white/5 overflow-hidden flex flex-col flex-shrink-0">
        <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 text-[0.65rem] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
          <span>Live Chat Dispatch</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
          {chat.map((m, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              <span className="text-[0.6rem] font-mono font-bold text-slate-500 px-1">
                {m.sender}
              </span>
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-200 leading-relaxed">
                {m.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-2 bg-white/[0.02] border-t border-white/5 flex items-center gap-1.5">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat()}
            placeholder="Broadcast buffer…"
            className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none px-2 placeholder:text-slate-600"
          />
          <button
            onClick={sendChat}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherApp({ user }) {
  const [tab, setTab] = useState("dashboard");
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [announcements, setAnnouncements] = useState([
    { id: 1, text: "Midterm exams scheduled for May 20-24. Preparation materials uploaded.", time: "2h ago", pinned: true },
    { id: 2, text: "Parent-teacher meeting on May 16. Please update attendance records.", time: "5h ago", pinned: false },
  ]);
  const [newTask, setNewTask] = useState({ title: "", subject: "", due: "", assigned: "10-A", desc: "" });
  const [newAnn, setNewAnn] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "Riya Patel", text: "Can you clarify Q3 from today's homework?", time: "10:32 AM", avatar: "RP" },
    { id: 2, sender: "You", text: "Sure! Apply p = mv and use conservation of momentum.", time: "10:35 AM", avatar: user?.avatar || "U" },
    { id: 3, sender: "Aarav Singh", text: "What time is tomorrow's lab session?", time: "11:02 AM", avatar: "AS" },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiHistory, setAiHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [attendanceDate] = useState(new Date().toLocaleDateString());
  const [attendance, setAttendance] = useState(() => Object.fromEntries(INITIAL_STUDENTS.map((s) => [s.id, true])));
  const [liveActive, setLiveActive] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Shared Classroom Store hooks ──
  const { notes, addNote, deleteNote } = useNotes();
  const { assignments: sharedAssignments, addAssignment } = useAssignments();
  const { liveSession, startSession, endSession } = useLiveSession();
  const { poll, pushPoll, closePoll } = usePoll();
  const { grades, updateGrade: broadcastGrade } = useGrades();
  const { studentXp } = useXp();

  // Sync shared grades/xp into local students state
  useEffect(() => {
    setStudents((prev) =>
      prev.map((s) => {
        const sharedScores = grades[s.id];
        const sharedXp = studentXp[s.id];
        if (sharedScores || sharedXp !== undefined) {
          return {
            ...s,
            scores: { ...s.scores, ...sharedScores },
            xp: sharedXp !== undefined ? sharedXp : s.xp,
          };
        }
        return s;
      })
    );
  }, [grades, studentXp]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [noteFile, setNoteFile] = useState(null);
  const [taskFile, setTaskFile] = useState(null);
  const noteFileRef = useRef(null);
  const taskFileRef = useRef(null);

  // Timetable metrics
  const [ttSubjects, setTtSubjects] = useState("Math, Physics, English, Chemistry");
  const [ttHours, setTtHours] = useState("6");
  const [ttExam, setTtExam] = useState("2025-05-25");
  const [ttSchedule, setTtSchedule] = useState(null);
  const [ttLoading, setTtLoading] = useState(false);

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

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

  const addTask = async () => {
    if (!newTask.title || !newTask.subject || !newTask.due) return;
    const total = students.filter((s) => newTask.assigned === "all" || s.grade === newTask.assigned).length;
    let fileData = null;
    if (taskFile) {
      fileData = { name: taskFile.name, size: (taskFile.size / 1024).toFixed(1) + " KB", dataUrl: await fileToDataURL(taskFile) };
    }
    const taskObj = { id: Date.now(), ...newTask, submissions: 0, total, status: "active" };
    setTasks((t) => [...t, taskObj]);
    // Sync to shared store so students see it
    addAssignment({ title: newTask.title, subject: newTask.subject, due: newTask.due, assigned: newTask.assigned, desc: newTask.desc, teacher: user.name, file: fileData });
    setNewTask({ title: "", subject: "", due: "", assigned: "10-A", desc: "" });
    setTaskFile(null);
    if (taskFileRef.current) taskFileRef.current.value = "";
  };

  const addAnnouncement = () => {
    if (!newAnn.trim()) return;
    setAnnouncements((a) => [{ id: Date.now(), text: newAnn, time: "Just now", pinned: false }, ...a]);
    setNewAnn("");
  };

  const handleUploadNote = async () => {
    if (!noteTitle.trim() || !noteSubject.trim()) return;
    let fileData = null;
    if (noteFile) {
      fileData = { name: noteFile.name, size: (noteFile.size / 1024).toFixed(1) + " KB", dataUrl: await fileToDataURL(noteFile) };
    }
    addNote({ title: noteTitle, subject: noteSubject, description: noteDesc, file: fileData, teacher: user.name });
    setNoteTitle(""); setNoteSubject(""); setNoteDesc(""); setNoteFile(null);
    if (noteFileRef.current) noteFileRef.current.value = "";
    setToast({ title: "📝 Note Uploaded!", body: `"${noteTitle}" is now available to all students.` });
  };

  const startLiveSession = () => {
    setLiveActive(true);
    startSession({ name: user.name, avatar: user.avatar, subject: user.subject || "General" });
    setToast({
      title: "🔴 Live Session Started!",
      body: `${students.filter((s) => s.status !== "offline").length} registered nodes deployed alerts.`,
    });
    setTab("live");
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
                  text: `You are an expert AI teaching assistant for ${user.name}, a ${user.subject || "subject"} teacher. Help with lesson plans, rubrics, student queries, explanations. Be concise and practical.`,
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
        { role: "assistant", content: "AI Core cached response directly: Lesson heuristics compiled natively. Roster updates deployed." },
      ]);
    }
    setAiLoading(false);
  };

  const handleDownload = (item, type = "submission") => {
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
      if (type === "submission") {
        content = `Submission by: ${item.studentName}\nSubmitted: ${new Date(item.submittedAt || Date.now()).toLocaleString()}\n\nAnswer/Content:\n${item.text || "No text provided."}`;
        filename = `Submission_${item.studentName.replace(/\s+/g, "_")}.txt`;
      } else if (type === "task") {
        content = `Task: ${item.title}\nSubject: ${item.subject}\nDeadline: ${item.due}\nTeacher: ${item.teacher || "Teacher"}\n\nInstructions/Parameters:\n${item.desc || "No special instructions."}`;
        filename = `${item.title.replace(/\s+/g, "_")}_Task.txt`;
      } else if (type === "note") {
        content = `Title: ${item.title}\nSubject: ${item.subject}\nUploaded: ${new Date(item.uploadedAt || Date.now()).toLocaleString()}\nTeacher: ${item.teacher || "Teacher"}\n\nDescription:\n${item.description || "No description provided."}`;
        filename = `${item.title.replace(/\s+/g, "_")}_Note.txt`;
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

  const avgScore = (s) => Math.round(Object.values(s.scores).reduce((a, b) => a + b, 0) / 4);

  const updateGrade = (studentId, subject, val) => {
    const score = Number(val);
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, scores: { ...s.scores, [subject]: score } } : s))
    );
    // Broadcast to students
    broadcastGrade(studentId, subject, score);
  };

  const generateTimetable = async () => {
    setTtLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const subjects = ttSubjects.split(",").map((s) => s.trim()).filter(Boolean);
    const hours = parseInt(ttHours) || 6;
    const slots = [];
    let startHour = 7;

    subjects.forEach((sub, i) => {
      const h = Math.floor(hours / subjects.length) + (i === 0 ? hours % subjects.length : 0);
      slots.push({
        time: `${String(startHour).padStart(2, "0")}:00`,
        subject: sub,
        duration: `${h}h`,
        type: i % 2 === 0 ? "Lecture Node" : "Practical Module",
        priority: i < 2 ? "High Priority" : "Standard",
        accent: i % 2 === 0 ? "text-indigo-400" : "text-emerald-400",
        border: i % 2 === 0 ? "border-indigo-500/20" : "border-emerald-500/20",
        bg: i % 2 === 0 ? "bg-indigo-500/10" : "bg-emerald-500/10",
      });
      startHour += h + 1;
      if (startHour < 24) {
        slots.push({
          time: `${String(startHour - 1).padStart(2, "0")}:00`,
          subject: "Heuristic Rest / Compilation Break",
          duration: "15 min",
          type: "Cooldown",
          priority: "—",
          accent: "text-slate-400",
          border: "border-white/5",
          bg: "bg-white/[0.02]",
        });
      }
    });

    setTtSchedule({ slots, exam: ttExam, totalHours: hours });
    setTtLoading(false);
  };

  const tabsList = [
    { id: "dashboard", label: "Dashboard Core", icon: "📊" },
    { id: "students", label: "Student Roster", icon: "👥" },
    { id: "notes", label: "Notes Upload", icon: "📓" },
    { id: "tasks", label: "Task Dispatch", icon: "📝" },
    { id: "grades", label: "Gradebook Matrix", icon: "⭐" },
    { id: "attendance", label: "Attendance Core", icon: "✅" },
    { id: "live", label: "Broadcast Hub", icon: "🎥" },
    { id: "timetable", label: "Schedule Builder", icon: "📅" },
    { id: "chat", label: "Direct Sync Channel", icon: "💬" },
    { id: "announcements", label: "Global Notices", icon: "📢" },
    { id: "ai", label: "Copilot Interface", icon: "🤖" },
  ];

  return (
    <div className="min-h-[calc(100vh-96px)] py-8 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-stretch relative">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Educator Navigation Framework Sidebar */}
      <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
        {/* Active Identity Block */}
        <div className="p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex items-center gap-4 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-md flex-shrink-0">
            {user.avatar}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate">{user.name}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono mt-0.5">
              <span>📚</span> Educator · {user.subject || "ITM"}
            </span>
          </div>
        </div>

        {/* Modular route switches */}
        <nav className="flex lg:flex-col gap-1.5 p-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md overflow-x-auto lg:overflow-x-visible">
          {tabsList.map((t) => {
            const active = tab === t.id;
            return (
              <motion.button
                key={t.id}
                whileHover={{ x: active ? 0 : 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all flex-shrink-0 lg:flex-shrink relative cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-white border border-white/10 shadow-inner"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-base flex-shrink-0">{t.icon}</span>
                <span className="truncate block">{t.label}</span>
                {active && (
                  <motion.div
                    layoutId="teacherSidebarActiveIndicator"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    className="absolute inset-0 border border-purple-500/30 rounded-xl pointer-events-none"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </aside>

      {/* Main Studio Console Content area */}
      <main className="flex-1 min-w-0 flex flex-col gap-6">
        {/* Notice telemetry bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex-shrink-0">
              🤖
            </span>
            <div>
              <span className="block text-xs font-bold text-white">
                Good morning, {user.name.split(" ").slice(-1)[0]}! Studio Framework fully initialized.
              </span>
              <span className="text-xs text-slate-400 block mt-0.5">
                👥 {students.length} monitored students · 📝{" "}
                {tasks.filter((t) => t.status === "active").length} ongoing pipelines · ✅{" "}
                {Object.values(attendance).filter(Boolean).length}/{students.length} telemetry verification rate today.
              </span>
            </div>
          </div>
          <button
            onClick={() => setTab("ai")}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors cursor-pointer self-stretch sm:self-auto text-center"
          >
            Ask Educator Copilot →
          </button>
        </motion.div>

        {/* TAB 1: DASHBOARD CORE */}
        {tab === "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Array metrics preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Roster Enrolled", val: students.length, icon: "👥", accent: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/10" },
                { label: "Active Pipelines", val: tasks.filter((t) => t.status === "active").length, icon: "📝", accent: "text-purple-400", border: "border-purple-500/20", bg: "bg-purple-500/10" },
                { label: "Average Metric", val: Math.round(students.reduce((a, s) => a + avgScore(s), 0) / students.length) + "%", icon: "⭐", accent: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" },
                { label: "Presence Ratio", val: `${Object.values(attendance).filter(Boolean).length}/${students.length}`, icon: "✅", accent: "text-indigo-400", border: "border-indigo-500/20", bg: "bg-indigo-500/10" },
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

            {/* Split layout streams */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Tasks */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-4">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block">
                  ✦ Active Evaluation Workloads
                </span>
                <div className="flex flex-col gap-3">
                  {tasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate">{t.title}</span>
                        <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5">
                          {t.subject} · Target: {t.due}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-28">
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            style={{ width: `${(t.submissions / t.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-[0.65rem] font-mono font-bold text-slate-400 flex-shrink-0">
                          {t.submissions}/{t.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Performance Matrix */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-4">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block">
                  ✦ Roster Synthesis Metrics
                </span>
                <div className="flex flex-col gap-3">
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[0.65rem] font-bold text-slate-300 flex-shrink-0">
                        {s.avatar}
                      </span>
                      <span className="text-xs font-bold text-slate-300 w-20 truncate">
                        {s.name.split(" ")[0]}
                      </span>
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            avgScore(s) >= 85 ? "bg-emerald-500" : avgScore(s) >= 70 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${avgScore(s)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-white w-8 text-right flex-shrink-0">
                        {avgScore(s)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: STUDENT ROSTER */}
        {tab === "students" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <span className="text-sm font-bold text-white px-1">Registered Student Entities</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between gap-4 group hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-white/5 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-inner">
                        {s.avatar}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate block">{s.name}</span>
                        <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5 block">
                          Band {s.grade}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        s.status === "online"
                          ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                          : s.status === "away"
                          ? "bg-amber-500"
                          : "bg-slate-600"
                      }`}
                      title={s.status}
                    />
                  </div>

                  {/* Micro list of variables */}
                  <div className="flex flex-col gap-1.5 py-2 border-y border-white/5">
                    {Object.entries(s.scores).map(([sub, score]) => (
                      <div key={sub} className="flex items-center justify-between text-[0.65rem]">
                        <span className="text-slate-400 font-mono">{sub}</span>
                        <div className="flex items-center gap-2 w-32">
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-white w-6 text-right">{score}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[0.65rem] font-mono">
                    <span className="text-slate-500">
                      SYNTHESIS AVG: <strong className="text-indigo-400">{avgScore(s)}%</strong>
                    </span>
                    <span className="text-slate-500">
                      ATTENDANCE RATE: <strong className="text-emerald-400">{s.attendance}%</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* NOTES UPLOAD TAB */}
        {tab === "notes" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Upload form */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col gap-4 max-w-2xl mx-auto w-full">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Upload Study Notes for Students
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Note Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 5 — Quadratic Equations"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the notes content…"
                  value={noteDesc}
                  onChange={(e) => setNoteDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Attach File (PDF, PPT, DOC, etc.)</label>
                <div
                  onClick={() => noteFileRef.current?.click()}
                  className="w-full px-4 py-6 rounded-xl bg-white/[0.02] border-2 border-dashed border-white/10 hover:border-indigo-500/40 text-center cursor-pointer transition-colors group"
                >
                  <input
                    ref={noteFileRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.png,.mp4"
                    onChange={(e) => setNoteFile(e.target.files?.[0] || null)}
                  />
                  {noteFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">📎</span>
                      <span className="text-xs font-bold text-indigo-400">{noteFile.name}</span>
                      <span className="text-[0.65rem] text-slate-500 font-mono">({(noteFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl group-hover:scale-110 transition-transform">📁</span>
                      <span className="text-xs text-slate-400">Click to browse or drop a file</span>
                      <span className="text-[0.6rem] text-slate-600 font-mono">PDF, PPT, DOC, Images, Videos</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleUploadNote}
                className="py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer font-display uppercase tracking-wider mt-2"
              >
                📤 Upload Note to Students →
              </button>
            </div>

            {/* Uploaded notes list */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest px-1">
                ✦ Published Notes ({notes.length})
              </span>
              {notes.length === 0 && (
                <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <span className="text-2xl block mb-2">📓</span>
                  <span className="text-xs text-slate-400">No notes uploaded yet. Upload your first note above!</span>
                </div>
              )}
              {notes.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl p-2 rounded-xl bg-white/5 flex-shrink-0">
                      {n.file ? "📎" : "📝"}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">{n.title}</span>
                      <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5">
                        {n.subject} · {new Date(n.uploadedAt).toLocaleDateString()}
                        {n.file && ` · ${n.file.name}`}
                      </span>
                      {n.description && (
                        <span className="text-[0.65rem] text-slate-400 mt-1 line-clamp-1">{n.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(n, "note")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono transition-colors cursor-pointer"
                    >
                      ⬇ Download
                    </button>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: TASK DISPATCH */}
        {tab === "tasks" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Provision card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col gap-4 max-w-2xl mx-auto w-full">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Provision New Task Pipeline
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Workload Descriptor</label>
                  <input
                    type="text"
                    placeholder="e.g. Heuristic Problem Array"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Target Segment</label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={newTask.subject}
                    onChange={(e) => setNewTask({ ...newTask, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Verification Limit</label>
                  <input
                    type="date"
                    value={newTask.due}
                    onChange={(e) => setNewTask({ ...newTask, due: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Band Authorization</label>
                  <select
                    value={newTask.assigned}
                    onChange={(e) => setNewTask({ ...newTask, assigned: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="10-A" className="bg-[#0c0c14]">Grade 10-A Nodes</option>
                    <option value="10-B" className="bg-[#0c0c14]">Grade 10-B Nodes</option>
                    <option value="all" className="bg-[#0c0c14]">Global Authorization</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Parameters Buffer</label>
                <textarea
                  rows={3}
                  placeholder="Insert multi-line workload instructions parameters buffer…"
                  value={newTask.desc}
                  onChange={(e) => setNewTask({ ...newTask, desc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300">Attach Reference File (Optional)</label>
                <div
                  onClick={() => taskFileRef.current?.click()}
                  className="w-full px-4 py-4 rounded-xl bg-white/[0.02] border-2 border-dashed border-white/10 hover:border-indigo-500/40 text-center cursor-pointer transition-colors group"
                >
                  <input
                    ref={taskFileRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.png"
                    onChange={(e) => setTaskFile(e.target.files?.[0] || null)}
                  />
                  {taskFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">📎</span>
                      <span className="text-xs font-bold text-indigo-400">{taskFile.name}</span>
                      <span className="text-[0.65rem] text-slate-500 font-mono">({(taskFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">📁 Click to attach a reference file</span>
                  )}
                </div>
              </div>

              <button
                onClick={addTask}
                className="py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer font-display uppercase tracking-wider mt-2"
              >
                Deploy Task Pipeline →
              </button>
            </div>

            {/* List active workload pipelines */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest px-1">
                ✦ Active Workload Tasks Queue
              </span>
              {tasks.map((t) => {
                // Find matching shared assignment to get real submission data
                const matchedShared = sharedAssignments.find(a => a.title === t.title && a.subject === t.subject);
                const realSubmissions = matchedShared?.submissions || [];
                const displaySubmissions = realSubmissions.length > 0 ? realSubmissions.length : t.submissions;
                return (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[0.65rem] font-bold font-mono text-purple-400 uppercase">
                          {t.subject}
                        </span>
                        <span className="text-xs font-bold text-white truncate">{t.title}</span>
                      </div>
                      <span className="text-[0.65rem] text-slate-500 font-mono">
                        Target verification: {t.due} · Assigned scope: {t.assigned}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      {matchedShared && (
                        <button
                          onClick={() => handleDownload(matchedShared, "task")}
                          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[0.65rem] font-mono font-bold text-slate-300 transition-colors cursor-pointer"
                        >
                          ⬇ Task Ref
                        </button>
                      )}
                      <div className="flex flex-col items-end gap-1 w-24">
                        <span className="text-[0.65rem] font-mono text-slate-400 font-bold">
                          {displaySubmissions}/{t.total} synced
                        </span>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                            style={{ width: `${(displaySubmissions / t.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[0.65rem] font-mono font-bold uppercase tracking-wider ${
                          t.status === "active"
                            ? "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                            : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {/* Show individual student submissions */}
                  {realSubmissions.length > 0 && (
                    <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                      <span className="text-[0.6rem] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        Student Submissions ({realSubmissions.length})
                      </span>
                      {realSubmissions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 gap-2">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-[0.6rem] font-bold text-blue-400 flex-shrink-0">
                              {sub.avatar || sub.studentName?.split(" ").map(w=>w[0]).join("") || "?"}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-white truncate">{sub.studentName}</span>
                              <span className="text-[0.6rem] text-slate-500 font-mono truncate">
                                {new Date(sub.submittedAt).toLocaleString()}
                                {sub.file && ` · 📎 ${sub.file.name}`}
                                {sub.text && ` · 📝 "${sub.text}"`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleDownload(sub, "submission")}
                              className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[0.6rem] font-bold font-mono transition-colors cursor-pointer"
                            >
                              ⬇ Download
                            </button>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[0.6rem] font-mono font-bold text-blue-400 uppercase hidden sm:inline">
                              ✓ Submitted
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                );
              })}

              {/* Also show shared-only assignments not in local tasks */}
              {sharedAssignments.filter(a => !tasks.some(t => t.title === a.title && t.subject === a.subject)).map((a) => (
                <div key={a.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[0.65rem] font-bold font-mono text-purple-400 uppercase">
                          {a.subject}
                        </span>
                        <span className="text-xs font-bold text-white truncate">{a.title}</span>
                      </div>
                      <span className="text-[0.65rem] text-slate-500 font-mono">
                        Target verification: {a.due} · Assigned scope: {a.assigned || "all"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        onClick={() => handleDownload(a, "task")}
                        className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[0.65rem] font-mono font-bold text-slate-300 transition-colors cursor-pointer"
                      >
                        ⬇ Task Ref
                      </button>
                      <span className="text-[0.65rem] font-mono text-slate-400 font-bold">
                        {a.submissions?.length || 0} submitted
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        active
                      </span>
                    </div>
                  </div>
                  {a.submissions?.length > 0 && (
                    <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
                      <span className="text-[0.6rem] font-mono font-bold text-slate-500 uppercase tracking-widest">
                        Student Submissions ({a.submissions.length})
                      </span>
                      {a.submissions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 gap-2">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-[0.6rem] font-bold text-blue-400 flex-shrink-0">
                              {sub.avatar || sub.studentName?.split(" ").map(w=>w[0]).join("") || "?"}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-white truncate">{sub.studentName}</span>
                              <span className="text-[0.6rem] text-slate-500 font-mono truncate">
                                {new Date(sub.submittedAt).toLocaleString()}
                                {sub.file && ` · 📎 ${sub.file.name}`}
                                {sub.text && ` · 📝 "${sub.text}"`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleDownload(sub, "submission")}
                              className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[0.6rem] font-bold font-mono transition-colors cursor-pointer"
                            >
                              ⬇ Download
                            </button>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[0.6rem] font-mono font-bold text-blue-400 uppercase hidden sm:inline">
                              ✓ Submitted
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 4: GRADEBOOK MATRIX */}
        {tab === "grades" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 overflow-x-auto"
          >
            <span className="text-sm font-bold text-white px-1">Synchronous Gradebook Assessment</span>
            <div className="p-2 rounded-3xl bg-white/5 border border-white/5 overflow-hidden min-w-[650px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[0.65rem] font-mono text-slate-400 uppercase tracking-widest">
                    <th className="p-4 font-bold">Roster Rung</th>
                    <th className="p-4 font-bold">Band</th>
                    {["Math", "Physics", "English", "Chemistry"].map((s) => (
                      <th key={s} className="p-4 font-bold text-center">{s}</th>
                    ))}
                    <th className="p-4 font-bold text-right">Synthesis Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-medium">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 flex items-center gap-2.5 min-w-[140px]">
                        <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[0.65rem] font-bold text-slate-400 flex-shrink-0">
                          {s.avatar}
                        </span>
                        <span className="font-bold text-white truncate">{s.name}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-500">{s.grade}</td>
                      {["Math", "Physics", "English", "Chemistry"].map((sub) => (
                        <td key={sub} className="p-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={s.scores[sub]}
                            onChange={(e) => updateGrade(s.id, sub, e.target.value)}
                            className="w-14 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </td>
                      ))}
                      <td className="p-4 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono font-extrabold text-[0.7rem] ${
                            avgScore(s) >= 85
                              ? "bg-emerald-500/10 text-emerald-400"
                              : avgScore(s) >= 70
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-rose-500/10 text-rose-400"
                          }`}
                        >
                          {avgScore(s)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* TAB 5: ATTENDANCE CORE */}
        {tab === "attendance" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 max-w-3xl mx-auto w-full"
          >
            {/* Controls banner */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Verification Timestamp
                </span>
                <span className="text-xl font-extrabold text-white font-display tracking-tight block">
                  {attendanceDate}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-lg font-extrabold font-mono text-emerald-400">
                    {Object.values(attendance).filter(Boolean).length}
                  </span>
                  <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
                    Synced Live
                  </span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-start">
                  <span className="text-lg font-extrabold font-mono text-rose-400">
                    {Object.values(attendance).filter((v) => !v).length}
                  </span>
                  <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider">
                    Idle/Suspended
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Roster list switches */}
            <div className="flex flex-col gap-2">
              <span className="text-[0.65rem] font-mono font-bold text-slate-500 uppercase tracking-widest px-1">
                ✦ Toggle Telemetry State
              </span>
              {students.map((s) => {
                const present = attendance[s.id];
                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                        {s.avatar}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-white truncate block">{s.name}</span>
                        <span className="text-[0.65rem] text-slate-500 font-mono mt-0.5 block">
                          Band {s.grade}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[0.65rem] font-mono font-bold uppercase tracking-wider ${
                          present ? "text-emerald-400" : "text-slate-500"
                        }`}
                      >
                        {present ? "Active" : "Suspended"}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={present}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setAttendance((a) => ({ ...a, [s.id]: checked }));
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 6: BROADCAST HUB */}
        {tab === "live" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <span className="text-sm font-bold text-white px-1">Synchronous Media Streaming Hub</span>
            {!liveActive ? (
              <div className="p-12 rounded-3xl bg-white/5 border border-white/5 text-center max-w-xl mx-auto w-full flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-5xl block mb-3 animate-bounce">📡</span>
                <h3 className="text-xl font-extrabold text-white font-display tracking-tight mb-2">
                  Launch Interactive Live Studio
                </h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                  Deploy secure WebRTC endpoints. Registered target endpoints instantly invoke alerts to establish active connection states.
                </p>
                <button
                  onClick={startLiveSession}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-transform cursor-pointer font-display uppercase tracking-wider"
                >
                  🔴 Go Live Dispatch →
                </button>

                {/* Previews */}
                <div className="flex flex-wrap justify-center gap-2 mt-8 pt-6 border-t border-white/5 w-full">
                  {students.map((s) => (
                    <div
                      key={s.id}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-1.5"
                    >
                      <span className="text-[0.6rem] font-bold text-slate-400">{s.avatar}</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          s.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-600"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <LiveSession user={user} students={students} liveSession={liveSession} poll={poll} pushPoll={pushPoll} closePoll={closePoll} onEnd={() => { setLiveActive(false); endSession(); }} />
            )}
          </motion.div>
        )}

        {/* TAB 7: SCHEDULE BUILDER */}
        {tab === "timetable" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 max-w-2xl mx-auto w-full"
          >
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col gap-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Generate Optimized Array Schedule
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Target Subjects</label>
                  <input
                    type="text"
                    value={ttSubjects}
                    onChange={(e) => setTtSubjects(e.target.value)}
                    placeholder="Math, Physics, English"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Daily Hour Pool</label>
                  <input
                    type="number"
                    value={ttHours}
                    onChange={(e) => setTtHours(e.target.value)}
                    min="1"
                    max="12"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Exam Benchmark</label>
                  <input
                    type="date"
                    value={ttExam}
                    onChange={(e) => setTtExam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                onClick={generateTimetable}
                disabled={ttLoading}
                className="py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer disabled:opacity-50 font-display uppercase tracking-wider mt-2"
              >
                {ttLoading ? "Compiling heuristics matrix layout…" : "✨ Generate Timetable Pipeline →"}
              </button>
            </div>

            {/* Results display array */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {ttSchedule
                  ? `Optimized Output Matrix · Exam Threshold: ${ttSchedule.exam}`
                  : "Default Compilation Array"}
              </span>

              {(ttSchedule ? ttSchedule.slots : TIMETABLE_DEFAULT).map((s, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border ${s.border || "border-white/5"} ${s.bg || "bg-white/[0.02]"} flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-400 w-16 flex-shrink-0">
                      {s.time}
                    </span>
                    <span className="text-xs font-bold text-white truncate flex-1 block">
                      {s.subject}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    <span className="text-[0.65rem] text-slate-500 font-mono">
                      {s.type} {s.duration ? `· ${s.duration}` : ""}
                    </span>
                    {s.priority && s.priority !== "—" && (
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[0.6rem] font-mono font-bold text-indigo-400 uppercase">
                        {s.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 8: DIRECT SYNC CHANNEL */}
        {tab === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-[500px] rounded-3xl bg-[#0c0c14]/90 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl max-w-2xl mx-auto w-full"
          >
            {/* Title Bar */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Direct Sync Chat Array
              </span>
              <span className="text-[0.65rem] text-slate-500 font-mono">End-to-End verified</span>
            </div>

            {/* Stream */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((m) => {
                const mine = m.sender === "You";
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      mine ? "self-end flex-row-reverse" : "self-start"
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
                        className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          mine
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm"
                            : "bg-white/5 border border-white/5 text-slate-200 rounded-bl-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                      <span
                        className={`text-[0.6rem] text-slate-600 font-mono px-1 mt-1 block ${
                          mine ? "text-right" : "text-left"
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

            {/* Submitter */}
            <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type response parameters buffer…"
                value={chatMsg}
                onChange={(e) => setChatMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm focus:outline-none px-2 placeholder:text-slate-600"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer"
              >
                Send ↑
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 9: GLOBAL NOTICES */}
        {tab === "announcements" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 max-w-2xl mx-auto w-full"
          >
            {/* Compose */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Broadcast Priority Roster Announcement
              </span>
              <textarea
                rows={3}
                placeholder="Compose real-time alert notice buffer…"
                value={newAnn}
                onChange={(e) => setNewAnn(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none placeholder:text-slate-600 leading-relaxed"
              />
              <button
                onClick={addAnnouncement}
                className="self-end px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer font-display uppercase tracking-wider"
              >
                Deploy Broadcast 📢
              </button>
            </div>

            {/* Streams */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest px-1 block">
                ✦ Public Notice Stream Log
              </span>
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 rounded-2xl border flex flex-col gap-2 transition-colors ${
                    a.pinned ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {a.pinned ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[0.6rem] font-bold font-mono uppercase tracking-wider">
                        📌 Pinned Segment
                      </span>
                    ) : (
                      <span className="text-[0.65rem] text-slate-500 font-mono">
                        Standard Transmission
                      </span>
                    )}
                    <span className="text-[0.65rem] text-slate-500 font-mono">{a.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {a.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 10: COPILOT INTERFACE */}
        {tab === "ai" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-[500px] rounded-3xl bg-[#0c0c14]/90 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl max-w-2xl mx-auto w-full"
          >
            {/* Title Bar */}
            <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🤖</span> Educator Teaching Copilot
              </span>
              <span className="text-[0.65rem] text-slate-500 font-mono">Gemini 2.5 Active</span>
            </div>

            {/* Stream */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {aiHistory.length === 0 && (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center my-auto max-w-sm mx-auto flex flex-col items-center">
                  <span className="text-3xl mb-2 block animate-bounce">🧠</span>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Hello, {user.name.split(" ").slice(-1)[0]}!
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Ask me anything — optimized lesson compilation arrays, rubric parameters generation, student heuristics distillations, or practice assignments structures.
                  </p>
                  <div className="flex flex-col gap-1.5 w-full">
                    {[
                      "Create a quiz on Newton's Laws",
                      "Write a grading rubric for essays",
                      "Suggest activities for slow learners",
                      "Explain photosynthesis for 10th grade",
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
                  className={`flex flex-col gap-1 max-w-[85%] ${
                    m.role === "user" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <span className="text-[0.6rem] font-mono font-bold text-slate-500 px-1 uppercase tracking-wider block">
                    {m.role === "user" ? "You" : "AI"}
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm"
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

            {/* Buffer prompt */}
            <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center gap-2">
              <textarea
                rows={1}
                placeholder="Ask teaching copilot buffer…"
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
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer disabled:opacity-50"
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