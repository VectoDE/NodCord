const compression = require('compression');
const logger = require('../services/loggerService');

const compressionMiddleware = (req, res, next) => {
  const compressionOptions = {
    level: 6, // 0 (keine Komprimierung) bis 9 (maximale Komprimierung)
    threshold: 10000, // > 1000 Bytes
  };

  logger.info(
    `Compression Middleware: Processing request ${req.method} ${req.url} with compression level ${compressionOptions.level} and threshold ${compressionOptions.threshold} bytes`
  );

  compression(compressionOptions)(req, res, (err) => {
    if (err) {
      logger.error('Compression Middleware error:', err);
      return res.status(500).json({ message: 'Compression error' });
    }
    next();
  });
};

module.exports = compressionMiddleware;
