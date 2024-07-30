const mongoose = require('mongoose');
const { mongoURI } = require('../config/serverConfig');

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, { });
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
