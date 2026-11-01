require('dotenv').config();
const http = require('http');
const { connectDB } = require('./config/db');
const { createApp } = require('./app');
const { initSocketServer } = require('./sockets/socketServer');
const { setIO } = require('./sockets/emitter');

// Get the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server after connecting to the database
async function start() {
  await connectDB();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = initSocketServer(httpServer, {
    corsOrigin: process.env.CLIENT_ORIGIN
  });
  setIO(io);

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Socket.IO listening on the same port`);
  });
}

start();