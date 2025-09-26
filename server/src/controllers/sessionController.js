import Session from "../models/Session.js";
// import Counsellor from "../models/Counsellor.js";

// Get all sessions for a counselor
export const getCounselorSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('counsellorId', 'name specialization')
      .sort({ scheduledAt: -1 });
    
    res.json({ sessions });
  } catch (error) {
    console.error("Error fetching counselor sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

// Get specific session details with messages
export const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findOne({ sessionId })
      .populate('counsellorId', 'name specialization contactNumber');
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json(session);
  } catch (error) {
    console.error("Error fetching session details:", error);
    res.status(500).json({ error: "Failed to fetch session details" });
  }
};

// Send message in session
export const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, sender, timestamp } = req.body;
    
    if (!message || !sender) {
      return res.status(400).json({ error: "Message and sender are required" });
    }
    
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    const newMessage = {
      message,
      sender,
      timestamp: timestamp || new Date()
    };
    
    session.messages.push(newMessage);
    await session.save();
    
    res.json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Save session notes
export const saveNotes = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;
    
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    session.notes = notes;
    await session.save();
    
    res.json({ message: "Notes saved successfully" });
  } catch (error) {
    console.error("Error saving notes:", error);
    res.status(500).json({ error: "Failed to save notes"});
  }
};

// Update session status
export const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['scheduled', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    const updateData = { status };
    
    if (status === 'active' && !session.startedAt) {
      updateData.startedAt = new Date();
    }
    
    if (status === 'completed' && session.startedAt) {
      updateData.endedAt = new Date();
      updateData.duration = Math.round((new Date() - session.startedAt) / (1000 * 60));
    }
    
    Object.assign(session, updateData);
    await session.save();
    
    res.json({ message: "Session status updated successfully", session });
  } catch (error) {
    console.error("Error updating session status:", error);
    res.status(500).json({ error: "Failed to update session status" });
  }
};

// Get user session history
export const getUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await Session.find({ userId })
      .populate('counsellorId', 'name specialization')
      .sort({ createdAt: -1 });
    
    res.json({ sessions });
  } catch (error) {
    console.error("Error fetching user history:", error);
    res.status(500).json({ error: "Failed to fetch user history" });
  }
};
