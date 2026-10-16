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

  // ---TEMP: create multiple persistent test users for Compass inspection---
// Clean up
  const existing1 = await User.findOne({ email: 'compass-test1@example.com' });
if (!existing1) {
  await User.create({
    name: 'Compass Test1',
    email: 'compass-test1@example.com',
    passwordHash: 'plaintext123',
    role: 'customer'
  });
  console.log('Created compass-test1@example.com');
} else {
  console.log('compass-test1@example.com already exists');
}

const existing2 = await User.findOne({ email: 'compass-test2@example.com' });
if (!existing2) {
  await User.create({
    name: 'Compass Test2',
    email: 'compass-test2@example.com',
    passwordHash: 'plaintext123',
    role: 'customer'
  });
  console.log('Created compass-test2@example.com');
} else {
  console.log('compass-test2@example.com already exists');
}

const existing3 = await User.findOne({ email: 'compass-test3@example.com' });
if (!existing3) {
  await User.create({
    name: 'Compass Test3',
    email: 'compass-test3@example.com',
    passwordHash: 'plaintext123',
    role: 'customer'
  });
  console.log('Created compass-test3@example.com');
} else {
  console.log('compass-test3@example.com already exists');
}
// ---END TEMP---

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}



start();