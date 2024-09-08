require('dotenv').config();
const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, fullname, terms } = req.body;

    if (!username || !email || !password || !confirmPassword || !fullname || !terms) {
      const redirectUrl = `${getBaseUrl()}/register`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'All fields are required, including accepting the terms and conditions.'
      });
    }

    if (password !== confirmPassword) {
      const redirectUrl = `${getBaseUrl()}/register`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Passwords do not match'
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const redirectUrl = `${getBaseUrl()}/register`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'User already exists'
      });
    }

    const user = new User({
      username,
      email,
      password,
      fullname,
      termsAccepted: true,
      termsAcceptedAt: new Date()
    });

    await user.save();

    const redirectUrl = `${getBaseUrl()}/login`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Registration successful, you can now log in.'
    });
  } catch (err) {
    logger.error('Error during registration:', err.message);
    const redirectUrl = `${getBaseUrl()}/register`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

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

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user || !(await user.comparePassword(password))) {
      logger.warn('Login failed: Invalid credentials');
      const redirectUrl = `${getBaseUrl()}/login`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.recentActivity = new Date();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    user.isAuthenticated = true;
    await user.save();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    logger.info(`User ${user.username} successfully logged in.`);

    const redirectUrl = user.role === 'user' ? `/user/profile/${user.username}` : '/dashboard';
    return sendResponse(req, res, `${getBaseUrl()}${redirectUrl}`, {
      success: true,
      message: 'Login successful',
      user
    });
  } catch (err) {
    logger.error('Login error:', err.message);
    const redirectUrl = `${getBaseUrl()}/login`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      const redirectUrl = `${getBaseUrl()}/login`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'No token found, unable to log out.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      const redirectUrl = `${getBaseUrl()}/login`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Invalid user'
      });
    }

    user.isAuthenticated = false;
    await user.save();

    res.clearCookie('token');
    const redirectUrl = `${getBaseUrl()}/`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Logout successful'
    });
  } catch (err) {
    logger.error('Logout error:', err.message);
    const redirectUrl = `${getBaseUrl()}/`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};
