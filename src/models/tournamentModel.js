const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tournamentModel = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    picture: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    detailDescription: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TournamentTeams',
      },
    ],
    matches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TournamentMatches',
      },
    ],
  },
  { timestamps: true }
);

tournamentModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Tournament-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Tournament', tournamentModel);
