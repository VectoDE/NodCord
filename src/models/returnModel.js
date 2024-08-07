const mongoose = require('mongoose');

// Definiere das Schema für Return
const returnSchema = new mongoose.Schema({
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

// Aktualisiere `updatedAt` bei Änderungen
returnSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Erstelle das Modell aus dem Schema
module.exports = mongoose.model('Return', returnSchema);
