const DeveloperProgram = require('../../models/developerProgramModel');
const logger = require('../services/loggerService');

const developerProgramMiddleware = async (req, res, next) => {
  try {
    const developerProgram = await DeveloperProgram.findOne({ userId: req.user._id });

    if (developerProgram && developerProgram.isActive) {
      return next();
    }

    return res.status(403).json({ message: 'User not enrolled in developer program' });
  } catch (error) {
    logger.error('Developer program access error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = developerProgramMiddleware;
