import AdminSessionSummary from '../models/AdminSessionSummary.js';
import AdminRiskEvent from '../models/AdminRiskEvent.js';
import AdminCollege from '../models/AdminCollege.js';

export const ingestSessionStart = async (req, res) => {
  try {
    const { sessionId, collegeId, studentId, counselorId, startedAt, language } = req.body;
    if (!sessionId || !collegeId || !studentId || !startedAt) return res.status(400).json({ message: 'Missing required fields' });

    const college = await AdminCollege.findById(collegeId);
    if (!college || !college.isActive) return res.status(404).json({ message: 'College not found or inactive' });

    const exists = await AdminSessionSummary.findOne({ sessionId });
    if (exists) return res.status(200).json({ message: 'Session already exists' });

    await AdminSessionSummary.create({
      sessionId,
      collegeId,
      studentId,
      counselorId: counselorId || undefined,
      startedAt: new Date(startedAt),
      language,
    });

    // Optionally broadcast via socket later
    return res.status(201).json({ message: 'Session created' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Ingest failed' });
  }
};

export const ingestSessionEnd = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { endedAt, durationMinutes, turnsCount, riskLevel, sentiments, topics, copingStrategies, flags, summaryText } = req.body;

    const s = await AdminSessionSummary.findOne({ sessionId });
    if (!s) return res.status(404).json({ message: 'Session not found' });

    s.endedAt = endedAt ? new Date(endedAt) : s.endedAt;
    if (typeof durationMinutes === 'number') s.durationMinutes = durationMinutes;
    if (typeof turnsCount === 'number') s.turnsCount = turnsCount;
    if (riskLevel) s.riskLevel = riskLevel;
    if (sentiments) s.sentiments = sentiments;
    if (Array.isArray(topics)) s.topics = topics;
    if (Array.isArray(copingStrategies)) s.copingStrategies = copingStrategies;
    if (Array.isArray(flags)) s.flags = flags;
    if (typeof summaryText === 'string') s.summaryText = summaryText;

    await s.save();
    return res.json({ message: 'Session updated' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Update failed' });
  }
};

export const ingestRiskEvent = async (req, res) => {
  try {
    const { collegeId, sessionId, type, riskLevel, message } = req.body;
    if (!collegeId || !sessionId || !type || !riskLevel) return res.status(400).json({ message: 'Missing required fields' });

    const ev = await AdminRiskEvent.create({ collegeId, sessionId, type, riskLevel, message });
    return res.status(201).json({ id: ev._id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Ingest failed' });
  }
};
