const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const Role = require('../../models/roleModel');
const logger = require('../../services/logger.service');

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        logger.warn('[MIDDLEWARE] Kein Token bereitgestellt.');
        if (req.headers.accept.includes('application/json')) {
          return res.status(401).json({ success: false, message: 'No token provided' });
        } else {
          return res.redirect('/error?message=No token provided');
        }
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        logger.warn(`[MIDDLEWARE] Benutzer mit ID ${decoded.id} nicht gefunden.`);
        if (req.headers.accept.includes('application/json')) {
          return res.status(401).json({ success: false, message: 'User not found' });
        } else {
          return res.redirect('/error?message=User not found');
        }
      }

      const userRole = await Role.findOne({ roleName: user.role });
      if (!userRole) {
        logger.warn(`[MIDDLEWARE] Rolle ${user.role} für Benutzer mit ID ${user._id} nicht gefunden.`);
        if (req.headers.accept.includes('application/json')) {
          return res.status(403).json({ success: false, message: 'Role not found' });
        } else {
          return res.redirect('/error?message=Role not found');
        }
      }

      if (!roles.includes(user.role)) {
        logger.warn(`[MIDDLEWARE] Benutzer mit ID ${user._id} hat nicht die erforderliche Rolle. Erforderliche Rollen: ${roles.join(', ')}, Benutzerrolle: ${user.role}`);
        if (req.headers.accept.includes('application/json')) {
          return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
        } else {
          return res.redirect(`/error?message=Forbidden: insufficient role`);
        }
      }

      req.user = user;
      req.userRole = userRole;
      logger.info(`[MIDDLEWARE] Benutzer mit ID ${user._id}, Namen ${user.username} und Rolle ${user.role} autorisiert. Weiterleitung zur nächsten Middleware.`);
      next();
    } catch (err) {
      logger.error('[MIDDLEWARE] Fehler beim Überprüfen der Rolle:', err);
      if (req.headers.accept.includes('application/json')) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      } else {
        return res.redirect('/error?message=Invalid token');
      }
    }
  };
};

module.exports = checkRole;
