const mongoose = require('mongoose');
const Role = require('../../src/models/roleModel');
const logger = require('../../src/api/services/loggerService');

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

export const seedRolesIfNotExist = async () => {
  try {
    const existingRoles = await Role.find({});
    if (existingRoles.length === 0) {
      await Role.insertMany(roles);
      logger.info('[SEED] Roles seeded successfully');
    } else {
      logger.warn('[SEED] Roles already exist, skipping seeding');
    }
  } catch (err) {
    logger.error('[SEED] Error seeding roles:', err);
  }
};
