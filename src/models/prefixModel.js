const mongoose = require('mongoose');

const prefixModel = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  prefix: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Prefix', prefixModel);
