import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'takeaway-backend' });
});

// Reads the routes from authRoutes.js and mounts them at /api/auth
app.use('/api/auth', authRoutes);

// 404 fallback
app.use((req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// if there's system bugs or errors hands the error to errorHandler middleware
app.use(errorHandler);

// Start server and connect to the database
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();