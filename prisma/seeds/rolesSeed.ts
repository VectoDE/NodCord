/**
 * @fileoverview
 * Prisma seeder for role definitions.
 * Ensures core roles exist without mutating manually managed records.
 */

import { Prisma, PrismaClient } from '@prisma/client';
import logger from '../../src/services/logger.service';

const prisma = new PrismaClient();

type RoleSeedDefinition = {
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  permissions?: Prisma.JsonValue;
  metadata?: Prisma.JsonValue;
  isDefault?: boolean;
  isSystem?: boolean;
  tenantId?: string | null;
};

const buildRoleMetadata = (name: string): Prisma.JsonObject => ({
  seed: 'core-role',
  role: name,
  version: 1,
});

const ROLE_SEEDS: ReadonlyArray<RoleSeedDefinition> = [
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full access to all administrative features.',
    permissions: { scopes: ['*'] },
    isSystem: true,
  },
  {
    name: 'moderator',
    displayName: 'Moderator',
    description: 'Moderates community content and handles escalations.',
    permissions: { scopes: ['content:moderate', 'users:read'] },
    isSystem: true,
  },
  {
    name: 'developer',
    displayName: 'Developer',
    description: 'Access to developer tooling and beta features.',
    permissions: { scopes: ['developer:read', 'developer:write'] },
    isSystem: true,
  },
  {
    name: 'content',
    displayName: 'Content Creator',
    description: 'Creates and manages platform content.',
    permissions: { scopes: ['content:read', 'content:write'] },
    isSystem: true,
  },
  {
    name: 'supporter',
    displayName: 'Support',
    description: 'Handles support tickets and customer communication.',
    permissions: { scopes: ['support:read', 'support:write'] },
    isSystem: true,
  },
  {
    name: 'premium',
    displayName: 'Premium Member',
    description: 'Premium subscription tier with extended capabilities.',
    permissions: { scopes: ['premium:access'] },
    metadata: { billingPlan: 'premium' },
  },
  {
    name: 'vip',
    displayName: 'VIP Member',
    description: 'VIP tier for strategic partners.',
    permissions: { scopes: ['vip:access'] },
    metadata: { billingPlan: 'vip' },
  },
  {
    name: 'user',
    displayName: 'User',
    description: 'Default user role with baseline access.',
    permissions: { scopes: ['user:read'] },
    isDefault: true,
  },
] as const;

const createRole = async (
  tx: Prisma.TransactionClient,
  seed: RoleSeedDefinition,
): Promise<boolean> => {
  const existing = await tx.role.findFirst({
    where: {
      tenantId: seed.tenantId ?? null,
      name: seed.name,
    },
  });

  if (existing) {
    logger.info('[SEED] Role already exists, skipping', {
      name: seed.name,
      roleId: existing.id,
    });
    return false;
  }

  await tx.role.create({
    data: {
      tenantId: seed.tenantId ?? null,
      name: seed.name,
      displayName: seed.displayName,
      description: seed.description ?? null,
      color: seed.color ?? '#000000',
      permissions: seed.permissions ?? { scopes: [] },
      metadata: seed.metadata ?? buildRoleMetadata(seed.name),
      isDefault: seed.isDefault ?? false,
      isSystem: seed.isSystem ?? false,
    },
  });

  logger.info('[SEED] Role created', { name: seed.name });
  return true;
};

export const seedRolesIfNotExist = async (): Promise<void> => {
  logger.info('[SEED] Starting role seeding process');

  try {
    let createdCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const seed of ROLE_SEEDS) {
        const created = await createRole(tx, seed);
        if (created) {
          createdCount += 1;
        }
      }
    });

    logger.info('[SEED] Role seeding completed', { createdCount });
  } catch (error) {
    logger.error('[SEED] Error seeding roles', {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  } finally {
    await prisma.$disconnect();
    logger.debug('[SEED] Prisma connection closed');
  }
};

if (require.main === module) {
  seedRolesIfNotExist()
    .then(() => {
      logger.info('[SEED] Role seeding finished successfully');
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
