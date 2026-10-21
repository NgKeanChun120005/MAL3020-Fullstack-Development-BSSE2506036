import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';

dotenv.config();

// Get the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server after connecting to the database
async function start() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();