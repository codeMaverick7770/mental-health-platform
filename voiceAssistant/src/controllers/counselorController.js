import { sessions, adminReporting } from '../state.js';

export async function getCounselorReport(req, res) {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const report = await adminReporting.generateCounselorReport(sessionId, session);
    const overall = (report?.riskAssessment?.overallRisk || '').toString().toUpperCase();
    const priority = (report?.priority || '').toString().toUpperCase();
    const bookingNeeded = overall === 'CRISIS' || priority === 'CRITICAL';
    res.json({ ...report, bookingNeeded });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate counselor report', details: error.message });
  }
}

export async function listCounselorReports(req, res) {
  try {
    const { limit = 20, priority = 'all' } = req.query;
    const allSessions = Array.from(sessions.values())
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      .slice(0, parseInt(limit));
    const reports = await Promise.all(
      allSessions.map(async (session) => {
        try {
          const report = await adminReporting.generateCounselorReport(session.id, session);
          const overall = (report?.riskAssessment?.overallRisk || '').toString().toUpperCase();
          const pri = (report?.priority || '').toString().toUpperCase();
          const bookingNeeded = overall === 'CRISIS' || pri === 'CRITICAL';
          return {
            sessionId: session.id,
            startedAt: session.startedAt,
            priority: report.priority,
            riskLevel: report.riskAssessment.overallRisk,
            studentInfo: report.studentInfo,
            immediateActions: report.immediateActions,
            bookingNeeded
          };
        } catch (error) {
          return null;
        }
      })
    );
    const validReports = reports.filter(r => r !== null);
    const filtered = priority === 'all' ? validReports : validReports.filter(r => r.priority.toLowerCase() === priority.toLowerCase());
    res.json({ reports: filtered, total: validReports.length, filtered: filtered.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch counselor reports' });
  }
}


