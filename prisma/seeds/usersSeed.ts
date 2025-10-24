/**
 * @fileoverview
 * Enterprise-grade Prisma Seeder for User entities.
 * Seeds default users if they do not exist.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../../src/services/logger.service';

const prisma = new PrismaClient();

// ------------------------------------------------------------
// Default Users
// ------------------------------------------------------------
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
] as const;

// ------------------------------------------------------------
// Create User Helper
// ------------------------------------------------------------
const createUser = async (
  data: (typeof users)[number]
): Promise<void> => {
  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      logger.info(`[SEED] User with email ${data.email} already exists.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    logger.info(`[SEED] User ${data.username} created successfully.`);
  } catch (error) {
    logger.error(`[SEED] Error creating user ${data.username}`, {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
  }
};

// ------------------------------------------------------------
// Seed Function
// ------------------------------------------------------------
export const seedUsersIfNotExist = async (): Promise<void> => {
  logger.info('[SEED] Starting user seeding process');

  try {
    const userCount = await prisma.user.count();

    if (userCount > 0) {
      logger.info('[SEED] Users already exist, skipping seeding', { userCount });
      return;
    }

    await prisma.$transaction(async () => {
      for (const user of users) {
        await createUser(user);
      }
    });

    logger.info('[SEED] Seeding users completed successfully.');
  } catch (error) {
    logger.error('[SEED] Error during user seeding', {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  } finally {
    await prisma.$disconnect();
    logger.debug('[SEED] Prisma connection closed');
  }
};

// ------------------------------------------------------------
// Direct Execution Guard
// ------------------------------------------------------------
if (require.main === module) {
  seedUsersIfNotExist()
    .then(() => {
      logger.info('[SEED] User seeding completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('[SEED] User seeding failed', {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
      process.exit(1);
    });
}
