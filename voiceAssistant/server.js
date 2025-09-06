import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createResponse } from './src/dialogue.js';
import { pingOllama } from './src/llm.js';
import { detectRisk } from './src/safety.js';
import { generateReport } from './src/report.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const sessions = new Map();

app.post('/api/session/start', (req, res) => {
  const { locale = 'en-IN' } = req.body || {};
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  sessions.set(sessionId, {
    id: sessionId,
    locale,
    startedAt: new Date().toISOString(),
    turns: [],
    riskFlags: [],
    meta: {}
  });
  res.json({ sessionId });
});

app.post('/api/session/turn', async (req, res) => {
  const { sessionId, userText } = req.body || {};
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid sessionId' });
  }
  const session = sessions.get(sessionId);
  const risk = detectRisk(userText);
  if (risk.flag) {
    session.riskFlags.push(risk);
  }
  const reply = await createResponse(userText, { locale: session.locale, risk, priorTurns: session.turns });
  session.turns.push({ role: 'user', text: userText });
  session.turns.push({ role: 'assistant', text: reply });
  res.json({ reply, risk });
});

app.post('/api/session/end', (req, res) => {
  const { sessionId } = req.body || {};
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid sessionId' });
  }
  const session = sessions.get(sessionId);
  session.endedAt = new Date().toISOString();
  const report = generateReport(session);
  res.json({ report });
});

app.get('/api/llm/health', async (req, res) => {
  try {
    if (process.env.USE_LLM !== '1') return res.json({ useLLM: false, reason: 'USE_LLM not set' });
    const info = await pingOllama();
    res.json({ useLLM: true, ...info });
  } catch (e) {
    res.status(500).json({ useLLM: true, error: e?.message || String(e) });
  }
});

app.post('/api/llm/toggle', (req, res) => {
  const { on } = req.body || {};
  process.env.USE_LLM = on ? '1' : '0';
  res.json({ useLLM: process.env.USE_LLM === '1' });
});

// TTS fallback endpoint removed due to Node TS module compatibility issues.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Voice assistant server running on http://localhost:${PORT}`));


