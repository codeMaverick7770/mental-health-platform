import { sessions, adminReporting, pushRealtime } from '../state.js';
import { createResponse, generateAdminReport } from '../dialogue.js';
import { detectRisk } from '../safety.js';
import { generateReport } from '../report.js';
import { connectToDb } from '../utils.js';

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
    let adminReport;
    try {
      adminReport = await generateAdminReport(sessionId);
    } catch (e) {
      // Fallback minimal report to ensure persistence even if LLM/insights fail
      const durationMin = Math.max(1, Math.round((new Date(session.endedAt) - new Date(session.startedAt)) / 60000));
      adminReport = {
        priority: 'medium',
        riskAssessment: { overallRisk: 'low', confidence: 0.5 },
        immediateActions: [],
        bookingNeeded: false,
        studentInfo: {
          engagementLevel: 'medium',
          messageCount: Array.isArray(session.turns) ? session.turns.length : 0,
          sessionDuration: durationMin
        }
      };
    }

    // Prepare data for persistence
    const persistenceData = {
      sessionId: session.id,
      userId: session.meta.userId || 'anonymous',
      userName: session.meta.userName || 'Anonymous',
      status: 'completed',
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      duration: Math.round((new Date(session.endedAt) - new Date(session.startedAt)) / 60000),
      messages: session.turns.map(turn => ({ message: turn.text, sender: turn.role, timestamp: turn.timestamp })),
      notes: '', // Counselor can add notes later
      priority: adminReport.priority || 'medium',
      riskAssessment: adminReport.riskAssessment,
      immediateActions: adminReport.immediateActions,
      bookingNeeded: adminReport.bookingNeeded,
      studentInfo: adminReport.studentInfo
    };

    // Persist to main backend (MongoDB)
    try {
      const db = await connectToDb();
      await db.collection('sessions').insertOne(persistenceData);
    } catch (e) {
      console.error('Failed to persist session to main backend', e);
      // Decide if you should fail the request or just log the error
    }

    // Clean up in-memory session
    sessions.delete(sessionId);

    res.json({ report: userReport, adminReport });
  } catch (error) {
    console.error('Error generating reports:', error);
        res.status(500).json({ error: 'Failed to generate reports', details: error.message });
  }
}

export async function bookSession(req, res) {
  const { sessionId, counselorId } = req.body;
  if (!sessionId || !counselorId) {
    return res.status(400).json({ error: 'sessionId and counselorId are required' });
  }

  try {
    const db = await connectToDb();
    const result = await db.collection('sessions').updateOne(
      { sessionId: sessionId },
      { $set: { status: 'booked', counselorId: counselorId } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ success: true, message: 'Session booked successfully' });
  } catch (error) {
    console.error('Error booking session:', error);
    res.status(500).json({ error: 'Failed to book session', details: error.message });
  }
}

export async function getCounselorSessions(req, res) {
  const { counselorId } = req.params;
  if (!counselorId) {
    return res.status(400).json({ error: 'counselorId is required' });
  }

  try {
    const db = await connectToDb();
    const sessions = await db.collection('sessions').find({ counselorId: counselorId, status: 'booked' }).toArray();
    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching counselor sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions', details: error.message });
  }
}



// List booked/scheduled sessions without counselor filter (used by My Sessions page)
export async function listBookedSessions(req, res) {
  try {
    const db = await connectToDb();
    const docs = await db.collection('sessions')
      .find({ status: { $in: ['booked', 'scheduled'] } })
      .sort({ startedAt: -1 })
      .limit(100)
      .toArray();
    const sessions = (docs || []).map(s => ({
      sessionId: s.sessionId || s.id,
      userName: s.userName || 'Anonymous',
      scheduledAt: s.startedAt,
      duration: s.duration,
      status: s.status || (s.endedAt ? 'completed' : 'scheduled')
    }));
    return res.json({ sessions });
  } catch (error) {
    console.error('Error listing booked sessions:', error);
    return res.status(500).json({ error: 'Failed to list booked sessions' });
  }
}
