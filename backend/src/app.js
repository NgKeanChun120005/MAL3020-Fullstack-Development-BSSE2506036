const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const menuRoutes = require('./routes/menuRoutes');

// Creates and configures Express application instance.
function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
  app.use(express.json());

  // health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'takeaway-backend' });
  });

  // Mount the auth routes at /api/auth
  app.use('/api/auth', authRoutes);
// Mount the menu routes at /api/menu
  app.use('/api/menu', menuRoutes);

  // Catch-all route for undefined endpoints
  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  

  // Error handling
  app.use(errorHandler);

  return app;
}
module.exports = { createApp };