const mongoose = require('mongoose');

const teamModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    joinDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    contact: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: 'default-profile.png', // A fallback profile image
    }
});

module.exports = mongoose.model('Team', teamModel);