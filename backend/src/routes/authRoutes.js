const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

//authRoutes.js passes URL path from HTTP to authController.js

const router = express.Router();


// setup user registration route
router.post(
  '/register',
  [
    // passes through 3 checks before the data is fully sent
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  //looks at the results of the validation array
  // If any of the checks failed, validate will immediately stop request and send error messsage to user
  validate,
  authController.register
);

// setup user login route
router.post(
  '/login',
  [
      // passes through 2 checks before the data is fully sent
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  validate,
  authController.login
);

router.get('/me', authMiddleware, authController.me);

module.exports = router;