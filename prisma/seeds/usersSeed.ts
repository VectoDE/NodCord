/**
 * @fileoverview
 * Prisma seeder for core user accounts.
 * - Idempotent (skips existing records)
 * - Uses transactions for atomic operations
 * - Supports environment-based credential overrides
 */

import {
  Prisma,
  PrismaClient,
  SocialLinkType,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcrypt';
import logger from '../../src/services/logger.service';

const prisma = new PrismaClient();

type SocialLinkSeed = {
  type: SocialLinkType;
  url: string;
};

type UserSeedDefinition = {
  profilePicture?: string | null;
  fullname: string;
  username: string;
  email: string;
  role: UserRole;
  bio?: string;
  isVerified?: boolean;
  isAuthenticated?: boolean;
  isBetaTester?: boolean;
  termsAccepted?: boolean;
  /**
   * ISO timestamp string is easier to serialize in constants.
   */
  termsAcceptedAt?: string;
  /**
   * Environment variable name that should contain the plaintext password.
   */
  passwordEnvVar?: string;
  /**
   * Optional per-user fallback password (last resort).
   */
  passwordFallback?: string;
  socialLinks?: SocialLinkSeed[];
};

const DEFAULT_TERMS_ACCEPTED_AT = '2024-01-01T00:00:00.000Z';
const DEFAULT_PASSWORD_FALLBACK =
  process.env['SEED_DEFAULT_USER_PASSWORD'] ?? 'ChangeMe123!';
const RAW_BCRYPT_COST = Number(process.env['SEED_BCRYPT_COST'] ?? '12');
const BCRYPT_COST =
  Number.isInteger(RAW_BCRYPT_COST) && RAW_BCRYPT_COST >= 4 && RAW_BCRYPT_COST <= 14
    ? RAW_BCRYPT_COST
    : 12;

if (RAW_BCRYPT_COST !== BCRYPT_COST) {
  logger.warn(
    `[SEED] Invalid SEED_BCRYPT_COST value (${process.env['SEED_BCRYPT_COST']}); falling back to ${BCRYPT_COST}`,
  );
}

const USER_SEEDS: ReadonlyArray<UserSeedDefinition> = [
  {
    fullname: 'Platform Administrator',
    username: process.env['SEED_ADMIN_USERNAME'] ?? 'admin',
    email: process.env['SEED_ADMIN_EMAIL'] ?? 'admin@example.com',
    role: UserRole.ADMIN,
    bio: 'Primary platform administrator account.',
    isVerified: true,
    isBetaTester: true,
    termsAccepted: true,
    termsAcceptedAt: DEFAULT_TERMS_ACCEPTED_AT,
    passwordEnvVar: 'SEED_ADMIN_PASSWORD',
    socialLinks: [
      {
        type: SocialLinkType.LINKEDIN,
        url: 'https://www.linkedin.com/in/platform-admin',
      },
      {
        type: SocialLinkType.GITHUB,
        url: 'https://github.com/example-admin',
      },
    ],
  },
  {
    fullname: 'Community Moderator',
    username: process.env['SEED_MODERATOR_USERNAME'] ?? 'moderator',
    email: process.env['SEED_MODERATOR_EMAIL'] ?? 'moderator@example.com',
    role: UserRole.MODERATOR,
    bio: 'Handles community moderation and escalation tasks.',
    isVerified: true,
    isBetaTester: true,
    termsAccepted: true,
    termsAcceptedAt: DEFAULT_TERMS_ACCEPTED_AT,
    passwordEnvVar: 'SEED_MODERATOR_PASSWORD',
    socialLinks: [
      {
        type: SocialLinkType.TWITTER,
        url: 'https://twitter.com/example-moderator',
      },
      {
        type: SocialLinkType.DISCORD,
        url: 'https://discord.com/users/moderator',
      },
    ],
  },
  {
    fullname: 'Reference User',
    username: process.env['SEED_USER_USERNAME'] ?? 'user',
    email: process.env['SEED_USER_EMAIL'] ?? 'user@example.com',
    role: UserRole.USER,
    bio: 'Baseline user account for smoke tests and onboarding flows.',
    isVerified: true,
    isBetaTester: true,
    termsAccepted: true,
    termsAcceptedAt: DEFAULT_TERMS_ACCEPTED_AT,
    passwordEnvVar: 'SEED_USER_PASSWORD',
    socialLinks: [
      {
        type: SocialLinkType.GOOGLE,
        url: 'https://profiles.google.com/example-user',
      },
      {
        type: SocialLinkType.FACEBOOK,
        url: 'https://facebook.com/example.user',
      },
    ],
  },
] as const;

const resolvePassword = (seed: UserSeedDefinition): string => {
  const envPassword = seed.passwordEnvVar
    ? process.env[seed.passwordEnvVar]
    : undefined;

  if (envPassword && envPassword.length > 0) {
    return envPassword;
  }

  if (seed.passwordFallback && seed.passwordFallback.length > 0) {
    logger.warn(
      `[SEED] Using fallback password for ${seed.email}; override via ${seed.passwordEnvVar ?? 'SEED_DEFAULT_USER_PASSWORD'} for production environments.`,
    );
    return seed.passwordFallback;
  }

  if (DEFAULT_PASSWORD_FALLBACK && DEFAULT_PASSWORD_FALLBACK.length > 0) {
    logger.warn(
      `[SEED] Using global fallback password for ${seed.email}; set environment variable ${
        seed.passwordEnvVar ?? 'SEED_DEFAULT_USER_PASSWORD'
      } to customise.`,
    );
    return DEFAULT_PASSWORD_FALLBACK;
  }

  throw new Error(
    `No password configured for seed user ${seed.email}. Please set ${seed.passwordEnvVar ?? 'SEED_DEFAULT_USER_PASSWORD'}.`,
  );
};

const normaliseUsername = (username: string): string =>
  username.trim().toLowerCase();

const uniqueSocialLinks = (
  socialLinks: SocialLinkSeed[] = [],
): SocialLinkSeed[] => {
  const seen = new Set<SocialLinkType>();
  const result: SocialLinkSeed[] = [];

  for (const link of socialLinks) {
    if (seen.has(link.type)) {
      continue;
    }

    seen.add(link.type);
    result.push(link);
  }

  return result;
};

const createUser = async (
  tx: Prisma.TransactionClient,
  seed: UserSeedDefinition,
): Promise<boolean> => {
  const existing = await tx.user.findUnique({
    where: { email: seed.email },
  });

  if (existing) {
    logger.info('[SEED] User already exists, skipping', {
      email: seed.email,
      userId: existing.id,
    });
    return false;
  }

  const passwordPlain = resolvePassword(seed);
  const hashedPassword = await bcrypt.hash(passwordPlain, BCRYPT_COST);
  const socialLinks = uniqueSocialLinks(seed.socialLinks);

  const baseData: Prisma.UserCreateInput = {
    profilePicture: seed.profilePicture ?? null,
    fullname: seed.fullname,
    username: normaliseUsername(seed.username),
    email: seed.email,
    password: hashedPassword,
    role: seed.role,
    bio: seed.bio ?? '',
    isVerified: seed.isVerified ?? false,
    isAuthenticated: seed.isAuthenticated ?? false,
    isBetaTester: seed.isBetaTester ?? false,
    termsAccepted: seed.termsAccepted ?? false,
    termsAcceptedAt: seed.termsAccepted
      ? new Date(seed.termsAcceptedAt ?? DEFAULT_TERMS_ACCEPTED_AT)
      : null,
  };

  const relationData =
    socialLinks.length > 0
      ? {
          socialLinkRecords: {
            create: socialLinks.map((link) => ({
              type: link.type,
              url: link.url,
            })),
          },
        }
      : {};

  await tx.user.create({
    data: {
      ...baseData,
      ...relationData,
    },
  });

  logger.info('[SEED] User created', { email: seed.email });
  return true;
};

export const seedUsersIfNotExist = async (): Promise<void> => {
  logger.info('[SEED] Starting user seeding process');

  try {
    let createdCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const seed of USER_SEEDS) {
        const created = await createUser(tx, seed);
        if (created) {
          createdCount += 1;
        }
      }
    });

    logger.info('[SEED] User seeding completed', { createdCount });
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

if (require.main === module) {
  seedUsersIfNotExist()
    .then(() => {
      logger.info('[SEED] User seeding finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('[SEED] User seeding failed', {
        message: (error as Error).message,
        stack: (error as Error).stack,
      });
      process.exit(1);
    });
}
