const mongoose = require('mongoose');

const paymentModel = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Verweist auf das User-Modell, falls vorhanden
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

module.exports = mongoose.model('Payment', paymentModel);
