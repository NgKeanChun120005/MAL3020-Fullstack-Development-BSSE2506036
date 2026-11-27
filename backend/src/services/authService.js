const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');
const crypto = require('crypto');

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

//Strips away sensitive internal database properties (password hashes) and returns only safe data
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

async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) throw new AppError(404, 'User not found');

  if (user.role !== 'customer') {
    throw new AppError(403, 'Password reset is only available for customer accounts');
  }

  //generate a random token and set it to expire in 1 hour
  const token = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  // return the token in the response
  return { 
    message: 'Token generated successfully.',
    token: token 
  };
}
async function resetPassword(token, newPassword) {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) throw new AppError(400, 'Invalid or expired token');

  user.passwordHash = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return { message: 'Password reset successful' };
}

module.exports = { register, login, forgotPassword, resetPassword };