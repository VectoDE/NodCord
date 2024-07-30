const compression = require('compression');

// Erstelle die Compression-Middleware
const compressionMiddleware = compression({
    level: 6, // Komprimierungsstufe von 0 (keine Komprimierung) bis 9 (maximale Komprimierung)
    threshold: 1000 // Komprimiert nur Antworten größer als 1000 Bytes
});

module.exports = compressionMiddleware;
