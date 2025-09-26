import Session from "../models/Session.js";

// POST /api/book/admin – creates a session pending counselor assignment
export const bookByAdmin = async (req, res) => {
    try {
      const { sessionId, priority } = req.body || {};
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
  
      // Enrich from Voice Assistant counselor report when available
      const VA_BASE = process.env.VOICE_ASSISTANT_URL || 'http://localhost:3000';
      let report = null;
      try {
        const r = await fetch(`${VA_BASE}/api/counselor/report/${encodeURIComponent(sessionId)}`);
        if (r.ok) report = await r.json();
      } catch (_) { /* optional */ }
  
      const sessionData = {
        sessionId,
        userId: `user_${sessionId}`,
        userName: `User ${String(sessionId).slice(-8)}`,
        status: "scheduled",
        booked: true,
        priority: (priority || report?.priority || 'medium').toString().toLowerCase(),
        riskAssessment: report?.riskAssessment || undefined,
        immediateActions: Array.isArray(report?.immediateActions) ? report.immediateActions : undefined,
        studentInfo: report?.studentInfo || undefined,
        bookingNeeded: false
      };
  
      // Prevent duplicate booking for same sessionId
      const existing = await Session.findOne({ sessionId });
      if (existing) {
        return res.status(400).json({
          error: "Session already booked",
          message: "This session has already been booked",
          session: existing
        });
      }
  
      const session = await Session.create(sessionData);
      // Verify persistence by reading back
      const verify = await Session.findOne({ sessionId: session.sessionId });
      if (!verify) {
        return res.status(500).json({ error: 'Failed to persist session' });
      }
  
      return res.status(201).json({
        message: "Session created and pending counselor assignment",
        stored: true,
        sessionId: session.sessionId,
        session,
        assigned: null
      });
    } catch (err) {
      console.error('Admin booking error:', err);
      return res.status(500).json({ error: err.message || 'Internal error' });
    }
  };
