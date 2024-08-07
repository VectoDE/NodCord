const mongoose = require('mongoose');

const taskModel = new mongoose.Schema({
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
    ref: 'User', // Assuming there's a User model
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team', // Assuming there's a Team model
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

module.exports = mongoose.model('Task', taskModel);
