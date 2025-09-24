import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js';
import { connectDB } from './src/db/connection.js';

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Admin server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
