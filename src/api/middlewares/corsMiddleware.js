const cors = require('cors');

const corsOptions = {
  origin: '*', // Erlaubt alle Ursprünge, du kannst dies anpassen, z.B. ['http://example.com']
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Erstelle die CORS-Middleware mit den Optionen
const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
