const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { AppError } = require('../utils/AppError');

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError(409, 'Email already registered');

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: 'customer'
  });

  const token = signToken(user);
  return { token, user: publicUser(user) };
}

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