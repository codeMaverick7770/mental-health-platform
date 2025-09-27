import Session from "../models/Session.js";
import AdminSessionSummary from "../models/AdminSessionSummary.js";
import AdminCounselor from "../models/AdminCounselor.js";

// POST /api/book/admin – creates or books a session
export const bookByAdmin = async (req, res) => {
    try {
      console.log("hello");
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

      // Resolve userId from AdminSessionSummary if available
      const adminSummary = await AdminSessionSummary.findOne({ sessionId }).lean();
      if (!adminSummary || !adminSummary.studentId) {
        return res.status(400).json({ error: "Admin session missing studentId. Cannot create session without a linked user." });
      }
      const resolvedUserId = adminSummary.studentId; // keep as ObjectId for Session.userId ref: 'User'
  
      // If summary has a counselor, load details
      let counselor = null;
      if (adminSummary.counselorId) {
        counselor = await AdminCounselor.findById(adminSummary.counselorId).lean();
      }

      const sessionData = {
        sessionId,
        userId: resolvedUserId,
        userName: `User ${String(sessionId).slice(-8)}`,
        status: "scheduled",
        booked: false,
        priority: (priority || report?.priority || 'medium').toString().toLowerCase(),
        riskAssessment: report?.riskAssessment || undefined,
        immediateActions: Array.isArray(report?.immediateActions) ? report.immediateActions : undefined,
        studentInfo: report?.studentInfo || undefined,
        bookingNeeded: false,
        ...(counselor ? {
          counsellorId: counselor._id,
          counsellorName: counselor.name,
          counsellorLicenseId: counselor.licenseId || undefined,
        } : {})
      };


  
      // Check if session already exists
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
