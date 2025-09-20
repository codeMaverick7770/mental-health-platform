import express from 'express';
import cors from 'cors';

import adminBookingRouter from "../routes/adminBookingRoutes.js";
import sessionRouter from "../routes/sessionRoutes.js";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api", adminBookingRouter);
app.use("/api", sessionRouter);

// Health check endpoint
app.get("/", (req, res) => {
    res.send("Mental Health Platform API is running");
}); 

export default app;
