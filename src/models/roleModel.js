const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const roleModel = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: '#000000',
      match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

roleModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `Role-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('Role', roleModel);
