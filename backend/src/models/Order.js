const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: { type: String, required: true },    
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 }
  },
  { _id: false }  
);

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Order must contain at least one item'
      }
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['placed', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'placed',
      index: true
    },
    address: {
      type: String,
      required: [true, 'Delivery address is required'],
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
);


orderSchema.methods.toPublic = function () {
  return {
    _id: this._id,
    customerId: this.customerId,
    items: this.items,
    total: this.total,
    status: this.status,
    address: this.address,
    notes: this.notes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order };