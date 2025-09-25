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
