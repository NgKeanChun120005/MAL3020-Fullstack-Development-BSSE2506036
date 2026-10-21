import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

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

export async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError(409, 'Email already registered');

  const user = await User.create({
    name,
    email,
    passwordHash: password,
    role: 'customer'           // registration is customer-only
  });

  const token = signToken(user);
  return { token, user: publicUser(user) };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new AppError(401, 'Invalid credentials');

  const ok = await user.comparePassword(password);
  if (!ok) throw new AppError(401, 'Invalid credentials');

  const token = signToken(user);
  return { token, user: publicUser(user) };
}