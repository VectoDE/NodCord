const mongoose = require('mongoose');

let antilinkModel = new mongoose.Schema({
  Guild: {
    type: String,
  },
  Perms: {
    type: String,
  }
});

module.exports = mongoose.model('Antilink', antilinkModel);
