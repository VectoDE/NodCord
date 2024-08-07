const DeveloperProgram = require('../../models/developerProgramModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

exports.joinDeveloperProgram = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;
    const username = req.user.username;

    let developerProgram = await DeveloperProgram.findOne({ userId });

    if (!developerProgram) {
      developerProgram = new DeveloperProgram({ userId, isActive: true });
    } else {
      developerProgram.isActive = true;
    }

    await developerProgram.save();

    await nodemailerService.sendDeveloperProgramJoinEmail(userEmail, username);

    res.json({ message: 'Successfully joined developer program' });
  } catch (error) {
    logger.error('Error joining developer program:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.leaveDeveloperProgram = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;
    const username = req.user.username;

    const developerProgram = await DeveloperProgram.findOneAndUpdate(
      { userId },
      { isActive: false },
      { new: true }
    );

    if (!developerProgram) {
      return res.status(404).json({ message: 'Developer Program not found' });
    }

    await nodemailerService.sendDeveloperProgramLeaveEmail(userEmail, username);

    res.json({ message: 'Successfully left developer program' });
  } catch (error) {
    logger.error('Error leaving developer program:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
