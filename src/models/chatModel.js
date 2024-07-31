const mongoose = require('mongoose');

// Schema für eine Nachricht
const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Schema für einen Chat
const chatSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }], // Array von Teilnehmer-IDs
  messages: [messageSchema], // Array von Nachrichten
  type: { type: String, enum: ['member_to_member', 'member_to_organization', 'member_to_group'], required: true } // Chat-Typ
});

module.exports = mongoose.model('Chat', chatSchema);