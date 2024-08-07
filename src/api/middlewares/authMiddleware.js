const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const logger = require('../services/loggerService');

const authMiddleware = (requireAuth = true) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        if (requireAuth) {
          if (req.xhr || req.headers.accept.includes('json')) {
            return res.status(401).json({ message: 'Unauthorized' });
          } else {
            return res.redirect('/login');
          }
        } else {
          return next();
        }
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isAuthenticated) {
          if (requireAuth) {
            if (req.xhr || req.headers.accept.includes('json')) {
              return res.status(401).json({ message: 'Unauthorized' });
            } else {
              return res.redirect('/login');
            }
          } else {
            return next();
          }
        }

        res.locals.isAuthenticated = true;
        req.user = user;
        next();
      } catch (error) {
        console.error('Authentication error:', error);
        if (requireAuth) {
          if (req.xhr || req.headers.accept.includes('json')) {
            return res.status(401).json({ message: 'Unauthorized' });
          } else {
            return res.redirect('/login');
          }
        } else {
          return next();
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      if (requireAuth) {
        if (req.xhr || req.headers.accept.includes('json')) {
          return res.status(401).json({ message: 'Unauthorized' });
        } else {
          return res.redirect('/login');
        }
      } else {
        return next();
      }
    }
  };
};

module.exports = authMiddleware;
