const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ticketResponseModel = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ticketResponseModel.pre('save', function (next) {
  if (!this.id) {
    this.id = `TicketResponse-${uuidv4()}`;
  }
  next();
});

module.exports = mongoose.model('TicketResponse', ticketResponseModel);
