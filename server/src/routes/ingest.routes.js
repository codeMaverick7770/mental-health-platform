import { Router } from 'express';
import { requireIngestKey } from '../middleware/adminAuth.js';
import { ingestSessionStart, ingestSessionEnd, ingestRiskEvent } from '../controllers/ingestController.js';

const router = Router();

router.post('/sessions', requireIngestKey, ingestSessionStart);
router.patch('/sessions/:sessionId/end', requireIngestKey, ingestSessionEnd);
router.post('/risk-events', requireIngestKey, ingestRiskEvent);

export default router;
