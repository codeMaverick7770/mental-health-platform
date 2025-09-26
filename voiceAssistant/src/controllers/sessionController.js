import { sessions, adminReporting, pushRealtime } from '../state.js';
import { createResponse, generateAdminReport } from '../dialogue.js';
import { detectRisk } from '../safety.js';
import { generateReport } from '../report.js';

export function startSession(req, res) {
  const { locale = 'en' } = req.body || {};
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const session = {
    id: sessionId,
    locale,
    startedAt: new Date().toISOString(),
    turns: [],
    riskFlags: [],
    meta: {}
  };
  sessions.set(sessionId, session);
  try {
    // Seed a basic session report so dashboards show the session immediately.
    adminReporting.generateBasicSessionReport(sessionId, session, { updateAnalytics: false });
  } catch {}
  res.json({ sessionId });
}

export async function postTurn(req, res) {
  const { sessionId, userText } = req.body || {};
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid sessionId' });
  }
  const session = sessions.get(sessionId);
  // Persist the user's turn immediately so chat history is retained even if LLM fails
  try {
    session.turns = Array.isArray(session.turns) ? session.turns : [];
    session.turns.push({ role: 'user', text: String(userText || ''), timestamp: new Date().toISOString() });
    sessions.set(sessionId, session);
  } catch {}
  const risk = detectRisk(userText);
  if (risk.flag) {
    session.riskFlags.push(risk);
  }

  try {
    const response = await createResponse(userText, { 
      locale: session.locale, 
      risk, 
      priorTurns: session.turns,
      sessionId: sessionId
    });

    if (response.session) {
      sessions.set(sessionId, { ...session, ...response.session });
    } else {
      session.turns.push({ role: 'assistant', text: response.reply, timestamp: new Date().toISOString() });
      sessions.set(sessionId, session);
    }

    // Refresh live analytics snapshot for dashboards (safe recompute; no inflation)
    try { adminReporting.generateBasicSessionReport(sessionId, sessions.get(sessionId), { updateAnalytics: true }); } catch {}

    // Generate realtime insights for dashboards
    try {
      // Lightweight insights for live view
      const adminSnapshot = adminReporting.generateDashboardData();
      pushRealtime({ type: 'insight', sessionId, riskLevel: response.risk?.level || 'low', summary: {
        turns: session.turns.length,
        mainConcerns: response.analysis?.mainConcerns || [],
      }});
      // SOS/crisis realtime flag
      if (response.risk?.level === 'high' || response.risk?.level === 'crisis') {
        pushRealtime({ type: 'sos', sessionId, message: 'High risk detected', level: response.risk.level });
      }
    } catch {}

    // Suggest TTS style based on analysis emotionalState
    const emotionalState = response.analysis?.emotionalState || '';
    const ttsStyle = mapEmotionToStyle(emotionalState);

    res.json({ 
      reply: response.reply, 
      risk: response.risk,
      sessionId: response.sessionId,
      analysis: response.analysis,
      actionPlan: response.actionPlan,
      tts: {
        style: ttsStyle,
        voice: 'en-IN-NeerjaNeural',
        hindiVoice: 'hi-IN-SwaraNeural'
      }
    });
  } catch (error) {
    console.error('Error in session turn:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message
    });
  }
}

function mapEmotionToStyle(emotion = '') {
  const e = String(emotion || '').toLowerCase();
  if (e.includes('crisis') || e.includes('distress') || e.includes('fear') || e.includes('panic')) return 'empathetic';
  if (e.includes('anxious') || e.includes('stress')) return 'empathetic';
  if (e.includes('depressed') || e.includes('sad') || e.includes('down')) return 'sad';
  if (e.includes('hopeful') || e.includes('relief')) return 'calm';
  if (e.includes('positive') || e.includes('improving') || e.includes('better')) return 'cheerful';
  return 'empathetic';
}

export async function endSession(req, res) {
  const { sessionId } = req.body || {};
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid sessionId' });
  }
  const session = sessions.get(sessionId);
  session.endedAt = new Date().toISOString();

  try {
    const userReport = generateReport(session);
    const adminReport = await generateAdminReport(sessionId);
    res.json({ report: userReport, adminReport });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ error: 'Failed to generate reports', details: error.message });
  }
}


