const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const companyModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  industry: {
    type: String,
    default: '',
  },
  headquarters: {
    type: String,
    default: '',
  },
  foundedDate: {
    type: Date,
    default: Date.now,
  },
  employees: {
    type: Number,
    default: 0,
  },
  website: {
    type: String,
    default: '',
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

companyModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Company-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Company', companyModel);
