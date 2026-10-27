const authService = require('../services/authService');

// menuController.js is a controller functions for handling authentication-related requests
// Translating and passing requests and data between HTTP and authServices.

// Controller functions for handling authentication-related requests
async function register(req, res, next) {
  // Extract the name, email, and password from the request body and call the authService to register a new user
  try {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });
    res.status(201).json(result);
  } 
  // If an error occurs during registration, pass the error to the next middleware (error handler)
  catch (err) {
    next(err);
  }
}

// Controller function for handling user login requests
async function login(req, res, next) {
  // Extract the email and password from the request body and call the authService to authenticate the user
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.status(200).json(result);
  } 
  // If an error occurs during login, pass the error to the next middleware (error handler)
  catch (err) {
    next(err);
  }
}

// Controller function for retrieving the authenticated user's information
function me(req, res) {
  // Return the authenticated user's information (attached to req.user by the authMiddleware) in the response
  res.json({ user: req.user });
}

module.exports = { register, login, me };