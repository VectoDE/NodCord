const http = require('http');
const mongoose = require('mongoose');
const { app, startApp } = require('./api/app');
const bot = require('./bot/index');
const { initSocketIO } = require('./api/services/socketioService');

// Verbinde mit der Datenbank
const connectDB = require('./database/connectDB');
connectDB();

// Erstelle einen HTTP-Server
const server = http.createServer(app);

// Initialisiere Socket.IO
initSocketIO(server);

// Starte die API und den Server
startApp();

// Starte den Bot
bot.start(); // Sicherstellen, dass der Bot korrekt gestartet wird
