const http = require('http');
const { createApp } = require('../src/app');
const { initSocketServer } = require('../src/sockets/socketServer');
const { setIO } = require('../src/sockets/emitter');

function startTestServer({ corsOrigin = '*' } = {}) {
  const app = createApp();
  const httpServer = http.createServer(app);
  const io = initSocketServer(httpServer, { corsOrigin });
  setIO(io);

  return new Promise((resolve) => {
    httpServer.listen(0, () => {   // 0 = random free port
      const port = httpServer.address().port;
      resolve({ httpServer, io, port });
    });
  });
}

function stopTestServer({ httpServer, io }) {
  return new Promise((resolve) => {
    io.close();
    httpServer.close(() => resolve());
  });
}

module.exports = { startTestServer, stopTestServer };