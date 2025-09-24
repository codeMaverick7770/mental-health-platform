import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import adminAuthRoutes from './routes/adminAuth.routes.js';
import ingestRoutes from './routes/ingest.routes.js';
import adminBookingRouter from "../routes/adminBookingRoutes.js";
import sessionRouter from "../routes/sessionRoutes.js";

dotenv.config();
const app = express();
// Configure CORS from env (comma-separated origins) or allow all if not set
const originList = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// ========== Middleware ==========
app.use(cors({
  origin: originList.length ? originList : true,
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/ingest', ingestRoutes);
app.use("/api", adminBookingRouter);
app.use("/api", sessionRouter);

// Health check endpoint
app.get("/", (req, res) => {
    res.send("Mental Health Platform API is running");
}); 

// ========== Import Routes ==========
import authRoutes from "./routes/auth.route.js";
import mediaRoutes from "./routes/media.routes.js";
import userRoutes from "./routes/user.route.js";

// ========== Routes ==========
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/users", userRoutes);

export default app;