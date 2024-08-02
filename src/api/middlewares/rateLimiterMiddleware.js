const rateLimit = require('express-rate-limit');

// Definiere das Rate-Limiting
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Limit auf 100 Anfragen pro IP innerhalb von 15 Minuten
  message: 'Zu viele Anfragen von dieser IP, bitte versuche es später erneut.',
  headers: true
});

module.exports = rateLimiter;
