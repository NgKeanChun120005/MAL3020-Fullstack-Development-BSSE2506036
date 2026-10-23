require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models/User');

// Seed data for users
const SEED_USERS = [
  {
    name: 'Admin',
    email: 'admin@takeaway.local',
    password: 'admin12345',
    role: 'admin'
  },
  {
    name: 'Kitchen Staff',
    email: 'kitchen@takeaway.local',
    password: 'kitchen12345',
    role: 'kitchen'
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  for (const spec of SEED_USERS) {
    const existing = await User.findOne({ email: spec.email });
    if (existing) {
      console.log(`Skipping (exists): ${spec.email}`);
      continue;
    }
    // Create the user with the specified role
    await User.create({
      name: spec.name,
      email: spec.email,
      passwordHash: spec.password,
      role: spec.role
    });
    console.log(`Created: ${spec.email} (role=${spec.role})`);
  }

    // Disconnect from MongoDB after seeding
  await mongoose.disconnect();
  console.log('Seed complete');
}

// Run the seed function and handle errors
seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});