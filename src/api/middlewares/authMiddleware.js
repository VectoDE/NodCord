const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper'); // Assuming you have a helper to get base URL

const authMiddleware = (requireAuth = true) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        if (requireAuth) {
          logger.warn('[MIDDLEWARE] Unauthorized access attempt: No token provided');
          return res.redirect(`${getBaseUrl()}/login`);
        } else {
          logger.info('[MIDDLEWARE] No token provided, but authentication not required');
          res.locals.token = null;
          return next();
        }
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isAuthenticated) {
        if (requireAuth) {
          logger.warn('[MIDDLEWARE] Unauthorized access attempt: User not authenticated or not found');
          return res.redirect(`${getBaseUrl()}/login`);
        } else {
          logger.info('[MIDDLEWARE] User not authenticated, but authentication not required');
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
        return res.redirect(`${getBaseUrl()}/login`);
      } else {
        next();
      }
    }
  };
};

module.exports = authMiddleware;
