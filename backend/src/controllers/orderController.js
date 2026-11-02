const orderService = require('../services/orderService');

async function create(req, res, next) {
  try {
    const { items, notes } = req.body;
    const order = await orderService.create({
      customerId: req.user.id,
      items,
      notes
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const orders = await orderService.listMine(req.user.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function listAll(req, res, next) {
  try {
    const orders = await orderService.listAll({ status: req.query.status });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const order = await orderService.getById(req.params.id);

    // Customers can only see their own orders, while kitchen and admin see any
    if (req.user.role === 'customer' && String(order.customerId) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const order = await orderService.updateStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listMine, listAll, getById, updateStatus };