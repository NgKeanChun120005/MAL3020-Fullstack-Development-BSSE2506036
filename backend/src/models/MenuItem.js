const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative']
    },
    category: {
      type: String,
      required: true,
      //Restricts the category field so it can only ever be one of these four
      enum: ['mains', 'sides', 'drinks', 'desserts']
    },

    // Indicates whether the menu item is currently available for order
    // Soft-hides items rather than deleting, important for orders that reference them later
    available: {
      type: Boolean,
      default: true
    }
  },
  // Add timestamps to the schema to automatically manage createdAt and updatedAt fields
  { timestamps: true }
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = { MenuItem };