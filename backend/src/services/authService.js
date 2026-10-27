const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');

// authService.js 

// Generates a JSON Web Token (JWT) containing the user's ID and role.
// This token acts like a digital ID card that expires in 7 days, allowing the user to stay logged in.
function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

//It strips away sensitive internal database properties (like password hashes) and returns only safe data
function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

// When a user attempts to sign up, this function execute rules for account creation
async function register({ name, email, password }) {
  // checks for email duplicates.
  const existing = await User.findOne({ email });
 // If it already exists in database, send error 409
  if (existing) throw new AppError(409, 'Email already registered');

  // if email is unique, saves the new user record into the database
  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: 'customer'
  });

  // Signs a new JWT token for the user, packages it up with the sanitized user details, and returns them.
  const token = signToken(user);
  return { token, user: publicUser(user) };
}

//When a user attempts to sign in, this function validates their identity
async function login({ email, password }) {
  // Find the user by email and include the passwordHash field for comparison
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new AppError(401, 'Invalid credentials');

  // Compare the provided password with the stored password hash
  const ok = await user.comparePassword(password);
  if (!ok) throw new AppError(401, 'Invalid credentials');

  // Return the token and public user data
  const token = signToken(user);
  return { token, user: publicUser(user) };
}

module.exports = { register, login };