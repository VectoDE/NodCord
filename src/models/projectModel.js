const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const projectModel = new mongoose.Schema({
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
    trim: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  detailDescription: {
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
      ref: 'Member',
    },
  ],
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
    },
  ],
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

projectModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Project-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Project', projectModel);
