const { expect } = require('chai');
const request = require('supertest');
const { io: ioClient } = require('socket.io-client');
const { clearTestDB } = require('./setup');
const { startTestServer, stopTestServer } = require('./socketSetup');
const { User } = require('../src/models/User');
const { MenuItem } = require('../src/models/MenuItem');

process.env.JWT_SECRET = 'test-secret';

let testServer;
let baseUrl;
let menuItemA;
let customerToken;
let kitchenToken;

async function registerAndLogin(email, role = 'customer') {
  const reg = await request(baseUrl)
    .post('/api/auth/register')
    .send({ name: 'Test', email, password: 'secret123' });

  if (role !== 'customer') {
    await User.updateOne({ email }, { role });
  }

  const login = await request(baseUrl)
    .post('/api/auth/login')
    .send({ email, password: 'secret123' });

  return login.body.token;
}

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    const socket = ioClient(baseUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: false
    });
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', reject);
  });
}

before(async () => {
  testServer = await startTestServer();
  baseUrl = `http://localhost:${testServer.port}`;
});

after(async () => {
  await stopTestServer(testServer);
});

beforeEach(async () => {
  await clearTestDB();

  customerToken = await registerAndLogin('cust@test.local', 'customer');
  kitchenToken = await registerAndLogin('kitchen@test.local', 'kitchen');

  [menuItemA] = await MenuItem.create([
    { name: 'Pizza', price: 9.5, category: 'mains', available: true }
  ]);
});

describe('Socket.IO authentication', () => {
  it('rejects connections without a token', async () => {
    const socket = ioClient(baseUrl, {
      transports: ['websocket'],
      reconnection: false
    });

    const err = await new Promise((resolve) => {
      socket.on('connect_error', resolve);
      socket.on('connect', () => resolve(null));
    });

    expect(err).to.exist;
    expect(err.message).to.match(/token/i);
    socket.close();
  });

  it('rejects connections with an invalid token', async () => {
    const socket = ioClient(baseUrl, {
      auth: { token: 'nonsense' },
      transports: ['websocket'],
      reconnection: false
    });

    const err = await new Promise((resolve) => {
      socket.on('connect_error', resolve);
      socket.on('connect', () => resolve(null));
    });

    expect(err).to.exist;
    socket.close();
  });
});

describe('order:new event', () => {
  it('notifies kitchen when a customer places an order', async () => {
    const kitchenSocket = await connectSocket(kitchenToken);

    const received = new Promise((resolve) => {
      kitchenSocket.on('order:new', resolve);
    });

    await request(baseUrl)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 2 }],
        address: '123 Test St'
      });

    const payload = await received;
    expect(payload.status).to.equal('placed');
    expect(payload.total).to.equal(19);   // 2 * 9.5
    expect(payload.items).to.have.lengthOf(1);

    kitchenSocket.close();
  });

  it('does not notify customers', async () => {
    const customerSocket = await connectSocket(customerToken);

    let received = false;
    customerSocket.on('order:new', () => { received = true; });

    await request(baseUrl)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 1 }],
        address: '123 Test St'
      });

    // Give socket a moment to potentially receive
    await new Promise((r) => setTimeout(r, 200));
    expect(received).to.be.false;

    customerSocket.close();
  });
});

describe('order:status event', () => {
  it('notifies the order room when status changes', async () => {
    // Customer places order via HTTP
    const orderRes = await request(baseUrl)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ menuItemId: menuItemA._id.toString(), qty: 1 }],
        address: '123 Test St'
      });

    const orderId = orderRes.body._id;

    // Customer socket joins the order room
    const customerSocket = await connectSocket(customerToken);
    customerSocket.emit('order:join', orderId);

    // Give the server a moment to process the join
    await new Promise((r) => setTimeout(r, 100));

    const received = new Promise((resolve) => {
      customerSocket.on('order:status', resolve);
    });

    // Kitchen updates status via HTTP
    await request(baseUrl)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${kitchenToken}`)
      .send({ status: 'preparing' });

    const payload = await received;
    expect(payload._id).to.equal(orderId);
    expect(payload.status).to.equal('preparing');

    customerSocket.close();
  });
});