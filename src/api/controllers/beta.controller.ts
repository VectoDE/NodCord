require('dotenv').config();
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../../services/logger.service');
const BetaKey = require('../../models/betaKeyModel');
const BetaSystem = require('../../models/betaSystemModel');
const User = require('../../models/userModel');

function generateBetaKey() {
  return 'BETA-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

exports.createBetaKey = async (req, res) => {
  try {
    const { name } = req.body;
    const key = generateBetaKey();

    const newBetaKey = new BetaKey({ key, name });
    await newBetaKey.save();

    const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Beta Key erstellt',
      key: newBetaKey
    });
  } catch (err) {
    logger.error('Fehler beim Erstellen des Beta Keys:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Erstellen des Beta Keys',
      error: err.message
    });
  }
};

exports.getBetaKeys = async (req, res) => {
  try {
    const betaKeys = await BetaKey.find().populate('user');
    const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      betaKeys
    });
  } catch (err) {
    logger.error('Fehler beim Abrufen der Beta Keys:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Abrufen der Beta Keys',
      error: err.message
    });
  }
};

exports.getBetaKeyById = async (req, res) => {
  try {
    const betaKey = await BetaKey.findById(req.params.id);
    if (!betaKey) {
      logger.warn('Beta Key nicht gefunden:', { id: req.params.id });
      const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Beta Key nicht gefunden'
      });
    }

    const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys/edit`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      betaKey
    });
  } catch (err) {
    logger.error('Fehler beim Abrufen des Beta Keys:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Abrufen des Beta Keys',
      error: err.message
    });
  }
};

exports.updateBetaKey = async (req, res) => {
  try {
    const { name } = req.body;
    const updatedBetaKey = await BetaKey.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!updatedBetaKey) {
      const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Beta Key nicht gefunden'
      });
    }

    const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Beta Key aktualisiert',
      key: updatedBetaKey
    });
  } catch (err) {
    logger.error('Fehler beim Aktualisieren des Beta Keys:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys/edit`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Aktualisieren des Beta Keys',
      error: err.message
    });
  }
};

exports.deleteBetaKey = async (req, res) => {
  try {
    const deletedBetaKey = await BetaKey.findByIdAndDelete(req.params.id);
    if (!deletedBetaKey) {
      const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Beta Key nicht gefunden'
      });
    }

    const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Beta Key gelöscht'
    });
  } catch (err) {
    logger.error('Fehler beim Löschen des Beta Keys:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/beta/keys`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Löschen des Beta Keys',
      error: err.message
    });
  }
};

exports.toggleBetaSystem = async (req, res) => {
  try {
    const { isActive } = req.body;
    const updatedBetaSystem = await BetaSystem.findOneAndUpdate(
      {},
      { isActive },
      { upsert: true, new: true }
    );

    const redirectUrl = `${getBaseUrl()}/dashboard/beta`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: `Beta System ${isActive ? 'aktiviert' : 'deaktiviert'}`,
      betaSystem: updatedBetaSystem
    });
  } catch (err) {
    logger.error('Fehler beim Umschalten des Beta Systems:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/beta`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Umschalten des Beta Systems',
      error: err.message
    });
  }
};

exports.verifyBetaKey = async (req, res) => {
  try {
    const { key, redirectTo } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return sendResponse(req, res, getBaseUrl(), {
        success: false,
        message: 'Benutzer nicht angemeldet'
      });
    }

    const betaKey = await BetaKey.findOne({ key });
    if (!betaKey) {
      return sendResponse(req, res, getBaseUrl(), {
        success: false,
        message: 'Ungültiger Beta Key'
      });
    }

    if (betaKey.user) {
      return sendResponse(req, res, getBaseUrl(), {
        success: false,
        message: 'Beta Key wurde bereits verwendet'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { betaKey: betaKey._id, isBetaTester: true },
      { new: true }
    );

    betaKey.user = user._id;
    await betaKey.save();

    if (redirectTo) {
      return res.redirect(redirectTo);
    } else {
      return sendResponse(req, res, getBaseUrl(), {
        success: true,
        message: 'Beta Key erfolgreich verifiziert',
        user
      });
    }
  } catch (err) {
    logger.error('Fehler bei der Verifizierung des Beta Keys:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/beta`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler bei der Verifizierung des Beta Keys',
      error: err.message
    });
  }
};
