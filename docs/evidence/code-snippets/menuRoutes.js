const express = require('express');
const { body } = require('express-validator');
const menuController = require('../controllers/menuController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');

const router = express.Router();

// Optional authentication middleware for listing menu items
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return next();

  // Reuse authMiddleware — it fails closed (401) if the token is invalid
  return authMiddleware(req, res, next);
}

router.get('/', optionalAuth, menuController.list);
router.get('/:id', menuController.getById);

//--- Validation rules for menu item creation and update ---
const menuItemRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
 body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category')
    .isIn(['mains', 'sides', 'drinks', 'desserts'])
    .withMessage('Invalid category')
];

//--- Admin-only routes for creating, updating, and deleting menu items ---

// Create a new menu item with the provided data
router.post(
  '/',
  authMiddleware,
  roleGuard('admin'),
  menuItemRules,
  validate,
  menuController.create
);

// Update a menu item by its ID with the provided data
router.put(
  '/:id',
  authMiddleware,
  roleGuard('admin'),
  menuItemRules,
  validate,
  menuController.update
);

// Delete a menu item by removing it from the database
router.delete(
  '/:id',
  authMiddleware,
  roleGuard('admin'),
  menuController.remove
);

module.exports = router;