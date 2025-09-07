import express from 'express';
import cors from 'cors';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Routes


export default app;
