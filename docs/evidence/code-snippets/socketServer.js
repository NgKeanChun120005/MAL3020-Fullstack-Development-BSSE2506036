const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// socketServer.js sets up a Socket.IO server that allows real-time communication between clients and the server.

// Initializes the Socket.IO server with JWT authentication and room management
function initSocketServer(httpServer, { corsOrigin }) {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin || '*' }
  });

  // JWT authentication on handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided'));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // Kitchen and admin auto-join the 'kitchen' room
    if (socket.user.role === 'kitchen' || socket.user.role === 'admin') {
      socket.join('kitchen');
    }

    // Anyone can join an order room by ID — the controller enforces
    // ownership on the HTTP side, and order IDs are non-guessable ObjectIds
    socket.on('order:join', (orderId) => {
      if (typeof orderId === 'string' && orderId.length === 24) {
        socket.join(`order:${orderId}`);
      }
    });

    socket.on('order:leave', (orderId) => {
      socket.leave(`order:${orderId}`);
    });
  });

  return io;
}

module.exports = { initSocketServer };