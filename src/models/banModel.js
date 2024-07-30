const mongoose = require('mongoose');

const banSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    bannedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ban', banSchema);