require('dotenv').config();
const bcrypt = require('bcrypt');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../../services/logger.service');
const User = require('../../models/userModel');

exports.createUser = async (req, res) => {
  try {
    const { fullname, username, email, password, confirmPassword, role } = req.body;

    if (password !== confirmPassword) {
      logger.warn('Password mismatch during user creation:', { username, email });
      const redirectUrl = `${getBaseUrl()}/dashboard/users/create`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Passwords do not match'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullname, username, email, password: hashedPassword, role });
    await user.save();

    logger.info('User created successfully:', { username, email });
    const redirectUrl = `${getBaseUrl()}/dashboard/users`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'User created successfully',
      user
    });
  } catch (err) {
    logger.error('Error creating user:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/users/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error creating user',
      error: err.message
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

    const redirectUrl = `${getBaseUrl()}/dashboard/users`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      users
    });
  } catch (err) {
    logger.error('Error fetching users:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/users`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching users',
      error: err.message
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      logger.warn('User not found:', { userId: req.params.userId });
      const redirectUrl = `${getBaseUrl()}/dashboard/users`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'User not found'
      });
    }

    logger.info('User fetched by ID:', { userId: req.params.userId });
    const redirectUrl = `${getBaseUrl()}/dashboard/users/editUser`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      user
    });
  } catch (err) {
    logger.error('Error fetching user by ID:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/users`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching user',
      error: err.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { fullname, username, email, password, confirmPassword, role } = req.body;

    if (password && password !== confirmPassword) {
      logger.warn('Password mismatch during user update:', { userId: req.params.userId });
      const redirectUrl = `${getBaseUrl()}/dashboard/users/edit`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Passwords do not match'
      });
    }

    const updates = { fullname, username, email, role };
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true });
    if (!user) {
      logger.warn('User not found for update:', { userId: req.params.userId });
      const redirectUrl = `${getBaseUrl()}/dashboard/users`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'User not found'
      });
    }

    logger.info('User updated successfully:', { userId: req.params.userId });
    const redirectUrl = `${getBaseUrl()}/dashboard/users`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (err) {
    logger.error('Error updating user:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/users/edit`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error updating user',
      error: err.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      logger.warn('User not found for deletion:', { userId: req.params.userId });
      const redirectUrl = `${getBaseUrl()}/dashboard/users`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'User not found'
      });
    }

    logger.info('User deleted successfully:', { userId: req.params.userId });
    const redirectUrl = `${getBaseUrl()}/dashboard/users`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    logger.error('Error deleting user:', err);
    const redirectUrl = `${getBaseUrl()}/dashboard/users`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error deleting user',
      error: err.message
    });
  }
};
