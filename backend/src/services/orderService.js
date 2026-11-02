const { Order } = require('../models/Order');
const { MenuItem } = require('../models/MenuItem');
const { AppError } = require('../utils/AppError');
const { emitNewOrder, emitOrderStatus } = require('../sockets/emitter');

// Legal status transitions — the entire state machine in one place
const ALLOWED_TRANSITIONS = {
  placed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: []
};

async function create({ customerId, items, address, notes }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, 'Order must contain at least one item');
  }

  // Verify each menuItemId exists, snapshot current name and price
  const hydrated = [];
  let total = 0;

  for (const raw of items) {
    const menuItem = await MenuItem.findById(raw.menuItemId);
    if (!menuItem) {
      throw new AppError(404, `Menu item not found: ${raw.menuItemId}`);
    }
    if (!menuItem.available) {
      throw new AppError(400, `${menuItem.name} is not available`);
    }

    const qty = Math.max(1, parseInt(raw.qty, 10) || 1);
    const lineTotal = menuItem.price * qty;
    total += lineTotal;

    hydrated.push({
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      qty
    });
  }

  const order = await Order.create({
    customerId,
    items: hydrated,
    total: Number(total.toFixed(2)),
    notes: notes ?? ''
  });

  emitNewOrder(order);
  return order;
}

async function listMine(customerId) {
  return Order.find({ customerId }).sort({ createdAt: -1 });
}

async function listAll({ status } = {}) {
  const query = status ? { status } : {};
  return Order.find(query).sort({ createdAt: 1 });
}

async function getById(id) {
  const order = await Order.findById(id);
  if (!order) throw new AppError(404, 'Order not found');
  return order;
}

async function updateStatus(id, next) {
  const order = await Order.findById(id);
  if (!order) throw new AppError(404, 'Order not found');

  const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(next)) {
    throw new AppError(
      400,
      `Cannot move order from "${order.status}" to "${next}"`
    );
  }

  order.status = next;
  await order.save();
  emitOrderStatus(order);
  return order;
}

module.exports = { create, listMine, listAll, getById, updateStatus, ALLOWED_TRANSITIONS };