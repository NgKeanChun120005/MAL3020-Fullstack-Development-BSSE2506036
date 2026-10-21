import { jest } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { startTestDB, stopTestDB, clearTestDB } from './setup.js';

// Set JWT secret before importing anything that reads it
process.env.JWT_SECRET = 'test-secret';

let app;

// Start the in-memory MongoDB server and create the app before all tests
beforeAll(async () => {
  await startTestDB();
  app = createApp();
});

// Stop the in-memory MongoDB server after all tests
afterAll(async () => {
  await stopTestDB();
});

// Clear the database before each test
beforeEach(async () => {
  await clearTestDB();
});

describe('POST /api/auth/register', () => {
  it('creates a new customer and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user.role).toBe('customer');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

   //test case for duplicate email registration
  it('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice 2', email: 'alice@example.com', password: 'secret456' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already/i);
  });

  //test case for short password registration
  it('rejects short passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
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

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@example.com');
  });

  //test case for wrong password and unknown email login attempts
  it('rejects wrong password with same error as unknown email', async () => {
    const wrongPass = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'wrong' });

    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'secret123' });

    expect(wrongPass.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPass.body.error).toBe(unknownEmail.body.error);
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

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('customer');
  });

  //test case for requests with no token
  it('rejects requests with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  //test case for requests with invalid token
  it('rejects invalid tokens', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer nonsense');
    expect(res.status).toBe(401);
  });
});