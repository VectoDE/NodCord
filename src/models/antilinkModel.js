const mongoose = require('mongoose');

let antilinkSchema = new mongoose.Schema({
  Guild: {
    type: String,
  },
  Perms: {
    type: String,
  }
});

module.exports = mongoose.model('Antilink', antilinkSchema);
