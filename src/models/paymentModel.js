const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const paymentModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    required: true,
    enum: [
      'credit_card',
      'apple_pay',
      'google_pay',
      'amazon_pay',
      'stripe',
      'paypal',
      'bank_transfer',
    ],
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  transactionId: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

paymentModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Payment-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Payment', paymentModel);
