import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

// Creates and configures Express application instance.
export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
  app.use(express.json());

  // health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'takeaway-backend' });
  });

  // Mount the auth routes at /api/auth
  app.use('/api/auth', authRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  // Error handling
  app.use(errorHandler);

  return app;
}