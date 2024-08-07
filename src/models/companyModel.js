const mongoose = require('mongoose');

const companyModel = new mongoose.Schema({
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

module.exports = mongoose.model('Company', companyModel);
