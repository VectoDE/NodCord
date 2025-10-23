import { PrismaClient, Prisma } from '@prisma/client';

type RuntimeEnvironment = 'production' | 'development' | 'test' | 'staging';

type QueryLoggingPreference = 'none' | 'stdout' | 'event' | 'both';

const KNOWN_ENVIRONMENTS: RuntimeEnvironment[] = [
  'production',
  'development',
  'test',
  'staging',
];

const normalizeNodeEnv = (value: string | undefined): RuntimeEnvironment => {
  if (!value) {
    return 'development';
  }

  const normalized = value.toLowerCase();

  return KNOWN_ENVIRONMENTS.includes(normalized as RuntimeEnvironment)
    ? (normalized as RuntimeEnvironment)
    : 'development';
};

const runtimeEnv = normalizeNodeEnv(process.env.NODE_ENV);

const resolveQueryLoggingPreference = (
  env: RuntimeEnvironment,
  rawValue: string | undefined,
): QueryLoggingPreference => {
  if (!rawValue) {
    return env === 'development' ? 'both' : 'none';
  }

  switch (rawValue.toLowerCase()) {
    case 'true':
    case 'stdout':
      return 'stdout';
    case 'event':
      return 'event';
    case 'both':
      return 'both';
    case 'false':
    case 'none':
      return 'none';
    default:
      return 'stdout';
  }
};

const queryLoggingPreference = resolveQueryLoggingPreference(
  runtimeEnv,
  process.env.PRISMA_LOG_QUERIES,
);

const resolveDatabaseUrl = (env: RuntimeEnvironment): string => {
  const urlByEnvironment: Record<RuntimeEnvironment, string | undefined> = {
    production:
      process.env.DATABASE_URL ?? process.env.PROD_DATABASE_URL ?? undefined,
    development:
      process.env.DEV_DATABASE_URL ?? process.env.DATABASE_URL ?? undefined,
    test: process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? undefined,
    staging:
      process.env.STAGING_DATABASE_URL ?? process.env.DATABASE_URL ?? undefined,
  };

  const url = urlByEnvironment[env];

  if (!url) {
    throw new Error(
      `Database URL is not configured for the "${env}" environment. ` +
        'Please set the appropriate environment variable (e.g. DATABASE_URL).',
    );
  }

  return url;
};

const buildLogConfiguration = (
  env: RuntimeEnvironment,
  preference: QueryLoggingPreference,
): (Prisma.LogLevel | Prisma.LogDefinition)[] => {
  const logConfig: (Prisma.LogLevel | Prisma.LogDefinition)[] = ['error'];

  if (env !== 'production') {
    logConfig.push('warn');
  }

  if (env === 'development' || env === 'staging') {
    logConfig.push('info');
  }

  if (preference === 'stdout' || preference === 'both') {
    logConfig.push({ emit: 'stdout', level: 'query' });
  }

  if ((preference === 'event' || preference === 'both') && env !== 'production') {
    logConfig.push({ emit: 'event', level: 'query' });
  }

  return logConfig;
};

const logConfiguration = buildLogConfiguration(runtimeEnv, queryLoggingPreference);

const createPrismaClient = (): PrismaClient => {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: resolveDatabaseUrl(runtimeEnv),
      },
    },
    errorFormat: runtimeEnv === 'production' ? 'minimal' : 'pretty',
    log: logConfiguration,
  });

  const shouldAttachQueryListener = logConfiguration.some(
    (entry) => typeof entry !== 'string' && entry.emit === 'event' && entry.level === 'query',
  );

  if (shouldAttachQueryListener) {
    const threshold = Number(process.env.PRISMA_SLOW_QUERY_THRESHOLD_MS ?? '250');

    client.$on('query', (event) => {
      if (event.duration >= threshold) {
        console.warn(
          `[Prisma][${runtimeEnv}] Slow query (${event.duration}ms): ${event.query}`,
        );
      }
    });
  }

  return client;
};

const shouldReuseClient = runtimeEnv !== 'test';

interface GlobalPrismaHolder {
  __prisma?: PrismaClient;
}

const globalWithPrisma = globalThis as typeof globalThis & GlobalPrismaHolder;

export const prisma: PrismaClient =
  shouldReuseClient && globalWithPrisma.__prisma
    ? globalWithPrisma.__prisma
    : createPrismaClient();

if (shouldReuseClient) {
  globalWithPrisma.__prisma = prisma;
}

if (runtimeEnv === 'production') {
  process.once('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
