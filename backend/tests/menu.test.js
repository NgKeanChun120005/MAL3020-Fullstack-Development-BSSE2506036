const { expect } = require('chai');
const request = require('supertest');
const { createApp } = require('../src/app');
const {clearTestDB } = require('./setup');
const { MenuItem } = require('../src/models/MenuItem');


// This is an integration test suite for the menu routes of the application.
// It uses Mocha as the test framework, Chai for assertions, and Supertest to make HTTP requests to the Express app.
// The tests cover retrieving menu items, creating new items, updating existing items, and deleting items.

// Set JWT secret before importing anything that reads it
process.env.JWT_SECRET = 'test-secret';

// Declare variables to hold the Express app instance and JWT tokens for admin and customer users
let app;
let adminToken;
let customerToken;

// Helper function to create a user with a specific role and log them in to obtain a JWT token
async function createUserAndLogin({ role, email }) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test', email, password: 'secret123' });

  // Registration always creates a customer. For admin/kitchen will need to promote the user directly — usually done by a seed script.
  if (role !== 'customer') {
    const { User } = require('../src/models/User');
    await User.updateOne({ email }, { role });
    // Re-login to get a token with the new role embedded
    const relogin = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'secret123' });
    return relogin.body.token;
  }
  return res.body.token;
}

//express app instance is created before all tests
before(async () => {
  app = createApp();
});

// Clear the database before each test and set up users and menu items
beforeEach(async () => {
  await clearTestDB();
  adminToken = await createUserAndLogin({ role: 'admin', email: 'admin@test.local' });
  customerToken = await createUserAndLogin({ role: 'customer', email: 'cust@test.local' });

  // Seed the database with some menu items for testing
  await MenuItem.create([
    { name: 'Pizza', price: 9.5, category: 'mains', available: true },
    { name: 'Hidden Item', price: 5, category: 'sides', available: false }
  ]);
});

// Test suite for the menu routes
describe('GET /api/menu', () => {
    // Test case for retrieving available menu items for anonymous users
  it('returns only available items to anonymous users', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0].name).to.equal('Pizza');
  });

  // Test case for retrieving available menu items for customers
  it('returns all items to admins', async () => {
    const res = await request(app)
      .get('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(2);
  });
});

// Test suite for creating new menu items
describe('POST /api/menu', () => {
    // Test case for allowing admins to create a new menu item
  it('allows admins to create an item', async () => {
    const res = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Burger', price: 8, category: 'mains' });

    expect(res.status).to.equal(201);
    expect(res.body.name).to.equal('Burger');
    const count = await MenuItem.countDocuments();
    expect(count).to.equal(3);
  });

  // Test case for rejecting unauthenticated requests to create a menu item
  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/menu')
      .send({ name: 'Burger', price: 8, category: 'mains' });
    expect(res.status).to.equal(401);
  });

  // Test case for rejecting customers from creating a new menu item
  it('rejects customers with 403', async () => {
    const res = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Burger', price: 8, category: 'mains' });
    expect(res.status).to.equal(403);
  });

  // Test case for rejecting invalid category when creating a new menu item
  it('rejects invalid category', async () => {
    const res = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Burger', price: 8, category: 'invalid' });
    expect(res.status).to.equal(400);
  });

  // Test case for rejecting negative price when creating a new menu item
  it('rejects negative price', async () => {
    const res = await request(app)
      .post('/api/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Burger', price: -5, category: 'mains' });
    expect(res.status).to.equal(400);
  });
});

// Test suite for updating existing menu items
describe('PUT /api/menu/:id', () => {
    // Test case for allowing admins to update an existing menu item
  it('allows admins to update an item', async () => {
    const item = await MenuItem.findOne({ name: 'Pizza' });
    const res = await request(app)
      .put(`/api/menu/${item._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Pizza', price: 12, category: 'mains' });

    expect(res.status).to.equal(200);
    expect(res.body.price).to.equal(12);
  });

  // Test case for rejecting customers from updating a menu item
  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/api/menu/000000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Valid', price: 1, category: 'mains' });
    expect(res.status).to.equal(404);
  });
});

// Test suite for deleting menu items
describe('DELETE /api/menu/:id', () => {
    // Test case for rejecting customers from deleting a menu item
  it('allows admins to delete an item', async () => {
    const item = await MenuItem.findOne({ name: 'Pizza' });
    const res = await request(app)
      .delete(`/api/menu/${item._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).to.equal(204);

    // Verify that the item has been deleted from the database
    const remaining = await MenuItem.findById(item._id);
    expect(remaining).to.be.null;
  });
});