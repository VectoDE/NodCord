const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailerService = require('../services/nodemailerService');
const logger = require('../services/loggerService');

exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, fullname, terms } = req.body;

    if (!username || !email || !password || !confirmPassword || !fullname || !terms) {
      return res.render('auth/register', {
        errorMessage: 'All fields are required, including accepting the terms and conditions.',
      });
    }

    if (password !== confirmPassword) {
      return res.render('auth/register', {
        errorMessage: 'Passwords do not match',
      });
    }

    if (!terms) {
      return res.render('auth/register', {
        errorMessage: 'You must accept the Terms of Service',
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('auth/register', {
        errorMessage: 'User already exists',
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

    res.redirect('/login');
  } catch (err) {
    logger.error('Error during registration:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
  }
};


exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    await nodemailerService.sendVerificationSuccessEmail(
      user.email,
      user.username
    );

    res.status(200).render('verification/email-verified', {
      message: 'Your email has been verified. You can now log in.',
    });
  } catch (error) {
    logger.error('Verification error:', error.message);
    res.status(500).send('Internal Server Error');
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
      return res.status(400).render('auth/login', {
        isAuthenticated: false,
        errorMessage: 'Invalid credentials',
      });
    }

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
    res.redirect('/dashboard');
  } catch (err) {
    logger.error('Login error:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid user' });
    }

    user.isAuthenticated = false;
    await user.save();

    res.clearCookie('token');
    res.redirect('/');
  } catch (err) {
    logger.error('Logout error:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
