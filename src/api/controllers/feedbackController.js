const Feedback = require('../../models/feedbackModel');
const logger = require('../services/loggerService');

exports.createFeedback = async (req, res) => {
  try {
    const { userId, username, feedbackText } = req.body;

    if (!userId || !username || !feedbackText) {
      return res
        .status(400)
        .json({ message: 'Fehlende erforderliche Felder.' });
    }

    const feedback = new Feedback({
      userId,
      username,
      feedbackText,
    });

    await feedback.save();

    res
      .status(201)
      .json({ message: 'Feedback erfolgreich erstellt!', feedback });
  } catch (error) {
    logger.error('Fehler beim Erstellen des Feedbacks:', error);
    res
      .status(500)
      .json({
        message: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
      });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    logger.error('Fehler beim Abrufen des Feedbacks:', error);
    res
      .status(500)
      .json({
        message: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
      });
  }
};
