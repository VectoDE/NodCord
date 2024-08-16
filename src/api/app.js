require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const logger = require('./services/loggerService');

const corsMiddleware = require('./middlewares/corsMiddleware');
const compressionMiddleware = require('./middlewares/compressionMiddleware');
const rateLimiter = require('./middlewares/rateLimiterMiddleware');

const api = express();

api.use(express.urlencoded({ extended: true }));
api.use(express.json());
api.use(cookieParser());
api.use(flash());

api.use(corsMiddleware);
api.use(compressionMiddleware);
api.use(rateLimiter);

morgan.token('remote-addr', (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress);
morgan.token('url', (req) => req.originalUrl);

const logFormat = ':remote-addr - :method :url :status :response-time ms - :res[content-length]';
api.use(morgan(logFormat, { stream: { write: (message) => logger.info(message.trim()) } }));

api.set('view engine', 'ejs');
api.set('views', path.join(__dirname, '../views'));
api.use(express.static(path.join(__dirname, '../public')));

const authRoutes = require('./routes/authRoutes');
const betaRoutes = require('./routes/betaRoutes');
const developerProgramRoutes = require('./routes/developerProgramRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
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
const proxmoxRoutes = require('./routes/proxmoxRoutes');
const plexRoutes = require('./routes/plexRoutes');
const faceitRoutes = require('./routes/faceitRoutes');
const steamRoutes = require('./routes/steamRoutes');
const cloudNetRoutes = require('./routes/cloudnetRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const teamspeakRoutes = require('./routes/teamspeakRoutes');
const logRoutes = require('./routes/logRoutes');

api.use('/api/auth', authRoutes);
api.use('/api/beta', betaRoutes);
api.use('/api/developerprogram', developerProgramRoutes);
api.use('/api/apikeys', apiKeyRoutes);
api.use('/api/infos', infoRoutes);
api.use('/api/users', userRoutes);
api.use('/api/roles', roleRoutes);
api.use('/api/tags', tagRoutes);
api.use('/api/categories', categoryRoutes);
api.use('/api/blogs', blogRoutes);
api.use('/api/games', gameRoutes);
api.use('/api/favorites', favoriteRoutes);
api.use('/api/comments', commentRoutes);
api.use('/api/likes', likeRoutes);
api.use('/api/dislikes', dislikeRoutes);
api.use('/api/shares', shareRoutes);
api.use('/api/newsletters', newsletterRoutes);
api.use('/api/subscribers', subscriberRoutes);
api.use('/api/companies', companyRoutes);
api.use('/api/organizations', organizationRoutes);
api.use('/api/groups', groupRoutes);
api.use('/api/teams', teamRoutes);
api.use('/api/projects', projectRoutes);
api.use('/api/tasks', taskRoutes);
api.use('/api/issues', issueRoutes);
api.use('/api/bugs', bugRoutes);
api.use('/api/features', featureRoutes);
api.use('/api/stories', storyRoutes);
api.use('/api/customers', customerRoutes);
api.use('/api/customers/orders', customerOrderRoutes);
api.use('/api/products', productRoutes);
api.use('/api/orders', orderRoutes);
api.use('/api/returns', returnRoutes);
api.use('/api/tickets', ticketRoutes);
api.use('/api/feedbacks', feedbackRoutes);
api.use('/api/controls', controlRoutes);
api.use('/api/securities', securityRoutes);
api.use('/api/logs', logRoutes);
api.use('/api/proxmox', proxmoxRoutes);
api.use('/api/plex', plexRoutes);
api.use('/api/faceit', faceitRoutes);
api.use('/api/steam', steamRoutes);
api.use('/api/cloudnet', cloudNetRoutes);
api.use('/api/tournaments', tournamentRoutes);
api.use('/api/teamspeak', teamspeakRoutes);
api.use('/api/files', fileRoutes);

const indexRoutes = require('./routes/indexRoutes');
const dashRoutes = require('./routes/dashboardRoutes');

api.use('/', indexRoutes);
api.use('/dashboard', dashRoutes);

api.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

api.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode);
  res.render('error', {
    errortitle: statusCode === 401 ? 'Unauthorized' : statusCode === 404 ? 'Not Found' : 'Error',
    errormessage: err.message,
    errorstatus: statusCode,
    errorstack: api.get('env') === 'development' ? err.stack : null,
  });
});

const startApp = () => {
  api.listen(port, () => {
    logger.info(`API is running on https://${baseURL}:${port}`);
  });
};

module.exports = { api, startApp };
