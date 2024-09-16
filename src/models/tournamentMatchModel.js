const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tournamentMatchModel = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    result: {
      type: String,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

tournamentMatchModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `TournamentMatches-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('TournamentMatches', tournamentMatchModel);
