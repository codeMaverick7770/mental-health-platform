import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';

import { startSession, postTurn, endSession } from './src/controllers/sessionController.js';
import { dashboard, listSessions, getSession, analytics, alerts } from './src/controllers/adminController.js';
import { getCounselorReport, listCounselorReports } from './src/controllers/counselorController.js';
import { speak as ttsSpeak } from './src/controllers/ttsController.js';
import { listResources } from './src/controllers/resourcesController.js';
import { booking as hookBooking, peerSupport as hookPeer } from './src/controllers/hooksController.js';

const app = express();

// ------------------ SECURITY (Helmet) ------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],

        // Stylesheets (Google Fonts)
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],

        // Fonts (Google Fonts)
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],

        // Scripts
        scriptSrc: ["'self'", "'unsafe-inline'"],

        // XHR / fetch / WebSocket
        connectSrc: [
          "'self'",
          "http://localhost:5173",
          "ws://localhost:5173",
          "http://localhost:3000",
          "ws://localhost:3000"
        ],

        // Images
        imgSrc: ["'self'", "data:", "blob:"],

        // Harden
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  })
);

// Chrome DevTools well-known discovery (avoid 404)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(200).json({});
});

// ------------------ MIDDLEWARE ------------------
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// ------------------ ROUTES ------------------

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

// ------------------ SERVER START ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Voice assistant server running on http://localhost:${PORT}`)
);
