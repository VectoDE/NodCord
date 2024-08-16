require('dotenv').config();

module.exports = {
  baseURL: process.env.BASE_URL || 'localhost',
  port: process.env.PORT || 3000,
  prefix: '/api',
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 Minuten
    max: 450, // Limit each IP to 450 requests per windowMs
  },
  corsOptions: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
  teamspeak: {
    Host: process.env.TS_HOST || '127.0.0.1',
    QueryPort: process.env.TS_QUERY_PORT || 10011,
    ServerPort: process.env.TS_SERVER_PORT || 9987,
    Username: process.env.TS_USERNAME || 'serveradmin',
    Password: process.env.TS_PASSWORD,
    Nickname: process.env.TS_NICKNAME || 'serveradmin',
  }
};
