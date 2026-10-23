const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    passwordHash: {
      type: String,
      required: true,
      select: false   // Ensures that password string is hidden from the results by default
    },
    role: {
      type: String,
      enum: ['customer', 'kitchen', 'admin'], //Restricts the role field so it can only ever be one of these three
      default: 'customer'
    }
  },
  { timestamps: true }
);

// Hash password before save if it was modified
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

// Helper method to compare a plaintext password
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// create a collection named 'User' in the database using the userSchema
const User = mongoose.model('User', userSchema);

module.exports = { User };