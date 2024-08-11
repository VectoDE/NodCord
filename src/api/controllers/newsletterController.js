const Newsletter = require('../../models/newsletterModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

const addSubscriber = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }

    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Email is already subscribed' });
    }

    const newSubscriber = new Newsletter({ email, name });
    await newSubscriber.save();

    await nodemailerService.sendSubscriptionConfirmation(email, name);

    logger.info(`New subscriber added: ${email}`);
    res.status(201).json(newSubscriber);
  } catch (error) {
    logger.error('Error adding subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find();
    logger.info('Fetched all subscribers successfully');
    res.status(200).json(subscribers);
  } catch (error) {
    logger.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const removeSubscriber = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const deletedSubscriber = await Newsletter.findOneAndDelete({ email });

    if (!deletedSubscriber) {
      logger.warn(`Subscriber not found for email: ${email}`);
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    logger.info(`Subscriber removed successfully: ${email}`);
    res.status(200).json({ message: 'Subscriber removed successfully' });
  } catch (error) {
    logger.error('Error removing subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  addSubscriber,
  getSubscribers,
  removeSubscriber,
};
