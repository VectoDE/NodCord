const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const developerProgramModel = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

developerProgramModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `DeveloperProgram-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('DeveloperProgram', developerProgramModel);
