const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ success: false, message: 'User not found' });

      if (!roles.includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
      }

      req.user = user;
      next();
    } catch (err) {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };
};

module.exports = checkRole;
