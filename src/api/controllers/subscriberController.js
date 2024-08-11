const Subscriber = require('../../models/subscriberModel');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

const createSubscriber = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      logger.warn('Missing required fields in create subscriber request:', {
        body: req.body,
      });
      return res.status(400).json({ message: 'Email and name are required.' });
    }

    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      logger.info('Subscriber already exists:', { email });
      return res.status(400).json({ message: 'Subscriber already exists.' });
    }

    const newSubscriber = new Subscriber({ email, name });
    await newSubscriber.save();

    await nodemailerService.sendSubscriptionConfirmation(email, name);

    logger.info('Subscriber created and confirmation email sent:', {
      email,
      name,
    });
    res
      .status(201)
      .json({ message: 'Subscriber created and confirmation email sent.' });
  } catch (error) {
    logger.error('Error creating subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    logger.info('Fetched all subscribers:', { count: subscribers.length });
    res.status(200).json(subscribers);
  } catch (error) {
    logger.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getSubscriberById = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      logger.warn('Subscriber not found by ID:', { id: req.params.id });
      return res.status(404).json({ message: 'Subscriber not found.' });
    }
    logger.info('Fetched subscriber by ID:', { id: req.params.id });
    res.status(200).json(subscriber);
  } catch (error) {
    logger.error('Error fetching subscriber by ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateSubscriber = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email && !name) {
      logger.warn('No fields to update in update subscriber request:', {
        body: req.body,
      });
      return res
        .status(400)
        .json({ message: 'At least one field is required to update.' });
    }

    const updatedSubscriber = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { email, name },
      { new: true, runValidators: true }
    );

    if (!updatedSubscriber) {
      logger.warn('Subscriber not found for update:', { id: req.params.id });
      return res.status(404).json({ message: 'Subscriber not found.' });
    }

    logger.info('Subscriber updated:', { id: req.params.id, email, name });
    res.status(200).json(updatedSubscriber);
  } catch (error) {
    logger.error('Error updating subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteSubscriber = async (req, res) => {
  try {
    const deletedSubscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!deletedSubscriber) {
      logger.warn('Subscriber not found for deletion:', { id: req.params.id });
      return res.status(404).json({ message: 'Subscriber not found.' });
    }
    logger.info('Subscriber deleted:', { id: req.params.id });
    res.status(200).json({ message: 'Subscriber deleted.' });
  } catch (error) {
    logger.error('Error deleting subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createSubscriber,
  getAllSubscribers,
  getSubscriberById,
  updateSubscriber,
  deleteSubscriber,
};
