const menuService = require('../services/menuService');

//---HTTP Handlers for menu CRUD routes---

// menuController.js is a controller functions for handling menu-item related requests.
// Translating and passing requests and data between HTTP and menuServices.

// Only admin users can create, update, or delete menu items, while all users can list and view them
async function list(req, res, next) {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const items = await menuService.list({ availableOnly: !isAdmin });
    res.json(items);
  } 
  // If an error occurs during registration, pass the error to the next middleware (error handler)
  catch (err) {
    next(err);
  }
}

// Create a new menu item with the provided data
async function create(req, res, next) {
  try {
    const item = await menuService.create(req.body);
    res.status(201).json(item);
  } 
  // If an error occurs during creation of new menu item, pass the error to the next middleware (error handler)
  catch (err) {
    next(err);
  }
}

// Retrieve a menu item by its ID
async function getById(req, res, next) {
  try {
    const item = await menuService.getById(req.params.id);
    res.json(item);
  } 
  // If an error occurs during menu ID retrieval, pass the error to the next middleware (error handler)
  catch (err) {
    next(err);
  }
}

// Update a menu item by its ID with the provided data
async function update(req, res, next) {
  try {
    const item = await menuService.update(req.params.id, req.body);
    res.json(item);
  } 
  // If an error occurs during menu item update, pass the error to the next middleware (error handler)
  catch (err) {
    next(err);
  }
}

// Delete a menu item by removing it from the database
async function remove(req, res, next) {
  try {
    await menuService.remove(req.params.id);
    res.status(204).send();
  } 
  // If an error occurs when deleting menu, pass the error to the next middleware (error handler)
  catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };