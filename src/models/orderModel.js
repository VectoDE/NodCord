const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered'],
    default: 'Pending',
  },
  trackingNumber: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

orderModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Order-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderModel);
