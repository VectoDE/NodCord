const cors = require('cors');
const logger = require('../services/loggerService');

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const corsMiddleware = (req, res, next) => {
  logger.info(
    `[MIDDLEWARE] CORS Middleware: Incoming request from ${req.headers.origin} for ${req.method} ${req.url}`
  );
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      logger.error('[MIDDLEWARE] CORS Middleware error:', err);
      return res.status(500).json({ message: 'CORS error' });
    }
    next();
  });
};

module.exports = corsMiddleware;
