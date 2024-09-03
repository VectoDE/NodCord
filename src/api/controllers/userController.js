const User = require('../../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../services/loggerService');

exports.createUser = async (req, res) => {
  try {
    const { fullname, username, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      logger.warn('Password mismatch during user creation:', {
        username,
        email,
      });
      return res.render('dashboard/users/createUser', {
        errorMessage: 'Passwords do not match',
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullname, username, email, password: hashedPassword, role });
    await user.save();

    const users = await User.find();

    logger.info('User created successfully:', { username, email });
    res.render('dashboard/users/users', {
      errorMessage: 'User created successfully',
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      user,
      users,
    });
  } catch (err) {
    logger.error('Error creating user:', err);
    res.render('dashboard/users/createUser', {
      errorMessage: 'You must accept the Terms of Service',
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    logger.info('Fetched all users:', { count: users.length });
    res.status(200).json({ success: true, users });
  } catch (err) {
    logger.error('Error fetching users:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      logger.warn('User not found:', { userId: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    logger.info('User fetched by ID:', { userId: req.params.id });
    res.status(200).json({ success: true, user });
  } catch (err) {
    logger.error('Error fetching user by ID:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password && password !== confirmPassword) {
      logger.warn('Password mismatch during user update:', {
        userId: req.params.id,
      });
      return res
        .status(400)
        .json({ success: false, message: 'Passwords do not match' });
    }

    const updates = { username, email };

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!user) {
      logger.warn('User not found for update:', { userId: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    logger.info('User updated successfully:', { userId: req.params.id });
    res.status(200).json({ success: true, user });
  } catch (err) {
    logger.error('Error updating user:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      logger.warn('User not found for deletion:', { userId: req.params.id });
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    logger.info('User deleted successfully:', { userId: req.params.id });
    res
      .status(200)
      .json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    logger.error('Error deleting user:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      logger.warn('User not found for getUser:', { userId: req.userId });
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    logger.info('User fetched successfully:', { userId: req.userId });
    res.status(200).json({ success: true, user });
  } catch (err) {
    logger.error('Error fetching user:', err);
    res.status(400).json({ success: false, message: err.message });
  }
};
