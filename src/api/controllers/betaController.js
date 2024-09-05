const BetaKey = require('../../models/betaKeyModel');
const BetaSystem = require('../../models/betaSystemModel');
const User = require('../../models/userModel');
const logger = require('../services/loggerService');

function generateBetaKey() {
  return 'BETA-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

async function renderErrorPage(res, view, errorMessage, errorstack) {
  res.render(view, {
    errorMessage,
    errorstack,
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
  });
}

exports.createBetaKey = async (req, res) => {
  const { name } = req.body;
  const key = generateBetaKey();

  try {
    const newBetaKey = new BetaKey({ key, name });
    await newBetaKey.save();

    if (process.env.NODE_ENV === 'production') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(201).json({
          message: 'Beta Key erstellt',
          key: newBetaKey,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/beta/keys`);
      }
    } else if (process.env.NODE_ENV === 'development') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(201).json({
          message: 'Beta Key erstellt',
          key: newBetaKey,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/beta/keys`);
      }
    }
  } catch (error) {
    logger.error('Fehler beim Erstellen des Beta Keys:', error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.status(500).json({
        message: 'Fehler beim Erstellen des Beta Keys',
        error: error.message,
      });
    } else {
      renderErrorPage(res, 'dashboard/beta/betaKeys/createBetaKey', 'Fehler beim Erstellen des Beta Keys', error.stack);
    }
  }
};

exports.getBetaKeys = async (req, res) => {
  try {
    const betaKeys = await BetaKey.find().populate('user');
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.status(200).json(betaKeys);
    } else {
      res.render('dashboard/beta/betaKeys/betaKeys', {
        betaKeys,
        isAuthenticated: res.locals.isAuthenticated,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
      });
    }
  } catch (error) {
    logger.error('Fehler beim Abrufen der Beta Keys:', error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.status(500).json({
        message: 'Fehler beim Abrufen der Beta Keys',
        error: error.message,
      });
    } else {
      renderErrorPage(res, 'dashboard/beta/betaKeys/betaKeys', 'Fehler beim Abrufen der Beta Keys', error.stack);
    }
  }
};

exports.getBetaKeyById = async (req, res) => {
  const { id } = req.params;

  try {
    const betaKey = await BetaKey.findById(id);
    if (process.env.NODE_ENV === 'production') {
      if (!betaKey) {
        logger.warn('Beta Key nicht gefunden:', { id });
        return res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/beta/keys`);
      }
    } else if (process.env.NODE_ENV === 'development') {
      if (!betaKey) {
        logger.warn('Beta Key nicht gefunden:', { id });
        return res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/beta/keys`);
      }
    }

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.status(200).json(betaKey);
    } else {
      res.render('dashboard/beta/betaKeys/editBetaKey', {
        betaKey,
        isAuthenticated: res.locals.isAuthenticated,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
      });
    }
  } catch (error) {
    logger.error('Fehler beim Abrufen des Beta Keys:', error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.status(500).json({
        message: 'Fehler beim Abrufen des Beta Keys',
        error: error.message,
      });
    } else {
      renderErrorPage(res, 'dashboard/beta/betaKeys/editBetaKey', 'Fehler beim Abrufen des Beta Keys', error.stack);
    }
  }
};

exports.updateBetaKey = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedBetaKey = await BetaKey.findByIdAndUpdate(id, { name }, { new: true });
    if (!updatedBetaKey) {
      return res.status(404).json({ message: 'Beta Key nicht gefunden' });
    }

    if (process.env.NODE_ENV === 'production') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(200).json({
          message: 'Beta Key aktualisiert',
          key: updatedBetaKey,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/beta/keys`);
      }
    } else if (process.env.NODE_ENV === 'development') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(200).json({
          message: 'Beta Key aktualisiert',
          key: updatedBetaKey,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/beta/keys`);
      }
    }
  } catch (error) {
    logger.error('Fehler beim Aktualisieren des Beta Keys:', error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.status(500).json({
        message: 'Fehler beim Aktualisieren des Beta Keys',
        error: error.message,
      });
    } else {
      renderErrorPage(res, 'dashboard/beta/betaKeys/editBetaKey', 'Fehler beim Aktualisieren des Beta Keys', error.stack);
    }
  }
};

exports.deleteBetaKey = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBetaKey = await BetaKey.findByIdAndDelete(id);
    if (!deletedBetaKey) {
      return res.status(404).json({ message: 'Beta Key nicht gefunden' });
    }

    if (process.env.NODE_ENV === 'production') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(200).json({
          message: 'Beta Key gelöscht',
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/beta/keys`);
      }
    } else if (process.env.NODE_ENV === 'development') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(200).json({
          message: 'Beta Key gelöscht',
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/beta/keys`);
      }
    }
  } catch (error) {
    logger.error('Fehler beim Löschen des Beta Keys:', error);
    if (process.env.NODE_ENV === 'production') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(500).json({
          message: 'Fehler beim Löschen des Beta Keys',
          error: error.message,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/beta/keys`);
      }
    } else if (process.env.NODE_ENV === 'development') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(500).json({
          message: 'Fehler beim Löschen des Beta Keys',
          error: error.message,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/beta/keys`);
      }
    }
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

    if (process.env.NODE_ENV === 'production') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(200).json({
          message: `Beta System ${isActive ? 'aktiviert' : 'deaktiviert'}`,
          betaSystem: updatedBetaSystem,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/beta`);
      }
    } else if (process.env.NODE_ENV === 'development') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(200).json({
          message: `Beta System ${isActive ? 'aktiviert' : 'deaktiviert'}`,
          betaSystem: updatedBetaSystem,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/beta`);
      }
    }
  } catch (error) {
    logger.error('Fehler beim Umschalten des Beta Systems:', error);
    if (process.env.NODE_ENV === 'production') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(500).json({
          message: 'Fehler beim Umschalten des Beta Systems',
          error: error.message,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/beta`);
      }
    } else if (process.env.NODE_ENV === 'development') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(500).json({
          message: 'Fehler beim Umschalten des Beta Systems',
          error: error.message,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/beta`);
      }
    }
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
      return res.status(400).json({ message: 'Beta Key wurde bereits verwendet' });
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
      return res.status(200).json({
        message: 'Beta Key erfolgreich verifiziert',
        user,
      });
    }
  } catch (error) {
    logger.error('Fehler bei der Verifizierung des Beta Keys:', error);
    if (process.env.NODE_ENV === 'production') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(500).json({
          message: 'Fehler bei der Verifizierung des Beta Keys',
          error: error.message,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/beta`);
      }
    } else if (process.env.NODE_ENV === 'development') {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        res.status(500).json({
          message: 'Fehler bei der Verifizierung des Beta Keys',
          error: error.message,
        });
      } else {
        res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/beta`);
      }
    }
  }
};
