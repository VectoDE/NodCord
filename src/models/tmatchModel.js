const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  result: {
    type: String
  },
  scheduledDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
