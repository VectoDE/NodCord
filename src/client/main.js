require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const logger = require('../api/services/loggerService');
const corsMiddleware = require('../api/middlewares/corsMiddleware');

const client = express();

client.set('trust proxy', 1);

client.use(express.urlencoded({ extended: true }));
client.use(express.json());
client.use(cookieParser());
client.use(flash());

client.use(corsMiddleware);

morgan.token('remote-addr', (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress);
morgan.token('url', (req) => req.originalUrl);

const logFormat = '[CLIENT] :remote-addr - :method :url :status :response-time ms - :res[content-length]';
client.use(morgan(logFormat, { stream: { write: (message) => logger.info(message.trim()) } }));

client.set('view engine', 'ejs');
client.set('views', path.join(__dirname, '../views'));
client.use(express.static(path.join(__dirname, '../public')));

const indexRoutes = require('./routes/indexRoutes');
const legalRoutes = require('./routes/legalRoutes');
const userProfileRoutes = require('./routes/userprofileRoutes');
const dashRoutes = require('./routes/dashboardRoutes');

const maintenanceRoutes = require('./routes/maintenanceRoutes');

client.use('/', indexRoutes);
client.use('/legal', legalRoutes);
client.use('/user', userProfileRoutes);
client.use('/dashboard', dashRoutes);

client.use('/', maintenanceRoutes);

client.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

client.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode);
  logger.error(`Error ${statusCode}: ${err.message}`, { stack: err.stack });

  if (req.xhr || req.headers.accept.includes('application/json')) {
    res.status(statusCode).json({
      error: {
        title: statusCode === 401 ? 'Unauthorized' : statusCode === 404 ? 'Not Found' : 'Error',
        message: err.message,
        status: statusCode,
        stack: client.get('env') === 'development' ? err.stack : null,
      },
    });
  } else {
    res.status(statusCode).render('error', {
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      logo404: '/assets/img/404.png',
      errortitle: statusCode === 401 ? 'Unauthorized' : statusCode === 404 ? 'Not Found' : 'Error',
      errormessage: err.message,
      errorstatus: statusCode,
      errorstack: client.get('env') === 'development' ? err.stack : null,
    });
  }
});

const startClient = () => {
  const port = process.env.CLIENT_PORT || '3001';
  const baseURL = process.env.CLIENT_BASE_URL || 'localhost';

  if (process.env.NODE_ENV === 'production') {
    client.listen( () => {
      logger.info(`[CLIENT] Frontend is running on https://${baseURL}`);
    });
  } else if (process.env.NODE_ENV === 'development') {
    client.listen(port, () => {
      logger.info(`[CLIENT] Frontend is running on https://${baseURL}:${port}`);
    });
  }
};

module.exports = { client, startClient };
