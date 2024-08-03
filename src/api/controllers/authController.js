const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailerService = require('../services/nodemailerService');

exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, fullname } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = new User({
      username,
      email,
      password,
      fullname,
      verificationToken: crypto.randomBytes(32).toString('hex')
    });
    await user.save();

    const verificationLink = `${user.verificationToken}`;
    await nodemailerService.sendRegistrationVerificationEmail(user.email, user.username, verificationLink);

    res.redirect('/login');
  } catch (err) {
    console.error('Error during registration:', err.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).render('email-verified', { message: 'Your email has been verified. You can now log in.' });

    await nodemailerService.sendVerificationSuccessEmail(user.email, user.username);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });

    if (!user || !await user.comparePassword(password)) {
      return res.status(400).render('login', {
        isAuthenticated: false,
        errorMessage: 'Invalid credentials'
      });
    }

    if (!user.isVerified) {
      return res.status(400).render('login', {
        isAuthenticated: false,
        errorMessage: 'Email not verified'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    user.isAuthenticated = true;
    await user.save();

    req.session.token = token;

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Internal Server Error');
  }
};

exports.logout = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid user' });
    }
    
    user.isAuthenticated = false;
    await user.save();

    res.redirect('/');

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
