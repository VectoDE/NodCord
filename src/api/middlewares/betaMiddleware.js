const BetaSystem = require('../../models/betaSystemModel');
const BetaKey = require('../../models/betaKeyModel');

// Middleware zum Überprüfen des Status des Beta Systems
exports.checkBetaSystemStatus = async (req, res, next) => {
  try {
    const betaSystem = await BetaSystem.findOne();
    if (betaSystem && betaSystem.isActive) {
      return next();
    } else {
      return res.status(403).json({ message: 'Beta System ist momentan deaktiviert.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Fehler beim Überprüfen des Beta System Status', error });
  }
};

// Middleware zum Überprüfen der Gültigkeit des Beta Keys
exports.checkBetaKeyValidity = async (req, res, next) => {
  const { key } = req.body;

  try {
    const betaKey = await BetaKey.findOne({ key });
    if (betaKey && betaKey.isActive) {
      return next();
    } else {
      return res.status(403).json({ message: 'Ungültiger oder inaktiver Beta Key.' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Fehler beim Überprüfen des Beta Keys', error });
  }
};
