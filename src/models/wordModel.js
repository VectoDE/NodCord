const mongoose = require('mongoose');


const wordSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
  },
  word: {
    type: String,
    required: true,
    unique: true,
  }
});

module.exports = mongoose.model('Word', wordSchema);
