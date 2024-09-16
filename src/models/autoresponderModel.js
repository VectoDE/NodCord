const mongoose = require('mongoose');

const autoresponderModel = new mongoose.Schema({
  guildId: {
    type: String,
  },
  autoresponses: [
    {
      trigger: String,
      response: String
    }
  ]
});

module.exports = mongoose.model('AutoResponder', autoresponderModel);
