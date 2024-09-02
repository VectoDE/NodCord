const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const logger = require('../services/loggerService');

const authMiddleware = (requireAuth = true) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        if (requireAuth) {
          logger.warn('[MIDDLEWARE] Unauthorized access attempt: No token provided');
          const err = new Error('Unauthorized');
          err.status = 401;
          return next(err);
        } else {
          logger.info('[MIDDLEWARE] No token provided, but authentication not required');
          return next();
        }
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isAuthenticated) {
        if (requireAuth) {
          logger.warn(
            '[MIDDLEWARE] Unauthorized access attempt: User not authenticated or not found'
          );
          const err = new Error('Unauthorized');
          err.status = 401;
          return next(err);
        } else {
          logger.info(
            '[MIDDLEWARE] User not authenticated, but authentication not required'
          );
          return next();
        }
      }

      res.locals.isAuthenticated = true;
      req.user = user;
      logger.info(`[MIDDLEWARE] User '${user._id}' authenticated successfully`);
      next();
    } catch (error) {
      logger.error('[MIDDLEWARE] Authentication error:', error);
      if (requireAuth) {
        const err = new Error('Unauthorized');
        err.status = 401;
        next(err);
      } else {
        next();
      }
    }
  };
};

module.exports = authMiddleware;
