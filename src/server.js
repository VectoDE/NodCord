const http = require('http');
const pm2 = require('@pm2/io');
const packageInfo = require('../package.json');
const { api } = require('./api/app');
const bot = require('./bot/index');
const connectDB = require('./database/connectDB');
const { seedRolesIfNotExist } = require('./seeds/rolesSeed');
const logger = require('./api/services/loggerService');

const realtimeUsers = pm2.metric({
  name: 'Realtime Users',
  id: 'app/realtime/users',
});

const latency = pm2.metric({
  name: 'Latency',
  type: 'histogram',
  measurement: 'mean',
});

const requestCounter = pm2.metric({
  name: 'Request Count',
  type: 'counter',
  measurement: 'count',
});

const errorMeter = pm2.metric({
  name: 'Error Rate',
  type: 'meter',
  measurement: 'count',
});

let latencyValue = 0;

const startServer = async () => {
  try {
    realtimeUsers.set(23);

    setInterval(() => {
      latencyValue = Math.round(Math.random() * 100);
      latency.set(latencyValue);
    }, 100);

    api.use((req, res, next) => {
      requestCounter.inc();
      next();
    });

    //api.use((err, req, res, next) => {
    //  if (err) {
    //    errorMeter.inc();
    //  }
    //  next(err);
    //});

    await connectDB();

    await seedRolesIfNotExist();

    const port = process.env.PORT || 3000;
    const baseURL = process.env.BASE_URL || 'localhost';

    http.createServer(api).listen(port, () => {
      logger.info(`Server is running on https://${baseURL}`);
    });

    bot.start();

  } catch (err) {
    logger.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
logger.info(`Starting server: ${packageInfo.name}`);
