const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// setup.js is used to set up and tear down the in-memory MongoDB server for testing purposes.

let mongod;

// Start an in-memory MongoDB server for testing
async function startTestDB() {
   if (mongoose.connection.readyState === 1) return;
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

// Clear the database and disconnect from the in-memory MongoDB server
async function stopTestDB() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}


// Clear all collections in the test database
async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

// Root Hooks
before(async () => {
  await startTestDB();
});

after(async () => {
  await stopTestDB();
});

module.exports = { startTestDB, stopTestDB, clearTestDB };