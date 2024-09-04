const mongoose = require('mongoose');

const apiSystemSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model('ApiSystem', apiSystemSchema);
