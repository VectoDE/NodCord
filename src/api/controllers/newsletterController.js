const Newsletter = require('../../models/newsletterModel');
const nodemailerService = require('../services/nodemailerService');

// Funktion zum Hinzufügen eines neuen Abonnenten
const addSubscriber = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Überprüfen, ob die E-Mail-Adresse bereits vorhanden ist
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Email is already subscribed' });
    }

    // Erstellen eines neuen Abonnenten
    const newSubscriber = new Newsletter({ email, name });
    await newSubscriber.save();

    // Sende eine Bestätigungs-E-Mail
    await nodemailerService.sendSubscriptionConfirmation(email, name);

    res.status(201).json(newSubscriber);
  } catch (error) {
    console.error('Error adding subscriber:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Funktion zum Abrufen aller Abonnenten
const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find();
    res.status(200).json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Funktion zum Löschen eines Abonnenten
const removeSubscriber = async (req, res) => {
  try {
    const { email } = req.params;

    // Löschen des Abonnenten
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
  removeSubscriber
};
