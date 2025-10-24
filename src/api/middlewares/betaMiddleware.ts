const BetaSystem = require('../../models/betaSystemModel');
const BetaKey = require('../../models/betaKeyModel');
const User = require('../../models/userModel');
const logger = require('../../services/logger.service');

exports.checkBetaSystemStatus = async (req, res, next) => {
  try {
    const betaSystem = await BetaSystem.findOne();

    if (betaSystem && betaSystem.isActive) {
      logger.info('[BETA] Beta System ist aktiv. Fortfahren.');
      return next();
    } else {
      logger.warn('[BETA] Beta System ist momentan deaktiviert.');
      return next();
    }
  } catch (error) {
    logger.error('[BETA] Fehler beim Überprüfen des Beta System Status:', error);
    return res
      .status(500)
      .json({
        message: 'Fehler beim Überprüfen des Beta System Status',
        error,
      });
  }
};

exports.checkBetaKeyValidity = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      logger.warn('Benutzer nicht authentifiziert.');
      return res
        .status(401)
        .json({ message: 'Benutzer nicht authentifiziert' });
    }

    const exemptRoles = ['admin', 'moderator', 'content'];
    if (exemptRoles.includes(user.role)) {
      logger.info(
        `Benutzer mit privilegierter Rolle '${user.role}' wird weitergeleitet.`
      );
      return next();
    }

    const betaKey = await BetaKey.findOne({ user: user._id });
    if (betaKey && betaKey.isActive) {
      logger.info(`Benutzer '${user._id}' hat einen aktiven Beta-Key.`);
      return next();
    } else {
      logger.warn(
        `Benutzer '${user._id}' hat keinen aktiven Beta-Key. Weiterleitung zur Beta-Verify-Seite.`
      );
      return res.redirect('/beta-verify');
    }
  } catch (error) {
    logger.error('Fehler beim Überprüfen des Beta Keys:', error);
    return res
      .status(500)
      .json({ message: 'Fehler beim Überprüfen des Beta Keys', error });
  }
};
