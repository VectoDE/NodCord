const DeveloperProgram = require('../../models/developerProgramModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

exports.joinDeveloperProgram = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userEmail = req.user?.email;
    const username = req.user?.username;

    if (!userId || !userEmail || !username) {
      return res.status(400).json({
        success: false,
        message: 'User information is missing',
      });
    }

    let developerProgram = await DeveloperProgram.findOne({ userId });

    if (!developerProgram) {
      developerProgram = new DeveloperProgram({ userId, isActive: true });
    } else {
      developerProgram.isActive = true;
    }

    await developerProgram.save();

    await nodemailerService.sendDeveloperProgramJoinEmail(userEmail, username);

    res.status(200).json({
      success: true,
      message: 'Successfully joined developer program',
    });
  } catch (error) {
    logger.error('Error joining developer program:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

exports.leaveDeveloperProgram = async (req, res) => {
  try {
    const userId = req.user?._id;
    const userEmail = req.user?.email;
    const username = req.user?.username;

    if (!userId || !userEmail || !username) {
      return res.status(400).json({
        success: false,
        message: 'User information is missing',
      });
    }

    const developerProgram = await DeveloperProgram.findOneAndUpdate(
      { userId },
      { isActive: false },
      { new: true }
    );

    if (!developerProgram) {
      return res.status(404).json({
        success: false,
        message: 'Developer Program not found',
      });
    }

    await nodemailerService.sendDeveloperProgramLeaveEmail(userEmail, username);

    res.status(200).json({
      success: true,
      message: 'Successfully left developer program',
    });
  } catch (error) {
    logger.error('Error leaving developer program:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};
