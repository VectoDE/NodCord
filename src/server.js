const http = require('http');
const mongoose = require('mongoose');
const { app, startApp } = require('./api/app');
const bot = require('./bot/index');

// Verbinde mit der Datenbank
const connectDB = require('./database/connectDB');
connectDB();

// Starte die API und den Server
startApp();

// Starte den Bot
bot.start(); // Sicherstellen, dass der Bot korrekt gestartet wird
