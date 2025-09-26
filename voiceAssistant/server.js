import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// Import controllers
import { startSession, postTurn, endSession } from './src/controllers/sessionController.js';
import { dashboard, listSessions, getSession, analytics, alerts } from './src/controllers/adminController.js';
import { getCounselorReport, listCounselorReports } from './src/controllers/counselorController.js';
import { speak as ttsSpeak } from './src/controllers/ttsController.js';
import { listResources } from './src/controllers/resourcesController.js';
import { booking as hookBooking, peerSupport as hookPeer } from './src/controllers/hooksController.js';

const app = express();
// Normalize BACKEND_BASE_URL to avoid local HTTPS causing OpenSSL errors on Windows
const RAW_BACKEND = process.env.BACKEND_BASE_URL || 'http://localhost:5000';
let BACKEND_BASE_URL = RAW_BACKEND;
try {
  const u = new URL(RAW_BACKEND.startsWith('http') ? RAW_BACKEND : `http://${RAW_BACKEND}`);
  // Force http for localhost/127.0.0.1 to prevent TLS issues
  if ((u.hostname === 'localhost' || u.hostname === '127.0.0.1') && u.protocol === 'https:') {
    u.protocol = 'http:';
  }
  BACKEND_BASE_URL = u.toString().replace(/\/$/, '');
} catch {
  BACKEND_BASE_URL = 'http://localhost:5000';
}

// ------------------ MIDDLEWARE ------------------
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// ------------------ ROUTES ------------------

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'Voice Assistant API running', 
    timestamp: new Date().toISOString(),
    backend: BACKEND_BASE_URL 
  });
});

// Seed some demo sessions and analytics so dashboards are not empty in dev
app.post('/api/admin/seed-demo', async (req, res) => {
  try {
    const now = Date.now();
    const toIso = (ms) => new Date(ms).toISOString();

    function makeSession(offsetMs, opts = {}){
      const id = `${now+offsetMs}-${Math.random().toString(36).slice(2,10)}`;
      const sess = {
        id,
        locale: 'en',
        startedAt: toIso(now + offsetMs),
        turns: [
          { role: 'user', text: 'I am feeling very anxious lately', timestamp: toIso(now + offsetMs + 1000) },
          { role: 'assistant', text: 'I am here to help. Can you share more?', timestamp: toIso(now + offsetMs + 2000) }
        ],
        riskFlags: [],
        meta: { userName: opts.userName || 'Anonymous' }
      };
      if (opts.ended) sess.endedAt = toIso(now + offsetMs + 60*1000);
      sessions.set(id, sess);
      try { VAAdminReporting.generateBasicSessionReport(id, sess, { updateAnalytics: true }); } catch {}
      return id;
    }

    const s1 = makeSession(-60*60*1000, { userName: 'Alex', ended: true }); // 1h ago completed
    const s2 = makeSession(-10*60*1000, { userName: 'Sam' }); // 10m ago ongoing

    return res.json({ ok: true, sessions: [s1, s2] });
  } catch (e) {
    console.error('Seed demo failed', e);
    return res.status(500).json({ error: 'Failed to seed demo data' });
  }
});

// Session API
app.post('/api/session/start', startSession);
app.post('/api/session/turn', postTurn);
app.post('/api/session/end', endSession);

// Admin Dashboard API Endpoints
app.get('/api/admin/dashboard', dashboard);
app.get('/api/admin/sessions', listSessions);
app.get('/api/admin/session/:sessionId', getSession);
app.get('/api/admin/analytics', analytics);
app.get('/api/admin/alerts', alerts);

// Counselor Report API Endpoints
app.get('/api/counselor/report/:sessionId', getCounselorReport);
app.get('/api/counselor/reports', listCounselorReports);

// TTS proxy
app.post('/api/tts/speak', ttsSpeak);

// Resources
app.get('/api/resources', listResources);

// External integration hooks
app.post('/api/hooks/booking', hookBooking);
app.post('/api/hooks/peer-support', hookPeer);

// ------------------ COUNSELOR SESSION MANAGEMENT (for web UI) ------------------
import { sessions } from './src/state.js';
import { adminReporting as VAAdminReporting } from './src/state.js';

// Helper to compute status for a session
function computeStatus(sess){
  if (!sess) return 'cancelled';
  if (sess.endedAt) return 'completed';
  return sess.status || 'scheduled';
}

// List sessions (basic view for counselor)
app.get('/api/counselor/sessions', (req, res) => {
  try {
    const list = Array.from(sessions.entries())
      .sort((a,b) => new Date(b[1].startedAt) - new Date(a[1].startedAt))
      .map(([id, s]) => ({
        sessionId: id,
        userName: s.meta?.userName || 'Anonymous',
        scheduledAt: s.startedAt,
        duration: s.endedAt ? Math.max(1, Math.round((new Date(s.endedAt)-new Date(s.startedAt))/60000)) : undefined,
        status: computeStatus(s)
      }));
    res.json({ sessions: list });
  } catch (e) {
    res.status(500).json({ error: 'Failed to list sessions' });
  }
});

// Get a specific session (with messages/notes)
app.get('/api/counselor/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const s = sessions.get(sessionId);
    if (!s) return res.status(404).json({ error: 'Session not found' });
    const messages = (s.turns || []).map((t, idx) => ({
      id: idx + 1,
      message: t.text,
      sender: t.role === 'assistant' ? 'user' : (t.role || 'system'),
      timestamp: t.timestamp || new Date().toISOString()
    }));
    const resp = {
      sessionId,
      userName: s.meta?.userName || 'Anonymous',
      status: computeStatus(s),
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      messages,
      notes: s.meta?.notes || ''
    };
    res.json(resp);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load session' });
  }
});

// Post a counselor message into the session
app.post('/api/counselor/session/:sessionId/message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, sender = 'counselor', timestamp = new Date().toISOString() } = req.body || {};
    const s = sessions.get(sessionId);
    if (!s) return res.status(404).json({ error: 'Session not found' });
    if (!message || !String(message).trim()) return res.status(400).json({ error: 'Message required' });
    s.turns = Array.isArray(s.turns) ? s.turns : [];
    s.turns.push({ role: sender, text: String(message), timestamp });
    sessions.set(sessionId, s);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to post message' });
  }
});

// Save session notes
app.post('/api/counselor/session/:sessionId/notes', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { notes = '' } = req.body || {};
    const s = sessions.get(sessionId);
    if (!s) return res.status(404).json({ error: 'Session not found' });
    s.meta = { ...(s.meta || {}), notes: String(notes) };
    sessions.set(sessionId, s);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save notes' });
  }
});

// Update session status
app.post('/api/counselor/session/:sessionId/status', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body || {};
    const s = sessions.get(sessionId);
    if (!s) return res.status(404).json({ error: 'Session not found' });
    if (!status) return res.status(400).json({ error: 'Missing status' });
    s.status = String(status);
    if (status === 'completed' && !s.endedAt) s.endedAt = new Date().toISOString();
    sessions.set(sessionId, s);
    res.json({ ok: true, status: s.status });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ------------------ BOOKING PROXY (to main backend) ------------------
app.post('/api/book/admin', async (req, res) => {
  console.log('📞 Booking proxy called:', { body: req.body, backend: BACKEND_BASE_URL });
  
  try {
    // Add timeout with AbortController
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let healthCheck;
    try {
      healthCheck = await fetch(`${BACKEND_BASE_URL}/`, { 
        method: 'GET',
        signal: controller.signal
      });
    } catch (err) {
      console.error('❌ Backend not reachable at:', BACKEND_BASE_URL);
      return res.status(503).json({ 
        error: 'Backend service unavailable', 
        details: `Cannot connect to ${BACKEND_BASE_URL}` 
      });
    } finally {
      clearTimeout(timeout);
    }
    
    const resp = await fetch(`${BACKEND_BASE_URL}/api/book/admin`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body || {})
    });
    
    console.log('📡 Backend response status:', resp.status);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('❌ Backend error response:', errorText);
      return res.status(resp.status).json({ 
        error: `Backend error: ${resp.status}`, 
        details: errorText 
      });
    }
    
    const data = await resp.json();
    console.log('✅ Booking successful:', data);
    return res.status(200).json(data);
  } catch (e) {
    console.error('❌ Booking proxy error:', e);
    return res.status(500).json({ 
      error: 'Failed to connect to booking service', 
      details: e?.message || String(e) 
    });
  }
});

// ------------------ ERROR HANDLING ------------------
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: err.message 
  });
});

// 404 handler (Express 5: avoid '*' which breaks path-to-regexp)
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.originalUrl 
  });
});

// ------------------ SERVER START ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Voice assistant server running on http://localhost:${PORT}`);
  console.log(` Backend URL: ${BACKEND_BASE_URL}`);
});
