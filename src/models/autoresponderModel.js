const mongoose = require('mongoose');

const autoresponderSchema = new mongoose.Schema({
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

module.exports = mongoose.model('AutoResponder', autoresponderSchema);
