const Subscriber = require('../../models/subscriberModel');
const nodemailerService = require('../services/nodemailerService');

const createSubscriber = async (req, res) => {
  try {
    const { email, name } = req.body;

    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Subscriber already exists.' });
    }

    const newSubscriber = new Subscriber({ email, name });
    await newSubscriber.save();

    await nodemailerService.sendSubscriptionConfirmation(email, name);

    res.status(201).json({ message: 'Subscriber created and confirmation email sent.' });
  } catch (error) {
    console.error('Error creating subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    res.status(200).json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getSubscriberById = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found.' });
    }
    res.status(200).json(subscriber);
  } catch (error) {
    console.error('Error fetching subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateSubscriber = async (req, res) => {
  try {
    const { email, name } = req.body;
    const updatedSubscriber = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { email, name },
      { new: true, runValidators: true }
    );

    if (!updatedSubscriber) {
      return res.status(404).json({ message: 'Subscriber not found.' });
    }

    res.status(200).json(updatedSubscriber);
  } catch (error) {
    console.error('Error updating subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteSubscriber = async (req, res) => {
  try {
    const deletedSubscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!deletedSubscriber) {
      return res.status(404).json({ message: 'Subscriber not found.' });
    }
    res.status(200).json({ message: 'Subscriber deleted.' });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createSubscriber,
  getAllSubscribers,
  getSubscriberById,
  updateSubscriber,
  deleteSubscriber
};
