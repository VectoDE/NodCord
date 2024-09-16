const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const customerModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
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

customerModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Customer-${uuidv4()}`;
  }
  next();
});

customerModel.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Customer', customerModel);
