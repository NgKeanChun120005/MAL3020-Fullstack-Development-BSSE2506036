const { expect } = require('chai');
const request = require('supertest');
const { createApp } = require('../src/app');
const { clearTestDB } = require('./setup');
const { User } = require('../src/models/User');
const { MenuItem } = require('../src/models/MenuItem');
const { Order } = require('../src/models/Order');

// This is an integration test suite for the order routes of the application.
// The tests cover creating orders, retrieving orders, and updating order statuses, with role-based access control.


process.env.JWT_SECRET = 'test-secret';

let app;

async function registerAndLogin(email, role = 'customer') {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test', email, password: 'secret123' });

  if (role !== 'customer') {
    await User.updateOne({ email }, { role });
  }

  const login = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'secret123' });

  return login.body.token;
}

before(async () => {
  app = createApp();
});

describe('POST /api/orders', () => {
  let customerToken, kitchenToken, adminToken, menuItemA, menuItemB;

  beforeEach(async () => {
    await clearTestDB();

    customerToken = await registerAndLogin('cust@test.local', 'customer');
    kitchenToken = await registerAndLogin('kitchen@test.local', 'kitchen');
    adminToken = await registerAndLogin('admin@test.local', 'admin');

    const menuItems = await MenuItem.create([
      { name: 'Pizza', price: 9.5, category: 'mains', available: true },
      { name: 'Cola', price: 1.8, category: 'drinks', available: true }
    ]);

    menuItemA = menuItems[0];
    menuItemB = menuItems[1];
  });

  it('creates an order with server-side snapshot of name and price', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          { menuItemId: menuItemA._id.toString(), qty: 2 },
          { menuItemId: menuItemB._id.toString(), qty: 1 }
        ],
         
      });

    expect(res.status).to.equal(201);
    expect(res.body.status).to.equal('placed');
    expect(res.body.total).to.equal(20.8);   // 2*9.5 + 1.8
    expect(res.body.items).to.have.lengthOf(2);
    expect(res.body.items[0].name).to.equal('Pizza');
    expect(res.body.items[0].price).to.equal(9.5);
  });

  it('ignores client-supplied price (security)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 1, price: 0.01 }],
         
      });

    expect(res.body.total).to.equal(9.5);   // server price, not 0.01
    expect(res.body.items[0].price).to.equal(9.5);
  });

  it('rejects non-customers', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${kitchenToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 1 }],
         
      });
    expect(res.status).to.equal(403);
  });

  it('rejects orders for unavailable items', async () => {
    await MenuItem.updateOne({ _id: menuItemA._id }, { available: false });

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 1 }],
         
      });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.match(/not available/i);
  });

  it('rejects empty items array', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [],   });
    expect(res.status).to.equal(400);
  });
});

describe('GET /api/orders/mine', () => {
  let customerToken, kitchenToken, menuItemA, menuItemB;

  beforeEach(async () => {
    await clearTestDB();

    customerToken = await registerAndLogin('cust@test.local', 'customer');
    kitchenToken = await registerAndLogin('kitchen@test.local', 'kitchen');

    const menuItems = await MenuItem.create([
      { name: 'Pizza', price: 9.5, category: 'mains', available: true },
      { name: 'Cola', price: 1.8, category: 'drinks', available: true }
    ]);

    menuItemA = menuItems[0];
    menuItemB = menuItems[1];
  });

  it('returns only the current customer\'s orders', async () => {
    // Customer A places one order
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 1 }],
      });

    // Customer B places another
    const otherToken = await registerAndLogin('cust2@test.local');
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        items: [{ menuItemId: menuItemB._id.toString(), qty: 1 }],
      });

    // Customer A sees only their own
    const res = await request(app)
      .get('/api/orders/mine')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(1);
  });
});

describe('GET /api/orders', () => {
  let customerToken, kitchenToken, adminToken, menuItemA, menuItemB;

  beforeEach(async () => {
    await clearTestDB();

    customerToken = await registerAndLogin('cust@test.local', 'customer');
    kitchenToken = await registerAndLogin('kitchen@test.local', 'kitchen');
    adminToken = await registerAndLogin('admin@test.local', 'admin');

    const menuItems = await MenuItem.create([
      { name: 'Pizza', price: 9.5, category: 'mains', available: true },
      { name: 'Cola', price: 1.8, category: 'drinks', available: true }
    ]);

    menuItemA = menuItems[0];
    menuItemB = menuItems[1];
  });

  it('allows kitchen to list all orders', async () => {
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 1 }],
      });

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${kitchenToken}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(1);
  });

  it('rejects customers', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).to.equal(403);
  });

  it('filters by status', async () => {
    await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 1 }],
      });

    const placed = await request(app)
      .get('/api/orders?status=placed')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(placed.body).to.have.lengthOf(1);

    const completed = await request(app)
      .get('/api/orders?status=completed')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(completed.body).to.have.lengthOf(0);
  });
});

describe('PATCH /api/orders/:id/status', () => {
  let customerToken, kitchenToken, menuItemA, orderId;

  beforeEach(async () => {
    await clearTestDB();

    customerToken = await registerAndLogin('cust@test.local', 'customer');
    kitchenToken = await registerAndLogin('kitchen@test.local', 'kitchen');

    const menuItems = await MenuItem.create([
      { name: 'Pizza', price: 9.5, category: 'mains', available: true },
      { name: 'Cola', price: 1.8, category: 'drinks', available: true }
    ]);

    menuItemA = menuItems[0];

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 1 }],
      });
    orderId = res.body._id;
  });

  it('advances placed → preparing → ready → completed', async () => {
    for (const next of ['preparing', 'ready', 'completed']) {
      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${kitchenToken}`)
        .send({ status: next });
      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal(next);
    }
  });

  it('rejects illegal transition (placed → completed)', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${kitchenToken}`)
      .send({ status: 'completed' });

    expect(res.status).to.equal(400);
    expect(res.body.error).to.match(/cannot move/i);
  });

  it('allows cancelling from placed', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${kitchenToken}`)
      .send({ status: 'cancelled' });
    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal('cancelled');
  });

  it('rejects customers from changing status', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'preparing' });
    expect(res.status).to.equal(403);
  });
});

describe('GET /api/orders/:id (ownership)', () => {
  let customerToken, kitchenToken, menuItemA;

  beforeEach(async () => {
    await clearTestDB();

    customerToken = await registerAndLogin('cust@test.local', 'customer');
    kitchenToken = await registerAndLogin('kitchen@test.local', 'kitchen');

    const menuItems = await MenuItem.create([
      { name: 'Pizza', price: 9.5, category: 'mains', available: true },
      { name: 'Cola', price: 1.8, category: 'drinks', available: true }
    ]);

    menuItemA = menuItems[0];
  });

  it('blocks customers from reading other customers\' orders', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 1 }],
         
      });

    const otherToken = await registerAndLogin('cust3@test.local');
    const res = await request(app)
      .get(`/api/orders/${orderRes.body._id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).to.equal(403);
  });

  it('allows kitchen to read any order', async () => {
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 1 }],
         
      });

    const res = await request(app)
      .get(`/api/orders/${orderRes.body._id}`)
      .set('Authorization', `Bearer ${kitchenToken}`);

    expect(res.status).to.equal(200);
  });
});
