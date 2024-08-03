const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Zu viele Anfragen von dieser IP, bitte versuche es später erneut.',
  headers: true
});

module.exports = rateLimiter;
