const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  picture: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  detailDescription: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    default: '',
  },
  stock: {
    type: Number,
    default: 0,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  updatedDate: {
    type: Date,
    default: Date.now,
  },
});

productModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Product-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Product', productModel);
