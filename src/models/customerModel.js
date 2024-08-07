const mongoose = require('mongoose');

// Definiere das Schema für Customer
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
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
customerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Erstelle das Modell aus dem Schema
module.exports = mongoose.model('Customer', customerSchema);
