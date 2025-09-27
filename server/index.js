import dotenv from 'dotenv';
dotenv.config();
import app from './src/app.js';
import { connectDB } from './src/config/connection.js';
import http from 'http';
import { initSocket } from './src/utils/socket.utils.js';

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
