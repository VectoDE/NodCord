const pm2 = require('@pm2/io');
const os = require('os');
const logger = require('../../api/services/loggerService');
const packageInfo = require('../../../package.json');

// Initialisiere Metriken außerhalb der monitorComponent-Funktion
const realtimeUsers = pm2.metric({
  name: 'Realtime Users',
  id: 'app/realtime/users',
  type: 'gauge',
  measurement: 'count',
});

const latency = pm2.metric({
  name: 'Latency',
  type: 'histogram',
  measurement: 'mean',
});

const requestCounter = pm2.counter({
  name: 'Request Count',
  id: 'app/requests/count',
});

const errorMeter = pm2.meter({
  name: 'Error Rate',
  id: 'app/errors/rate',
  samples: 1,
  timeframe: 60,
});

const totalMemory = pm2.metric({
  name: 'Total Memory',
  id: 'system/memory/total',
  type: 'gauge',
  measurement: 'bytes',
  value: () => os.totalmem(),
});

const freeMemory = pm2.metric({
  name: 'Free Memory',
  id: 'system/memory/free',
  type: 'gauge',
  measurement: 'bytes',
  value: () => os.freemem(),
});

const processMemory = pm2.metric({
  name: 'Process Memory Usage',
  id: 'process/memory/usage',
  type: 'gauge',
  measurement: 'bytes',
  value: () => process.memoryUsage().rss,
});

const nodeVersion = pm2.metric({
  name: 'Node.js Version',
  id: 'process/node/version',
  type: 'gauge',
  measurement: 'string',
  value: () => process.version,
});

const appVersion = pm2.metric({
  name: 'Application Version',
  id: 'app/version',
  type: 'gauge',
  measurement: 'string',
  value: () => packageInfo.version,
});

const nodeEnv = pm2.metric({
  name: 'Node Environment',
  id: 'process/node/env',
  type: 'gauge',
  measurement: 'string',
  value: () => process.env.NODE_ENV || 'development',
});

const monitorComponent = (component, componentName) => {
  logger.info(`[PM2] Monitoring initialized for: ${componentName}`);

  if (!realtimeUsers || !latency || !requestCounter || !errorMeter || !totalMemory || !freeMemory || !processMemory || !nodeVersion || !appVersion || !nodeEnv) {
    logger.error('[PM2] One or more metrics are not initialized correctly.');
    return;
  }

  realtimeUsers.set(23);

  setInterval(() => {
    try {
      const latencyValue = Math.round(Math.random() * 100);
      latency.set(latencyValue);
    } catch (error) {
      logger.error(`[PM2] Error setting latency metric: ${error.message}`);
    }
  }, 1000);

  component.use((req, res, next) => {
    try {
      requestCounter.inc();
    } catch (error) {
      logger.error(`[PM2] Error incrementing request counter: ${error.message}`);
    }
    next();
  });

  component.use((err, req, res, next) => {
    try {
      if (err) {
        errorMeter.mark();
      }
    } catch (error) {
      logger.error(`[PM2] Error recording error meter: ${error.message}`);
    }
    next(err);
  });

  setInterval(() => {
    try {
      totalMemory.set(os.totalmem());
      freeMemory.set(os.freemem());
      processMemory.set(process.memoryUsage().rss);
    } catch (error) {
      logger.error(`[PM2] Error updating memory metrics: ${error.message}`);
    }
  }, 1000);

  try {
    nodeVersion.set(process.version);
    appVersion.set(packageInfo.version);
    nodeEnv.set(process.env.NODE_ENV || 'development');
  } catch (error) {
    logger.error(`[PM2] Error setting static metrics: ${error.message}`);
  }

  pm2.action('log:system-info', (reply) => {
    const systemInfo = {
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      processMemory: process.memoryUsage().rss,
      nodeVersion: process.version,
      appVersion: packageInfo.version,
      nodeEnv: process.env.NODE_ENV || 'development',
    };
    logger.info('[PM2] System Info:', systemInfo);
    reply({ systemInfo });
  });

  logger.info(`[PM2] Metrics set for: ${componentName}`);
};

module.exports = {
  monitorComponent,
};
