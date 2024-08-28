const mongoose = require('mongoose');

const teamsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    players: [
      {
        name: String,
        email: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teams', teamsSchema);
