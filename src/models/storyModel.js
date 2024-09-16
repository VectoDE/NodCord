const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const storyModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Backlog', 'In Progress', 'Completed'],
    default: 'Backlog',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
});

storyModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Story-${uuidv4()}`;
  }
  next();
});


storyModel.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Story', storyModel);
