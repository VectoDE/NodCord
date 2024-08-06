require('dotenv').config();

module.exports = {
  version: process.env.VERSION,
  environment: process.env.NODE_ENV,
  mongoURI: process.env.MONGO_URI || 'mongodb+srv://timhauke99:zAX0dYvqKsBEnhwS@vs-code.8eik4zl.mongodb.net/?retryWrites=true&w=majority',
  sessionSecret: process.env.SESSION_SECRET || 'your_session_secret',
  logLevel: process.env.LOG_LEVEL || 'info',
  publicPath: 'src/public',
  viewsPath: 'src/api/views',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  serverName: process.env.SERVER_NAME || 'NodCord'
};
