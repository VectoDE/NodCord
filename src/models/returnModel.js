const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const returnModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerOrder',
    required: true,
  },
  returnNumber: {
    type: String,
    required: true,
    unique: true,
  },
  returnDate: {
    type: Date,
    default: Date.now,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Requested', 'Approved', 'Rejected', 'Completed'],
    default: 'Requested',
  },
  items: [
    {
      productId: {
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

returnModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Return-${uuidv4()}`;
  }
  next();
});

returnModel.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Return', returnModel);
