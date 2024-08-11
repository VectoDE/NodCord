const DeveloperProgram = require('../../models/developerProgramModel');
const logger = require('../services/loggerService');

const developerProgramMiddleware = async (req, res, next) => {
  try {
    logger.info(
      `Checking developer program status for user ID: ${req.user._id}`
    );

    const developerProgram = await DeveloperProgram.findOne({
      userId: req.user._id,
    });

    if (developerProgram && developerProgram.isActive) {
      logger.info(
        `User ID: ${req.user._id} is enrolled in the developer program.`
      );
      return next();
    }

    logger.warn(
      `User ID: ${req.user._id} is not enrolled in the developer program.`
    );
    return res
      .status(403)
      .json({ message: 'User not enrolled in developer program' });
  } catch (error) {
    logger.error('Developer program access error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = developerProgramMiddleware;