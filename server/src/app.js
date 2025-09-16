import express from 'express';
import cors from 'cors';
import bookingRouter from "../routes/bookingRoutes.js";
import counsellingRouter from "../routes/counsellorRoutes.js";  


const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api", bookingRouter); 
app.use("/api", counsellingRouter);

// Health check endpoint
app.get("/", (req, res) => {
    res.send("Mental Health Platform API is running");
}); 

export default app;
