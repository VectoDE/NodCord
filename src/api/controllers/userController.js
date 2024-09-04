require('dotenv').config();
const User = require('../../models/userModel');
const bcrypt = require('bcrypt');
const logger = require('../services/loggerService');

exports.createUser = async (req, res) => {
  try {
    const { fullname, username, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      logger.warn('Password mismatch during user creation:', { username, email });
      return res.render('dashboard/users/createUser', {
        errorMessage: 'Passwords do not match',
        isAuthenticated: res.locals.isAuthenticated,
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

    logger.info('User created successfully:', { username, email });
    res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/users`);
  } catch (err) {
    logger.error('Error creating user:', err);
    res.render('dashboard/users/createUser', {
      errorMessage: 'Error creating user',
      errorstack: err.stack,
      isAuthenticated: res.locals.isAuthenticated,
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
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { fullname: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query);
    logger.info('Fetched all users:', { count: users.length });
    res.render('dashboard/users/users', {
      users,
      errorMessage: null,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  } catch (err) {
    logger.error('Error fetching users:', err);
    res.render('dashboard/users/users', {
      users: [],
      errorMessage: 'Error fetching users',
      errorstack: err.stack,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      logger.warn('User not found:', { userId: req.params.id });
      return res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/users`);
    }

    logger.info('User fetched by ID:', { userId: req.params.id });
    res.render('dashboard/users/editUser', {
      user,
      errorMessage: null,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  } catch (err) {
    logger.error('Error fetching user by ID:', err);
    res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/users`);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { fullname, username, email, password, confirmPassword, role } = req.body;

    if (password && password !== confirmPassword) {
      logger.warn('Password mismatch during user update:', { userId: req.params.id });
      return res.render('dashboard/users/editUser', {
        user: req.body,
        errorMessage: 'Passwords do not match',
        isAuthenticated: res.locals.isAuthenticated,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
      });
    }

    const updates = { fullname, username, email, role };

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) {
      logger.warn('User not found for update:', { userId: req.params.id });
      return res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/users`);
    }

    logger.info('User updated successfully:', { userId: req.params.id });
    res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/users`);
  } catch (err) {
    logger.error('Error updating user:', err);
    res.render('dashboard/users/editUser', {
      user: req.body,
      errorMessage: 'Error updating user',
      errorstack: err.stack,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      logger.warn('User not found for deletion:', { userId: req.params.id });
      return res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/users`);
    }

    logger.info('User deleted successfully:', { userId: req.params.id });
    res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/users`);
  } catch (err) {
    logger.error('Error deleting user:', err);
    res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/users`);
  }
};
