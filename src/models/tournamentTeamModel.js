const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tournamentTeamModel = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
    },
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

tournamentTeamModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `TournamentTeams-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('TournamentTeams', tournamentTeamModel);
