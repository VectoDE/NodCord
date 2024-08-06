const express = require('express');
const path = require('path');
const fs = require('fs');
const appConfig = require('../config/apiConfig');

const corsMiddleware = require('./middlewares/corsMiddleware');
const compressionMiddleware = require('./middlewares/compressionMiddleware');
const rateLimiter = require('./middlewares/rateLimiterMiddleware');

const indexRoutes = require('./routes/indexRoutes');

const authRoutes = require('./routes/authRoutes');

const infoRoutes = require('./routes/infoRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const tagRoutes = require('./routes/tagRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const blogRoutes = require('./routes/blogRoutes');
const gameRoutes = require('./routes/gameRoutes');

const favoriteRoutes = require('./routes/favoriteRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const dislikeRoutes = require('./routes/dislikeRoutes');
const shareRoutes = require('./routes/shareRoutes');

const newsletterRoutes = require('./routes/newsletterRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');

const companyRoutes = require('./routes/companyRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const groupRoutes = require('./routes/groupRoutes');
const teamRoutes = require('./routes/teamRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const issueRoutes = require('./routes/issueRoutes');
const bugRoutes = require('./routes/bugRoutes');
const featureRoutes = require('./routes/featureRoutes');
const storyRoutes = require('./routes/storyRoutes');

const customerRoutes = require('./routes/customerRoutes');
const customerOrderRoutes = require('./routes/customerOrderRoutes');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const returnRoutes = require('./routes/returnRoutes');

const ticketRoutes = require('./routes/ticketRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const controlRoutes = require('./routes/controlRoutes');
const securityRoutes = require('./routes/securityRoutes');
const fileRoutes = require('./routes/fileRoutes');

const logRoutes = require('./routes/logRoutes');

const app = express();
const baseURL = appConfig.baseURL;
const port = appConfig.port;

app.use(corsMiddleware);
app.use(compressionMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '../public')));

app.use(rateLimiter);

app.use('/', indexRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/infos', infoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/games', gameRoutes);

app.use('/api/favorites', favoriteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/dislikes', dislikeRoutes);
app.use('/api/shares', shareRoutes);

app.use('/api/newsletters', newsletterRoutes);
app.use('/api/subscribers', subscriberRoutes);

app.use('/api/companies', companyRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/stories', storyRoutes);

app.use('/api/customers', customerRoutes);
app.use('/api/customers/orders', customerOrderRoutes);

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/returns', returnRoutes);

app.use('/api/tickets', ticketRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use('/api/controls', controlRoutes);
app.use('/api/securities', securityRoutes);
app.use('/api/logs', logRoutes);

app.use('/api/files', fileRoutes);

const getRoutes = (router, basePath = '') => {
  const stack = router.stack || [];
  const routes = [];

  stack.forEach(middleware => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).map(method => method.toUpperCase());
      routes.push({
        methods,
        path: basePath + middleware.route.path
      });
    } else if (middleware.name === 'router' && middleware.handle.stack) {
      middleware.handle.stack.forEach(subMiddleware => {
        if (subMiddleware.route) {
          const methods = Object.keys(subMiddleware.route.methods).map(method => method.toUpperCase());
          routes.push({
            methods,
            path: basePath + subMiddleware.route.path
          });
        }
      });
    }
  });

  return routes;
};

const getAllRoutes = () => {
  const routes = [];

  const routeDefinitions = [
    { path: '', router: indexRoutes },
    { path: '/api/auth', router: authRoutes },
    { path: '/api/infos', router: infoRoutes },
    { path: '/api/users', router: userRoutes },
    { path: '/api/roles', router: roleRoutes },
    { path: '/api/tags', router: tagRoutes },
    { path: '/api/categories', router: categoryRoutes },
    { path: '/api/blogs', router: blogRoutes },
    { path: '/api/games', router: gameRoutes },
    { path: '/api/favorites', router: favoriteRoutes },
    { path: '/api/comments', router: commentRoutes },
    { path: '/api/likes', router: likeRoutes },
    { path: '/api/dislikes', router: dislikeRoutes },
    { path: '/api/shares', router: shareRoutes },
    { path: '/api/newsletters', router: newsletterRoutes },
    { path: '/api/subscribers', router: subscriberRoutes },
    { path: '/api/companies', router: companyRoutes },
    { path: '/api/organizations', router: organizationRoutes },
    { path: '/api/groups', router: groupRoutes },
    { path: '/api/teams', router: teamRoutes },
    { path: '/api/projects', router: projectRoutes },
    { path: '/api/tasks', router: taskRoutes },
    { path: '/api/issues', router: issueRoutes },
    { path: '/api/bugs', router: bugRoutes },
    { path: '/api/features', router: featureRoutes },
    { path: '/api/stories', router: storyRoutes },
    { path: '/api/customers', router: customerRoutes },
    { path: '/api/customers/orders', router: customerOrderRoutes },
    { path: '/api/products', router: productRoutes },
    { path: '/api/orders', router: orderRoutes },
    { path: '/api/returns', router: returnRoutes },
    { path: '/api/tickets', router: ticketRoutes },
    { path: '/api/feedback', router: feedbackRoutes },
    { path: '/api/controls', router: controlRoutes },
    { path: '/api/securities', router: securityRoutes },
    { path: '/api/logs', router: logRoutes },
    { path: '/api/files', router: fileRoutes }
  ];

  routeDefinitions.forEach(({ path, router }) => {
    const routesFound = getRoutes(router, path);
    routes.push(...routesFound);
  });

  return routes;
};

app.get('/routes', (req, res) => {
  const routes = getAllRoutes();
  res.render('routes', { routes });
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: app.get('env') === 'development' ? err : {},
  });
});

const startApp = () => {
  app.listen(port, () => {
    console.log(`API is running on http://${baseURL}:${port}`);
  });
};

module.exports = { app, startApp, getAllRoutes, getRoutes };
