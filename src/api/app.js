const express = require('express');
const path = require('path');
const appConfig = require('../config/apiConfig');

const corsMiddleware = require('./middlewares/corsMiddleware');
const compressionMiddleware = require('./middlewares/compressionMiddleware');
const rateLimiter = require('./middlewares/rateLimiterMiddleware');

const indexRoutes = require('./routes/indexRoutes');
const infoRoutes = require('./routes/infoRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const blogRoutes = require('./routes/blogRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const serverRoutes = require('./routes/serverRoutes');
const controlRoutes = require('./routes/controlRoutes');
const securityRoutes = require('./routes/securityRoutes');
const fileRoutes = require('./routes/fileRoutes');
const discordbotRoutes = require('./routes/discordbotRoutes');
const banRoutes = require('./routes/banRoutes');
const kickRoutes = require('./routes/kickRoutes');
const timeoutRoutes = require('./routes/timeoutRoutes');

const app = express();
const baseURL = appConfig.baseURL;
const port = appConfig.port;

// Middleware and routes setup
app.use(corsMiddleware); // Verwende die CORS-Middleware
app.use(compressionMiddleware); // Verwende die Compression-Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Apply rate limiter middleware to all routes
app.use(rateLimiter);

app.use('/', indexRoutes);
app.use('/infos', infoRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/categories', categoryRoutes);
app.use('/blogs', blogRoutes);

app.use('/tickets', ticketRoutes);

app.use('/servers', serverRoutes);
app.use('/controls', controlRoutes);
app.use('/securities', securityRoutes);
app.use('/files', fileRoutes);

app.use('/discord', discordbotRoutes);
app.use('/bans', banRoutes);
app.use('/kicks', kickRoutes);
app.use('/timeouts', timeoutRoutes);

// 404 Handler - for undefined routes
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error Handler - for all errors
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: app.get('env') === 'development' ? err : {}, // Show stack trace only in development
  });
});

const startApp = () => {
  app.listen(port, () => {
    console.log(`API is running on http://${baseURL}:${port}`);
  });
};

module.exports = { app, startApp };
