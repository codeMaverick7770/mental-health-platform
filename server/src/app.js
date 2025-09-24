import express from 'express';
import cors from 'cors';
import adminAuthRoutes from './routes/adminAuth.routes.js';
import ingestRoutes from './routes/ingest.routes.js';
import adminBookingRouter from "../routes/adminBookingRoutes.js";
import sessionRouter from "../routes/sessionRoutes.js";

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

// Routes
app.use("/api", adminBookingRouter);
app.use("/api", sessionRouter);

// Health check endpoint
app.get("/", (req, res) => {
    res.send("Mental Health Platform API is running");
}); 

export default app;
