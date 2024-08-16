const rateLimit = require('express-rate-limit');
const logger = require('../services/loggerService');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 450,
  message: 'Zu viele Anfragen von dieser IP, bitte versuche es später erneut.',
  headers: true,
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}. ${options.message}`);
    res.status(options.statusCode || 429).send(options.message);
  },
});

module.exports = rateLimiter;
