const mongoose = require('mongoose');

// Definiere das Schema für Story
const storySchema = new mongoose.Schema({
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

// Aktualisiere `updatedAt` bei Änderungen
storySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Erstelle das Modell aus dem Schema
module.exports = mongoose.model('Story', storySchema);
