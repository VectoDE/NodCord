const fs = require('fs');
const path = require('path');
const express = require('express');
const logger = require('../services/loggerService');

const getRoutes = (router, basePath = '') => {
  const stack = router.stack || [];
  const routes = [];

  stack.forEach((middleware) => {
    if (middleware.route) {
      const method = Object.keys(middleware.route.methods)[0].toUpperCase();
      const routePath = basePath + middleware.route.path;
      logger.info(`Route found: ${method} ${routePath}`);
      routes.push({
        method: method,
        path: routePath,
      });
    } else if (middleware.name === 'router' && middleware.handle.stack) {
      routes.push(
        ...getRoutes(
          middleware.handle,
          basePath +
            middleware.regexp.source
              .replace(/\\\//g, '/')
              .replace(/\/\^/, '')
              .replace(/\?\(\=\(.+\)\)\?\(\:\.\+\)\?$/, '')
        )
      );
    }
  });

  return routes;
};

const collectRoutes = (routesPath) => {
  const router = express.Router();
  const routesFiles = fs
    .readdirSync(routesPath)
    .filter((file) => file.endsWith('.js'));

  logger.info(`Loading routes from: ${routesPath}`);

  routesFiles.forEach((file) => {
    const routePath = path.join(routesPath, file);
    try {
      const route = require(routePath);
      router.use(route);
      logger.info(`Route file loaded: ${file}`);
    } catch (error) {
      logger.error(`Failed to load route file ${file}:`, error);
    }
  });

  return getRoutes(router);
};

module.exports = collectRoutes;
