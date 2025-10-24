/**
 * @fileoverview
 * Enterprise-grade Prisma Seeder for Role entities.
 * Safely seeds default roles into the database if they do not exist.
 */

import { PrismaClient } from '@prisma/client';
import logger from '../../src/services/logger.service';

const prisma = new PrismaClient();

const roles = [
  { roleName: 'admin', displayName: 'Administrator' },
  { roleName: 'moderator', displayName: 'Moderator' },
  { roleName: 'developer', displayName: 'Developer' },
  { roleName: 'content', displayName: 'Content Creator' },
  { roleName: 'supporter', displayName: 'Supporter' },
  { roleName: 'premium', displayName: 'Premium Member' },
  { roleName: 'vip', displayName: 'VIP Member' },
  { roleName: 'user', displayName: 'User' },
] as const;

/**
 * Seedet Standardrollen in die Datenbank, falls sie noch nicht existieren.
 * - Idempotent (führt Seeds nur aus, wenn keine Rollen vorhanden sind)
 * - Transaktional (atomar über Prisma)
 * - Logging über Winston (JSON-basiert, production-ready)
 */
export const seedRolesIfNotExist = async (): Promise<void> => {
  logger.info('[SEED] Starting role seeding process');

  try {
    const existingCount = await prisma.role.count();

    if (existingCount > 0) {
      logger.info('[SEED] Roles already exist, skipping seeding', { existingCount });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.role.createMany({
        data: roles,
        skipDuplicates: true,
      });
    });

    logger.info('[SEED] Roles seeded successfully', { seededCount: roles.length });
  } catch (error) {
    logger.error('[SEED] Error seeding roles', {
      errorName: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    // Fehler an höheren Stack weiterreichen (z. B. für CI/CD)
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
  seedRolesIfNotExist()
    .then(() => {
      logger.info('[SEED] Role seeding completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('[SEED] Role seeding failed', {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
      process.exit(1);
    });
}
