import { useState, useEffect, useCallback } from "react";

// ──────────────────────────────────────────────────────────────────────────────
// Multi-Tier Shared Classroom Store Engine
// Tier 1: Optimistic Local State (instant UI feedback)
// Tier 2: localStorage Cross-Tab Synchronization (instant intra-device sync)
// Tier 3: Real-Time WebSocket Backend Integration (cross-device/network sync)
// ──────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "ITM_VIRTUAL_CLASSROOM_SHARED_STORE";

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load store from localStorage", e);
  }
  return {
    notes: [],
    assignments: [],
    liveSession: null,
    poll: null,
    grades: {}, // studentId -> { subject: score }
    studentXp: {}, // studentId -> xp
  };
}

let ws = null;
let listeners = new Set();
let reconnectTimer = null;
let currentState = loadInitialState();

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  } catch (e) {
    console.error("Failed to persist store to localStorage", e);
  }
}

function notifyListeners() {
  persistState();
  listeners.forEach((fn) => fn({ ...currentState }));
}

// Listen to other browser tabs updating the localStorage store
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        currentState = JSON.parse(e.newValue);
        listeners.forEach((fn) => fn({ ...currentState }));
      } catch (err) {
        console.error("Storage sync parse error", err);
      }
    }
  });
}

function mergeItems(localArr, serverArr) {
  const map = new Map();
  // Priority 1: Keep server items
  (serverArr || []).forEach(item => map.set(item.id, item));
  // Priority 2: Keep local persistent items if server hasn't registered them yet
  (localArr || []).forEach(item => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  // Sort descending by creation/upload time
  return Array.from(map.values()).sort((a, b) => {
    const tA = new Date(a.uploadedAt || a.createdAt || 0).getTime();
    const tB = new Date(b.uploadedAt || b.createdAt || 0).getTime();
    return tB - tA;
  });
}

function getWsUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.hostname;
  const port = 4000;
  return `${protocol}//${host}:${port}`;
}

function connectWs() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const url = getWsUrl();
  console.log(`[WS] Connecting to backend sync layer at ${url}...`);
  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("[WS] Multi-device Live Synchronization Layer Active ✓");
    ws.send(JSON.stringify({ type: "REQUEST_SYNC" }));
    
    // Push locally created non-synced items to server to ensure state convergence
    if (currentState.notes.length > 0) {
      currentState.notes.forEach(note => {
        ws.send(JSON.stringify({ type: "ADD_NOTE", payload: note }));
      });
    }
    if (currentState.assignments.length > 0) {
      currentState.assignments.forEach(assignment => {
        ws.send(JSON.stringify({ type: "ADD_ASSIGNMENT", payload: assignment }));
      });
    }
  };

  ws.onmessage = (event) => {
    try {
      const { type, payload } = JSON.parse(event.data);
      switch (type) {
        case "FULL_SYNC":
          currentState.notes = mergeItems(currentState.notes, payload.notes || []);
          currentState.assignments = mergeItems(currentState.assignments, payload.assignments || []);
          if (payload.liveSession !== undefined) currentState.liveSession = payload.liveSession;
          if (payload.poll !== undefined) currentState.poll = payload.poll;
          if (payload.grades !== undefined) currentState.grades = payload.grades;
          if (payload.studentXp !== undefined) currentState.studentXp = payload.studentXp;
          break;
        case "NOTES_UPDATED":
          currentState.notes = mergeItems(currentState.notes, payload || []);
          break;
        case "ASSIGNMENTS_UPDATED":
          currentState.assignments = mergeItems(currentState.assignments, payload || []);
          break;
        case "LIVE_SESSION_UPDATED":
          currentState.liveSession = payload;
          break;
        case "POLL_UPDATED":
          currentState.poll = payload;
          break;
        case "GRADES_UPDATED":
          currentState.grades = payload;
          break;
        case "XP_UPDATED":
          currentState.studentXp = payload;
          break;
      }
      notifyListeners();
    } catch (err) {
      console.error("[WS] Parse error:", err);
    }
  };

  ws.onclose = () => {
    ws = null;
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectWs, 3000);
  };

  ws.onerror = () => {
    ws?.close();
  };
}

function processOptimisticUpdate(type, payload) {
  switch (type) {
    case "ADD_NOTE": {
      const note = {
        ...payload,
        id: payload.id || Date.now() + Math.random(),
        uploadedAt: payload.uploadedAt || new Date().toISOString(),
      };
      // Prevent duplicates if multiple components trigger optimistic updates
      if (!currentState.notes.some(n => n.title === note.title && n.subject === note.subject && n.description === note.description)) {
        currentState.notes = [note, ...currentState.notes];
      }
      break;
    }
    case "DELETE_NOTE": {
      currentState.notes = currentState.notes.filter((n) => n.id !== payload.id);
      break;
    }
    case "ADD_ASSIGNMENT": {
      const assignment = {
        ...payload,
        id: payload.id || Date.now() + Math.random(),
        createdAt: payload.createdAt || new Date().toISOString(),
        submissions: payload.submissions || [],
      };
      if (!currentState.assignments.some(a => a.title === assignment.title && a.subject === assignment.subject)) {
        currentState.assignments = [assignment, ...currentState.assignments];
      }
      break;
    }
    case "SUBMIT_ASSIGNMENT": {
      const { assignmentId, submission } = payload;
      currentState.assignments = currentState.assignments.map((a) => {
        if (a.id === assignmentId) {
          const subObj = {
            ...submission,
            id: submission.id || Date.now() + Math.random(),
            submittedAt: submission.submittedAt || new Date().toISOString(),
          };
          // Filter out previous submission by same student if updating
          const updatedSubs = (a.submissions || []).filter(s => s.studentName !== submission.studentName);
          return {
            ...a,
            submissions: [...updatedSubs, subObj],
          };
        }
        return a;
      });
      break;
    }
    case "START_SESSION": {
      currentState.liveSession = {
        active: true,
        teacher: payload.teacher,
        startedAt: new Date().toISOString(),
        participants: [],
      };
      break;
    }
    case "END_SESSION": {
      currentState.liveSession = null;
      currentState.poll = null;
      break;
    }
    case "JOIN_SESSION": {
      if (currentState.liveSession) {
        const already = (currentState.liveSession.participants || []).some((p) => p.name === payload.name);
        if (!already) {
          currentState.liveSession.participants = [...(currentState.liveSession.participants || []), payload];
        }
      }
      break;
    }
    case "PUSH_POLL": {
      currentState.poll = {
        question: payload.question || "Untitled Poll",
        options: payload.options || ["Option A", "Option B"],
        votes: payload.options ? payload.options.map(() => 0) : [0, 0],
        active: true,
        pushedAt: new Date().toISOString(),
      };
      break;
    }
    case "VOTE_POLL": {
      if (currentState.poll && currentState.poll.active) {
        const idx = payload.optionIndex;
        if (typeof idx === "number" && currentState.poll.votes[idx] !== undefined) {
          const nextVotes = [...currentState.poll.votes];
          nextVotes[idx] += 1;
          currentState.poll = { ...currentState.poll, votes: nextVotes };
        }
      }
      break;
    }
    case "CLOSE_POLL": {
      currentState.poll = null;
      break;
    }
    case "UPDATE_GRADE": {
      const { studentId, subject, score } = payload;
      const currentGrades = currentState.grades[studentId] || {};
      currentState.grades = {
        ...currentState.grades,
        [studentId]: { ...currentGrades, [subject]: score },
      };
      break;
    }
    case "UPDATE_XP": {
      const { studentId, xp } = payload;
      currentState.studentXp = {
        ...currentState.studentXp,
        [studentId]: xp,
      };
      break;
    }
  }
  notifyListeners();
}

function sendMessage(type, payload) {
  // 1. Immediately apply update locally and across local storage tabs
  processOptimisticUpdate(type, payload);

  // 2. Broadcast to multi-device sync server if active
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  } else {
    connectWs();
    setTimeout(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type, payload }));
      }
    }, 1000);
  }
}

// Initialize connection
connectWs();

// ── Hook: subscribe to store updates ────────────────────────────────────────
function useStoreSubscription() {
  const [state, setState] = useState(() => ({ ...currentState }));

  useEffect(() => {
    const handler = (newState) => setState({ ...newState });
    listeners.add(handler);

    // Ensure connection attempt
    connectWs();
    
    // Sync with freshest local state
    setState({ ...currentState });

    return () => {
      listeners.delete(handler);
    };
  }, []);

  return state;
}

// ── Hook: useNotes ─────────────────────────────────────────────────────────
export function useNotes() {
  const { notes } = useStoreSubscription();

  const addNote = useCallback((note) => {
    sendMessage("ADD_NOTE", note);
  }, []);

  const deleteNote = useCallback((id) => {
    sendMessage("DELETE_NOTE", { id });
  }, []);

  return { notes, addNote, deleteNote };
}

// ── Hook: useAssignments ───────────────────────────────────────────────────
export function useAssignments() {
  const { assignments } = useStoreSubscription();

  const addAssignment = useCallback((assignment) => {
    sendMessage("ADD_ASSIGNMENT", assignment);
  }, []);

  const submitAssignment = useCallback((assignmentId, submission) => {
    sendMessage("SUBMIT_ASSIGNMENT", { assignmentId, submission });
  }, []);

  return { assignments, addAssignment, submitAssignment };
}

// ── Hook: useLiveSession ───────────────────────────────────────────────────
export function useLiveSession() {
  const { liveSession } = useStoreSubscription();

  const startSession = useCallback((teacherInfo) => {
    sendMessage("START_SESSION", { teacher: teacherInfo });
  }, []);

  const endSession = useCallback(() => {
    sendMessage("END_SESSION", {});
  }, []);

  const joinSession = useCallback((studentInfo) => {
    sendMessage("JOIN_SESSION", studentInfo);
  }, []);

  return { liveSession, startSession, endSession, joinSession };
}

// ── Hook: usePoll ──────────────────────────────────────────────────────────
export function usePoll() {
  const { poll } = useStoreSubscription();

  const pushPoll = useCallback((pollData) => {
    sendMessage("PUSH_POLL", pollData);
  }, []);

  const votePoll = useCallback((optionIndex) => {
    sendMessage("VOTE_POLL", { optionIndex });
  }, []);

  const closePoll = useCallback(() => {
    sendMessage("CLOSE_POLL", {});
  }, []);

  return { poll, pushPoll, votePoll, closePoll };
}

// ── Hook: useGrades ────────────────────────────────────────────────────────
export function useGrades() {
  const { grades } = useStoreSubscription();

  const updateGrade = useCallback((studentId, subject, score) => {
    sendMessage("UPDATE_GRADE", { studentId, subject, score });
  }, []);

  return { grades, updateGrade };
}

// ── Hook: useXp ────────────────────────────────────────────────────────────
export function useXp() {
  const { studentXp } = useStoreSubscription();

  const updateXp = useCallback((studentId, xp) => {
    sendMessage("UPDATE_XP", { studentId, xp });
  }, []);

  return { studentXp, updateXp };
}

// Utility: convert File to base64 data URL for transmission
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
