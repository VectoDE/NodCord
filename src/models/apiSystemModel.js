const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const apiSystemModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

apiSystemModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `ApiSystem-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('ApiSystem', apiSystemModel);
