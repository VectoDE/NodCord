const mongoose = require('mongoose');
const User = require('../models/userModel');
const logger = require('../api/services/loggerService');
const bcrypt = require('bcrypt');

const users = [
  {
    profilePicture: '',
    fullname: 'Admin User',
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    bio: 'I am the admin.',
    socialLinks: {
      facebook: 'https://facebook.com/admin',
      twitter: 'https://twitter.com/admin',
      google: 'https://google.com/admin',
      linkedin: 'https://linkedin.com/in/admin',
      instagram: 'https://instagram.com/admin',
      github: 'https://github.com/admin',
      discord: 'https://discord.com/admin',
      apple: 'https://apple.com/admin',
    },
    isVerified: true,
    isAuthenticated: false,
    isBetaTester: true,
    termsAccepted: true,
    termsAcceptedAt: new Date(),
  },
  {
    profilePicture: '',
    fullname: 'Moderator User',
    username: 'moderator',
    email: 'moderator@example.com',
    password: 'password123',
    role: 'moderator',
    bio: 'I am a moderator.',
    socialLinks: {
      google: 'https://google.com/admin',
      github: 'https://github.com/admin',
      apple: 'https://apple.com/in/admin',
    },
    isVerified: true,
    isAuthenticated: false,
    isBetaTester: true,
    termsAccepted: true,
    termsAcceptedAt: new Date(),
  },
  {
    profilePicture: '',
    fullname: 'Regular User',
    username: 'user',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
    bio: 'I am a regular user.',
    socialLinks: {
      google: 'https://google.com/admin',
      github: 'https://github.com/admin',
    },
    isVerified: true,
    isAuthenticated: false,
    isBetaTester: true,
    termsAccepted: true,
    termsAcceptedAt: new Date(),
  },
];

const createUser = async (data) => {
  try {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      logger.info(`[SEED] User with email ${data.email} already exists.`);
      return;
    }

    const user = new User(data);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    logger.info(`[SEED] User ${data.username} created successfully.`);
  } catch (error) {
    logger.error(`[SEED] Error creating user ${data.username}: `, error);
  }
};

const seedUsersIfNotExist = async () => {
  try {
    const existingUsers = await User.find({});
    if (existingUsers.length === 0) {
      for (const userData of users) {
        await createUser(userData);
      }
      logger.info('[SEED] Seeding users completed successfully.');
    } else {
      logger.warn('[SEED] Users already exist, skipping seeding');
    }
  } catch (error) {
    logger.error('[SEED] Error during user seeding:', error);
  }
};

module.exports = {
  seedUsersIfNotExist,
};
