import express from "express";
import { 
  getCounselorSessions,
  getSessionDetails,
  sendMessage,
  saveNotes,
  updateSessionStatus,
  getUserHistory
} from "../controllers/sessionController.js";

const router = express.Router();

// Counselor session routes
router.get("/counselor/sessions", getCounselorSessions);
router.get("/counselor/session/:sessionId", getSessionDetails);
router.post("/counselor/session/:sessionId/message", sendMessage);
router.post("/counselor/session/:sessionId/notes", saveNotes);
router.post("/counselor/session/:sessionId/status", updateSessionStatus);

// User history routes
router.get("/user/:userId/history", getUserHistory);

export default router;
