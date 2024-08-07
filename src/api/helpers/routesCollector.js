const fs = require('fs');
const path = require('path');
const express = require('express');

const getRoutes = (router, basePath = '') => {
  const stack = router.stack || [];
  const routes = [];

  stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: basePath + middleware.route.path,
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

  routesFiles.forEach((file) => {
    const routePath = path.join(routesPath, file);
    const route = require(routePath);
    router.use(route);
  });

  return getRoutes(router);
};

module.exports = collectRoutes;
