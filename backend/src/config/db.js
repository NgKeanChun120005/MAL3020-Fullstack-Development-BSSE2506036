const mongoose = require('mongoose');

// db.js is used to connect to the MongoDB database using Mongoose.
// It reads the connection string from environment variables and handles connection errors.

// Connects to the MongoDB database using the connection string from environment variables
async function connectDB() {
  // Attempt to connect to the database 
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } 
  // If failed, catch any connection errors and log them, then exit the process
  catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };