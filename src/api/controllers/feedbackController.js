const Feedback = require('../../models/feedbackModel');
const logger = require('../services/loggerService');

exports.createFeedback = async (req, res) => {
  try {
    const { userId, username, feedbackText } = req.body;

    if (!userId || !username || !feedbackText) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields.' });
    }

    const feedback = new Feedback({
      userId,
      username,
      feedbackText,
    });

    await feedback.save();

    res
      .status(201)
      .json({
        success: true,
        message: 'Feedback successfully created!',
        feedback,
      });
  } catch (error) {
    logger.error('Error creating feedback:', error);
    res
      .status(500)
      .json({
        success: false,
        message: 'An error occurred. Please try again later.',
      });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).exec();
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    logger.error('Error retrieving feedbacks:', error);
    res
      .status(500)
      .json({
        success: false,
        message: 'An error occurred. Please try again later.',
      });
  }
};
