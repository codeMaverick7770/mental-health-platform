import Session from "../models/Session.js";

// POST /api/book/admin – creates or books a session
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
        booked: false,
        priority: (priority || report?.priority || 'medium').toString().toLowerCase(),
        riskAssessment: report?.riskAssessment || undefined,
        immediateActions: Array.isArray(report?.immediateActions) ? report.immediateActions : undefined,
        studentInfo: report?.studentInfo || undefined,
        bookingNeeded: true
      };
  
      // Check if session already exists
      const existing = await Session.findOne({ sessionId });
      if (existing) {
        // If session exists and is already booked, return error
        if (existing.booked) {
          return res.status(400).json({
            error: "Session already booked",
            message: "This session has already been booked",
            session: existing
          });
        }
        
        // If session exists but not booked, update it to booked
        existing.booked = true;
        existing.status = "scheduled";
        await existing.save();
        
        return res.status(200).json({
          message: "Session successfully booked",
          stored: true,
          sessionId: existing.sessionId,
          session: existing,
          assigned: null
        });
      }
  
      // If session doesn't exist, create it (unbooked by default for counselor review)
      const session = await Session.create(sessionData);
      
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
