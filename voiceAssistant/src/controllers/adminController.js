import { sessions, adminReporting, realtimeEvents } from '../state.js';
import { generateAdminReport } from '../dialogue.js';

export function dashboard(req, res) {
  try {
    const data = adminReporting.generateDashboardData();
    // Ensure Total Sessions shows active sessions even before finalization
    if (!data.overview) data.overview = {};
    data.overview.totalSessions = Math.max(
      Number(data.overview.totalSessions || 0),
      sessions.size
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate dashboard data', details: error.message });
  }
}

export function listSessions(req, res) {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const allSessions = Array.from(sessions.values())
      .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
      .slice(offset, offset + parseInt(limit));
    res.json({ sessions: allSessions, total: sessions.size, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}

export function getSession(req, res) {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    generateAdminReport(sessionId)
      .then(adminReport => res.json({ session, adminReport }))
      .catch(err => res.status(500).json({ error: 'Failed to generate admin report', details: err?.message || String(err) }));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
}

export function analytics(req, res) {
  try {
    const { timeframe = '30d' } = req.query;
    const data = adminReporting.generateAnalyticsReport(timeframe);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
}

export function alerts(req, res) {
  try {
    const alerts = adminReporting.getActiveAlerts();
    res.json({ alerts, realtime: realtimeEvents.slice(-50) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}


