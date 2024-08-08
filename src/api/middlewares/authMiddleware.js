const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');

const authMiddleware = (requireAuth = true) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        if (requireAuth) {
          const err = new Error('Unauthorized');
          err.status = 401;
          return next(err);
        } else {
          return next();
        }
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isAuthenticated) {
        if (requireAuth) {
          const err = new Error('Unauthorized');
          err.status = 401;
          return next(err);
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
