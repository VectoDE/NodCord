const mongoose = require('mongoose');

let afkSchema = new mongoose.Schema({
  User: {
    type: String,
  },
  Guild: {
    type: String,
  },
  Message: {
    type: String,
  }
});

module.exports = mongoose.model('AFK', afkSchema);
