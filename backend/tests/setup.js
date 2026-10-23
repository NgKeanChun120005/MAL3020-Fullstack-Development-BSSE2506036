const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Start an in-memory MongoDB server for testing
async function startTestDB() {
    mongod = await MongoMemoryServer.create({
    instance: {
      launchTimeout: 120000 
    }
  });
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

module.exports = { startTestDB, stopTestDB, clearTestDB };