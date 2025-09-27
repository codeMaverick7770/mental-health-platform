import express from "express";
import { 
  getCounselorSessions,
  getSessionDetails,
  sendMessage,
  saveNotes,
  updateSessionStatus,
  getUserHistory,
  listCounselorReports,
  getCounselorReport,
  createOrUpdateSession
} from "../controllers/sessionController.js";

const router = express.Router();

// Counselor session routes
router.get("/counselor/sessions", getCounselorSessions);
router.get("/counselor/session/:sessionId", getSessionDetails);
router.post("/counselor/session/:sessionId/message", sendMessage);
router.post("/counselor/session/:sessionId/notes", saveNotes);
router.post("/counselor/session/:sessionId/status", updateSessionStatus);
// Counselor reports for dashboard
router.get("/counselor/reports", listCounselorReports);
router.get("/counselor/report/:sessionId", getCounselorReport);

// User history routes
router.get("/user/:userId/history", getUserHistory);

// Route for voice assistant to persist session data
router.post("/session/persist", createOrUpdateSession);

export default router;
