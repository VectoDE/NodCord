const mongoose = require('mongoose');

const projectModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
    default: 'Not Started',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member', // Referenz auf ein Member-Modell
    },
  ],
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag', // Referenz auf ein Tag-Modell
    },
  ],
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', projectModel);
