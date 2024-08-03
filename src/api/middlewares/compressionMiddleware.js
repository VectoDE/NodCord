const compression = require('compression');

const compressionMiddleware = compression({
  level: 6, // 0 (keine Komprimierung) bis 9 (maximale Komprimierung)
  threshold: 1000 // > 1000 Bytes
});

module.exports = compressionMiddleware;
