const mongoose = require('mongoose');
const Role = require('../models/roleModel');
const logger = require('../api/services/loggerService');

const roles = [
  { roleName: 'admin', displayName: 'Administrator' },
  { roleName: 'moderator', displayName: 'Moderator' },
  { roleName: 'developer', displayName: 'Developer' },
  { roleName: 'content', displayName: 'Content Creator' },
  { roleName: 'supporter', displayName: 'Supporter' },
  { roleName: 'premium', displayName: 'Premium Member' },
  { roleName: 'vip', displayName: 'VIP Member' },
  { roleName: 'user', displayName: 'User' },
];

const seedRolesIfNotExist = async () => {
  try {
    const existingRoles = await Role.find({});
    if (existingRoles.length === 0) {
      await Role.insertMany(roles);
      logger.info('Roles seeded successfully');
    } else {
      logger.warn('Roles already exist, skipping seeding');
    }
  } catch (err) {
    logger.error('Error seeding roles:', err);
  }
};

module.exports = {
  seedRolesIfNotExist,
};
