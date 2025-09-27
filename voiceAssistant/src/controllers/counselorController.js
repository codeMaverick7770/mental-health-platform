import { sessions, adminReporting } from '../state.js';
import { connectToDb } from '../utils.js';

export async function getCounselorReport(req, res) {
  const { sessionId } = req.params;
  try {
    // Prefer live session to regenerate fresh insights
    const session = sessions.get(sessionId);
    if (session) {
      try {
        const report = await adminReporting.generateCounselorReport(sessionId, session);
        const overall = (report?.riskAssessment?.overallRisk || '').toString().toUpperCase();
        const priority = (report?.priority || '').toString().toUpperCase();
        const bookingNeeded = overall === 'CRISIS' || overall === 'HIGH' || priority === 'CRITICAL';
        return res.json({ ...report, bookingNeeded });
      } catch (e) {
        // fall through to DB
      }
    }
    // Fallback to persisted session (no LLM dependency)
    const db = await connectToDb();
    const persisted = await db.collection('sessions').findOne({ sessionId });
    if (!persisted) return res.status(404).json({ error: 'Session not found' });
    const overall = (persisted?.riskAssessment?.overallRisk || '').toString().toUpperCase();
    const priority = (persisted?.priority || '').toString().toUpperCase();
    const bookingNeeded = overall === 'CRISIS' || overall === 'HIGH' || priority === 'CRITICAL';
    return res.json({
      sessionId,
      startedAt: persisted.startedAt,
      endedAt: persisted.endedAt,
      priority: persisted.priority,
      riskAssessment: persisted.riskAssessment,
      immediateActions: persisted.immediateActions,
      studentInfo: persisted.studentInfo,
      bookingNeeded
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load counselor report' });
  }
}

export async function listCounselorReports(req, res) {
  try {
    const { limit = 20, priority = 'all' } = req.query;
    const db = await connectToDb();
    const q = {};
    if (priority !== 'all') q.priority = new RegExp(`^${priority}$`, 'i');
    const docs = await db.collection('sessions')
      .find(q)
      .sort({ startedAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    const reports = (docs || []).map(s => ({
      sessionId: s.sessionId || s.id,
      startedAt: s.startedAt,
      priority: s.priority,
      riskLevel: s?.riskAssessment?.overallRisk,
      studentInfo: s.studentInfo,
      immediateActions: s.immediateActions,
      bookingNeeded: s.bookingNeeded === true || ['CRISIS', 'HIGH', 'CRITICAL'].includes(String(s?.riskAssessment?.overallRisk || s?.priority || '').toUpperCase())
    }));
    res.json({ reports, total: reports.length, filtered: reports.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch counselor reports' });
  }
}


