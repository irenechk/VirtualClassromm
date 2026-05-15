// ──────────────────────────────────────────────────────────────────────────────
// ITM Virtual Classroom — Real-Time WebSocket Server
// This server syncs notes, assignments, and live session state across ALL
// connected devices (different laptops, phones, etc.) in real time.
//
// Run:  node server.js
// Port: 4000 (WebSocket on same port via upgrade)
// ──────────────────────────────────────────────────────────────────────────────

import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ── In-memory store (persists as long as server is running) ──────────────────
const store = {
  notes: [],
  assignments: [],
  liveSession: null,
  poll: null,
};

// ── Broadcast to ALL connected clients ──────────────────────────────────────
function broadcast(type, payload) {
  const msg = JSON.stringify({ type, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(msg);
    }
  });
}

// ── WebSocket connection handler ────────────────────────────────────────────
wss.on("connection", (ws) => {
  console.log(`[WS] Client connected (total: ${wss.clients.size})`);

  // Send the full current state to the newly connected client
  ws.send(
    JSON.stringify({
      type: "FULL_SYNC",
      payload: { ...store },
    })
  );

  ws.on("message", (raw) => {
    try {
      const { type, payload } = JSON.parse(raw);

      switch (type) {
        // ── Notes ─────────────────────────────────────────────────────────
        case "ADD_NOTE": {
          const note = {
            ...payload,
            id: Date.now() + Math.random(),
            uploadedAt: new Date().toISOString(),
          };
          store.notes.unshift(note);
          broadcast("NOTES_UPDATED", store.notes);
          break;
        }
        case "DELETE_NOTE": {
          store.notes = store.notes.filter((n) => n.id !== payload.id);
          broadcast("NOTES_UPDATED", store.notes);
          break;
        }

        // ── Assignments ───────────────────────────────────────────────────
        case "ADD_ASSIGNMENT": {
          const assignment = {
            ...payload,
            id: Date.now() + Math.random(),
            createdAt: new Date().toISOString(),
            submissions: [],
          };
          store.assignments.unshift(assignment);
          broadcast("ASSIGNMENTS_UPDATED", store.assignments);
          break;
        }
        case "SUBMIT_ASSIGNMENT": {
          const { assignmentId, submission } = payload;
          store.assignments = store.assignments.map((a) => {
            if (a.id === assignmentId) {
              return {
                ...a,
                submissions: [
                  ...a.submissions,
                  {
                    ...submission,
                    id: Date.now() + Math.random(),
                    submittedAt: new Date().toISOString(),
                  },
                ],
              };
            }
            return a;
          });
          broadcast("ASSIGNMENTS_UPDATED", store.assignments);
          break;
        }

        // ── Live Session ──────────────────────────────────────────────────
        case "START_SESSION": {
          store.liveSession = {
            active: true,
            teacher: payload.teacher,
            startedAt: new Date().toISOString(),
            participants: [],
          };
          broadcast("LIVE_SESSION_UPDATED", store.liveSession);
          break;
        }
        case "END_SESSION": {
          store.liveSession = null;
          store.poll = null;
          broadcast("LIVE_SESSION_UPDATED", null);
          broadcast("POLL_UPDATED", null);
          break;
        }
        case "JOIN_SESSION": {
          if (!store.liveSession) break;
          const already = store.liveSession.participants?.some(
            (p) => p.name === payload.name
          );
          if (!already) {
            store.liveSession.participants.push(payload);
            broadcast("LIVE_SESSION_UPDATED", store.liveSession);
          }
          break;
        }

        // ── Custom Poll ───────────────────────────────────────────────────
        case "PUSH_POLL": {
          store.poll = {
            question: payload.question || "Untitled Poll",
            options: payload.options || ["Option A", "Option B"],
            votes: payload.options ? payload.options.map(() => 0) : [0, 0],
            active: true,
            pushedAt: new Date().toISOString(),
          };
          broadcast("POLL_UPDATED", store.poll);
          break;
        }
        case "VOTE_POLL": {
          if (store.poll && store.poll.active) {
            const idx = payload.optionIndex;
            if (typeof idx === "number" && store.poll.votes[idx] !== undefined) {
              store.poll.votes[idx] += 1;
              broadcast("POLL_UPDATED", store.poll);
            }
          }
          break;
        }
        case "CLOSE_POLL": {
          store.poll = null;
          broadcast("POLL_UPDATED", null);
          break;
        }

        // ── Request full state ────────────────────────────────────────────
        case "REQUEST_SYNC": {
          ws.send(
            JSON.stringify({
              type: "FULL_SYNC",
              payload: { ...store },
            })
          );
          break;
        }

        default:
          console.log(`[WS] Unknown message type: ${type}`);
      }
    } catch (err) {
      console.error("[WS] Message parse error:", err.message);
    }
  });

  ws.on("close", () => {
    console.log(`[WS] Client disconnected (remaining: ${wss.clients.size})`);
  });
});

// ── REST endpoints (fallback for health checks) ─────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    clients: wss.clients.size,
    notes: store.notes.length,
    assignments: store.assignments.length,
    liveActive: !!store.liveSession?.active,
  });
});

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀 ITM Classroom Server running on http://0.0.0.0:${PORT}`);
  console.log(`   WebSocket ready on ws://0.0.0.0:${PORT}`);
  console.log(
    `   For LAN access, use your IP address (find with: ipconfig / ifconfig)\n`
  );
});
