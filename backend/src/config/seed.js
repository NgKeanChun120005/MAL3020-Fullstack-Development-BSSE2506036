require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models/User');
const { MenuItem } = require('../models/MenuItem');

// seed.js populates the database with initial data for users and menu items.
// It connects to the MongoDB database, checks if the specified users and menu items already exist, and creates them if they don't.
// This will be used for setting up a development or testing environment with predefined data.

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

// Seed data for menu items
const SEED_MENU = [
  { name: 'Margherita Pizza', description: 'Tomato, mozzarella, basil', price: 9.5, category: 'mains' },
  { name: 'Pepperoni Pizza', description: 'Tomato, mozzarella, pepperoni', price: 10.5, category: 'mains' },
  { name: 'Beef Burger', description: 'Beef patty, cheese, pickles, sauce', price: 8.0, category: 'mains' },
  { name: 'Chicken Wrap', description: 'Grilled chicken, lettuce, mayo', price: 7.0, category: 'mains' },
  { name: 'Garlic Bread', description: 'With herb butter', price: 3.5, category: 'sides' },
  { name: 'French Fries', description: 'Crispy salted fries', price: 3.0, category: 'sides' },
  { name: 'Cola', description: '330ml can', price: 1.8, category: 'drinks' },
  { name: 'Sparkling Water', description: '500ml bottle', price: 1.5, category: 'drinks' },
  { name: 'Chocolate Brownie', description: 'Warm, with cream', price: 4.5, category: 'desserts' },
  { name: 'Ice Cream', description: 'Vanilla, two scoops', price: 3.5, category: 'desserts' }
];

// Seed function to populate the database with initial data
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Seed users
  for (const spec of SEED_USERS) {
    // finds this specific user email in the database before seeding
    const existing = await User.findOne({ email: spec.email });
   // if user email already exists, skip the create process for that specific user.
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
    console.log(`Created user: ${spec.email} (role=${spec.role})`);
  }

  // Seed menu items
  for (const spec of SEED_MENU) {
    // Check if the menu item already exists to avoid duplicates
    const existing = await MenuItem.findOne({ name: spec.name });
    if (existing) {
      console.log(`Skipping (exists): ${spec.name}`);
      continue;
    }
    // Create the menu item
    await MenuItem.create(spec);
    console.log(`Created: ${spec.name}`);
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