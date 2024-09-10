require('dotenv').config();
const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const passport = require('passport');

exports.googleCallback = async (req, res) => {
  try {
    if (req.user) {
      req.user.recentActivity = new Date();

      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      req.user.isAuthenticated = true;
      await req.user.save();

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      // Weiterleiten zum Benutzerprofil oder Dashboard basierend auf der Rolle
      const redirectUrl = req.user.role === 'user' ? `${getBaseUrl()}/user/profile/${req.user.username}` : `${getBaseUrl()}/dashboard`;
      return res.redirect(redirectUrl);
    } else {
      // Fehlgeschlagene Authentifizierung
      return res.redirect(`${getBaseUrl()}/login`);
    }
  } catch (err) {
    logger.error('Google authentication error:', err.message);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

exports.githubCallback = async (req, res) => {
  try {
    if (req.user) {
      req.user.recentActivity = new Date();

      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });
      req.user.isAuthenticated = true;
      await req.user.save();

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      const redirectUrl = req.user.role === 'user' ? `${getBaseUrl()}/user/profile/${req.user.username}` : `${getBaseUrl()}/dashboard`;
      return res.redirect(redirectUrl);
    } else {
      return res.redirect(`${getBaseUrl()}/login`);
    }
  } catch (err) {
    logger.error('GitHub authentication error:', err.message);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

// Email verification
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      const redirectUrl = `${getBaseUrl()}/verify-email/${token}`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Invalid verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    await nodemailerService.sendVerificationSuccessEmail(user.email, user.username);

    const redirectUrl = `${getBaseUrl()}/verify-email/${token}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Your email has been verified. You can now log in.'
    });
  } catch (error) {
    logger.error('Verification error:', error.message);
    const redirectUrl = `${getBaseUrl()}/verify-email/${token}`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// User logout
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      logger.error('Error during logout:', err.message);
      return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }

    res.clearCookie('token');
    return res.redirect(`${getBaseUrl()}/`);
  });
};
