const menuService = require('../services/menuService');

//---CRUD operations for menu items---

// Controller functions for handling menu item-related requests
//only admin users can create, update, or delete menu items, while all users can list and view them
async function list(req, res, next) {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const items = await menuService.list({ availableOnly: !isAdmin });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

// Create a new menu item with the provided data
async function create(req, res, next) {
  try {
    const item = await menuService.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

// Retrieve a menu item by its ID
async function getById(req, res, next) {
  try {
    const item = await menuService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

// Update a menu item by its ID with the provided data
async function update(req, res, next) {
  try {
    const item = await menuService.update(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

// Delete a menu item by removing it from the database
async function remove(req, res, next) {
  try {
    await menuService.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };