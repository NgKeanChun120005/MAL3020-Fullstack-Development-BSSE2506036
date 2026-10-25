const { MenuItem } = require('../models/MenuItem');
const { AppError } = require('../utils/AppError');

// List all menu items
// availableOnly is used so that customer route should only see available items, while admin can see all items
async function list({ availableOnly = false } = {}) {
  const query = availableOnly ? { available: true } : {};
  return MenuItem.find(query).sort({ category: 1, name: 1 });
}

// Retrieve a menu item by its ID, throwing an error if not found
async function getById(id) {
  const item = await MenuItem.findById(id);
  if (!item) throw new AppError(404, 'Menu item not found');
  return item;
}

// Create a new menu item with the provided data
async function create(data) {
  return MenuItem.create(data);
}

// Update a menu item by its ID with the provided data
async function update(id, data) {
  const item = await MenuItem.findByIdAndUpdate(id, data, {
    new: true,
    //since findByIdAndUpdate bypasses schema validation (ex: admin set price to -5), runValidators ensures that the updated data adheres to the schema's validation rules
    runValidators: true
  });
  if (!item) throw new AppError(404, 'Menu item not found');
  return item;
}

// Soft delete a menu item by removing it from the database
async function remove(id) {
  const item = await MenuItem.findByIdAndDelete(id);
  if (!item) throw new AppError(404, 'Menu item not found');
  return item;
}

module.exports = { list, getById, create, update, remove };