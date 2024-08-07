const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');
const Role = require('../../models/roleModel');
const logger = require('../services/loggerService');

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      const userRole = await Role.findOne({ roleName: user.role });
      if (!userRole) {
        return res.status(403).json({ success: false, message: 'Role not found' });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
      }

      req.user = user;
      req.userRole = userRole;
      next();
    } catch (err) {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };
};

module.exports = checkRole;
