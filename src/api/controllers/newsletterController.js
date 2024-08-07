const Newsletter = require('../../models/newsletterModel');
const nodemailerService = require('../services/nodemailerService');

const addSubscriber = async (req, res) => {
  try {
    const { email, name } = req.body;

    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Email is already subscribed' });
    }

    const newSubscriber = new Newsletter({ email, name });
    await newSubscriber.save();

    await nodemailerService.sendSubscriptionConfirmation(email, name);

    res.status(201).json(newSubscriber);
  } catch (error) {
    console.error('Error adding subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find();
    res.status(200).json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const removeSubscriber = async (req, res) => {
  try {
    const { email } = req.params;

    const deletedSubscriber = await Newsletter.findOneAndDelete({ email });

    if (!deletedSubscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    res.status(200).json({ message: 'Subscriber removed successfully' });
  } catch (error) {
    console.error('Error removing subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  addSubscriber,
  getSubscribers,
  removeSubscriber,
};
