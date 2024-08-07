const mongoose = require('mongoose');

// Definiere das Schema für Issue
const issueSchema = new mongoose.Schema({
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
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
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
issueSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Erstelle das Modell aus dem Schema
module.exports = mongoose.model('Issue', issueSchema);
