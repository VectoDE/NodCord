const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const organizationModel = new mongoose.Schema({
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
    trim: true,
  },
  foundedDate: {
    type: Date,
    default: Date.now,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

organizationModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Organization-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Organization', organizationModel);
