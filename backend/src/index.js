import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'takeaway-backend' });
});

// 404 fallback
app.use((req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// if there's system bugs or errors hands the error to errorHandler middleware
app.use(errorHandler);

// Start server and connect to the database
const PORT = process.env.PORT || 5000;


// temporary import for testing
import { User } from './models/User.js'; 

async function start() {
  await connectDB();

  // ---TEMP: verify model works, remove after testing---
const testUser = await User.create({
  name: 'Test Customer',
  email: 'test@example.com',
  passwordHash: 'plaintext123',
  role: 'customer'
});
console.log('Test user created:', testUser.email, '| role:', testUser.role);

const found = await User.findOne({ email: 'test@example.com' }).select('+passwordHash');
console.log('Password matches?', await found.comparePassword('plaintext123'));   // true
console.log('Wrong password?', await found.comparePassword('wrong'));            // false

// Clean up
await User.deleteOne({ email: 'test@example.com' });
console.log('Test user removed');

// ---END TEMP---

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}



start();