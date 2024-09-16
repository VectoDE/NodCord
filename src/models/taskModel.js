const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const taskModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['development', 'marketing', 'design', 'management', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'on-hold'],
    default: 'pending',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  dueDate: {
    type: Date,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

taskModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Task-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Task', taskModel);
