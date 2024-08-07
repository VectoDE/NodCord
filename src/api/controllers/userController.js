const User = require('../../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Passwords do not match' });
    }

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password && password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Passwords do not match' });
    }

    const updates = { username, email };

    if (password) {
      updates.password = password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    res
      .status(200)
      .json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
