import express from 'express';
import cors from 'cors';
import adminAuthRoutes from './routes/adminAuth.routes.js';
import ingestRoutes from './routes/ingest.routes.js';

const app = express();
// Configure CORS from env (comma-separated origins) or allow all if not set
const originList = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: originList.length ? originList : true,
  credentials: true,
}));
app.use(express.json());

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/ingest', ingestRoutes);

export default app;
