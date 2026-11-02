const express = require('express');
const { body, query } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

// Customer: create and view their own
router.post(
  '/',
  roleGuard('customer'),
  [
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('items.*.menuItemId').isMongoId().withMessage('Invalid menuItemId'),
    body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  orderController.create
);

router.get('/mine', roleGuard('customer'), orderController.listMine);

// Kitchen and admin: see all
router.get(
  '/',
  roleGuard('kitchen', 'admin'),
  [query('status').optional().isIn(['placed', 'preparing', 'ready', 'completed', 'cancelled'])],
  validate,
  orderController.listAll
);

// Any authenticated user, but controller enforces ownership
router.get('/:id', orderController.getById);

// Kitchen and admin: advance status
router.patch(
  '/:id/status',
  roleGuard('kitchen', 'admin'),
  [body('status').isIn(['placed', 'preparing', 'ready', 'completed', 'cancelled'])],
  validate,
  orderController.updateStatus
);

module.exports = router;