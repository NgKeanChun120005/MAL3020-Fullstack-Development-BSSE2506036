const { expect } = require('chai');
const request = require('supertest');
const { createApp } = require('../src/app');
const { clearTestDB } = require('./setup');

// this is an integration test suite for the authentication routes of the application.
// It uses Mocha as the test framework, Chai for assertions, and Supertest to make HTTP requests to the Express app.
// The tests cover user registration, login, and retrieving the authenticated user's information.

// Set JWT secret before importing anything that reads it
process.env.JWT_SECRET = 'test-secret';

let app;

//express app instance is created before all tests
before(async () => {
  app = createApp();
});


// Clear the database before each test
beforeEach(async () => {
  await clearTestDB();
});

describe('POST /api/auth/register', () => {
  //Test case for successful customer registration and secure data return
  it('creates a new customer and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });

    expect(res.status).to.equal(201);
    expect(res.body.token).to.be.a('string');
    expect(res.body.user.email).to.equal('alice@example.com');
    expect(res.body.user.role).to.equal('customer');
    expect(res.body.user.passwordHash).to.be.undefined;
  });

   //test case for duplicate email registration
  it('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice 2', email: 'alice@example.com', password: 'secret456' });

    expect(res.status).to.equal(409);
    expect(res.body.error).to.match(/already/i);
  });

  //test case for short password registration
  it('rejects short passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: '123' });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.match(/password/i);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });
  });

  //test case for successful login with valid credentials
  it('logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'secret123' });

    expect(res.status).to.equal(200);
    expect(res.body.token).to.be.a('string');
    expect(res.body.user.email).to.equal('alice@example.com');
  });

  //test case for wrong password and unknown email login attempts
  it('rejects wrong password with same error as unknown email', async () => {
    const wrongPass = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'wrong' });

    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });

    expect(wrongPass.status).to.equal(401);
    expect(unknownEmail.status).to.equal(401);
    expect(wrongPass.body.error).to.equal(unknownEmail.body.error);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });
    token = res.body.token;
  });

  //test case for retrieving current user with valid token
  it('returns the current user with a valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.user.role).to.equal('customer');
  });

  //test case for requests with no token
  it('rejects requests with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).to.equal(401);
  });

  //test case for requests with invalid token
  it('rejects invalid tokens', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer nonsense');
    expect(res.status).to.equal(401);
  });
});