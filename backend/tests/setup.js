import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

// Start an in-memory MongoDB server for testing
export async function startTestDB() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

// Clear the database and disconnect from the in-memory MongoDB server
export async function stopTestDB() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}


// Clear all collections in the test database
export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}