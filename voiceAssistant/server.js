import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { startSession, postTurn, endSession } from './src/controllers/sessionController.js';
import { dashboard, listSessions, getSession, analytics, alerts } from './src/controllers/adminController.js';
import { getCounselorReport, listCounselorReports } from './src/controllers/counselorController.js';
import { speak as ttsSpeak } from './src/controllers/ttsController.js';
import { listResources } from './src/controllers/resourcesController.js';
import { booking as hookBooking, peerSupport as hookPeer } from './src/controllers/hooksController.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Controllers manage state and logic; server defines routes only

app.post('/api/session/start', startSession);

app.post('/api/session/turn', postTurn);

app.post('/api/session/end', endSession);

// LLM endpoints removed while running in rule-based mode

// Admin Dashboard API Endpoints
app.get('/api/admin/dashboard', dashboard);

app.get('/api/admin/sessions', listSessions);

app.get('/api/admin/session/:sessionId', getSession);

app.get('/api/admin/analytics', analytics);

app.get('/api/admin/alerts', alerts);

// Counselor Report API Endpoints
app.get('/api/counselor/report/:sessionId', getCounselorReport);

// Get all counselor reports
app.get('/api/counselor/reports', listCounselorReports);

// TTS proxy (emotion-aware Indian female voice)
app.post('/api/tts/speak', ttsSpeak);

// Psychoeducational resources (static MVP)
app.get('/api/resources', listResources);

// External integration hooks
app.post('/api/hooks/booking', hookBooking);
app.post('/api/hooks/peer-support', hookPeer);

// TTS fallback endpoint removed due to Node TS module compatibility issues.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Voice assistant server running on http://localhost:${PORT}`));


