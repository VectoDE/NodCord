const mongoose = require('mongoose');
const serverConfig = require('../config/serverConfig');

const connectDB = async () => {
  try {
    await mongoose.connect(serverConfig.mongoURI, {});
    console.log(`Database connected successfully to ${serverConfig.mongoURI}`);
  } catch (err) {
    console.error('Fehler bei der Datenbankverbindung:', err.message);
    throw err; // Fehler weitergeben, um den Prozess im Primärprozess zu beenden
  }
};

module.exports = connectDB;
