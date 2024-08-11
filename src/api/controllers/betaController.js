const BetaKey = require('../../models/betaKeyModel');
const BetaSystem = require('../../models/betaSystemModel');
const User = require('../../models/userModel');
const logger = require('../services/loggerService');

function generateBetaKey() {
  return 'BETA-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

exports.createBetaKey = async (req, res) => {
  const { name } = req.body;
  const key = generateBetaKey();

  try {
    const newBetaKey = new BetaKey({ key, name });
    await newBetaKey.save();
    res.status(201).json({
      message: 'Beta Key erstellt',
      key: newBetaKey,
    });
  } catch (error) {
    logger.error('Fehler beim Erstellen des Beta Keys:', error);
    res.status(500).json({
      message: 'Fehler beim Erstellen des Beta Keys',
      error: error.message,
    });
  }
};

exports.editBetaKey = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedBetaKey = await BetaKey.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!updatedBetaKey) {
      return res.status(404).json({ message: 'Beta Key nicht gefunden' });
    }

    res.status(200).json({
      message: 'Beta Key aktualisiert',
      key: updatedBetaKey,
    });
  } catch (error) {
    logger.error('Fehler beim Aktualisieren des Beta Keys:', error);
    res.status(500).json({
      message: 'Fehler beim Aktualisieren des Beta Keys',
      error: error.message,
    });
  }
};

exports.deleteBetaKey = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBetaKey = await BetaKey.findByIdAndDelete(id);

    if (!deletedBetaKey) {
      return res.status(404).json({ message: 'Beta Key nicht gefunden' });
    }

    res.status(200).json({
      message: 'Beta Key gelöscht',
    });
  } catch (error) {
    logger.error('Fehler beim Löschen des Beta Keys:', error);
    res.status(500).json({
      message: 'Fehler beim Löschen des Beta Keys',
      error: error.message,
    });
  }
};

exports.toggleBetaSystem = async (req, res) => {
  const { isActive } = req.body;

  try {
    const updatedBetaSystem = await BetaSystem.findOneAndUpdate(
      {},
      { isActive },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: `Beta System ${isActive ? 'aktiviert' : 'deaktiviert'}`,
      betaSystem: updatedBetaSystem,
    });
  } catch (error) {
    logger.error('Fehler beim Umschalten des Beta Systems:', error);
    res.status(500).json({
      message: 'Fehler beim Umschalten des Beta Systems',
      error: error.message,
    });
  }
};

exports.getBetaKeys = async (req, res) => {
  try {
    const betaKeys = await BetaKey.find().populate('user');
    res.status(200).json(betaKeys);
  } catch (error) {
    logger.error('Fehler beim Abrufen der Beta Keys:', error);
    res.status(500).json({
      message: 'Fehler beim Abrufen der Beta Keys',
      error: error.message,
    });
  }
};

exports.verifyBetaKey = async (req, res) => {
  try {
    const { key, redirectTo } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: 'Benutzer nicht angemeldet' });
    }

    const betaKey = await BetaKey.findOne({ key });
    if (!betaKey) {
      return res.status(400).json({ message: 'Ungültiger Beta Key' });
    }

    if (betaKey.user) {
      return res
        .status(400)
        .json({ message: 'Beta Key wurde bereits verwendet' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { betaKey: betaKey._id },
      { new: true }
    );

    betaKey.user = user._id;
    await betaKey.save();

    if (redirectTo) {
      return res.redirect(redirectTo);
    } else {
      return res.status(200).json({
        message: 'Beta Key erfolgreich verifiziert',
        user,
      });
    }
  } catch (error) {
    logger.error('Fehler bei der Verifizierung des Beta Keys:', error);
    res.status(500).json({
      message: 'Fehler bei der Verifizierung des Beta Keys',
      error: error.message,
    });
  }
};
