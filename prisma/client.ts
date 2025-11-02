import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const PRISMA_DISABLED = process.env["DISABLE_PRISMA"] === "true";

function createStubClient() {
  const noopAsync = async () => undefined;

  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === "$disconnect" || prop === "$connect" || prop === "$on" || prop === "$use") {
          return noopAsync;
        }
        if (prop === "then" || prop === "catch" || prop === "finally") {
          return undefined;
        }
        return new Proxy(noopAsync, {
          apply: () => Promise.resolve(undefined),
          get: () => noopAsync
        });
      }
    }
  );
}

function initPrismaClient() {
  if (PRISMA_DISABLED) {
    console.warn('[Prisma] DISABLE_PRISMA is set. Returning stub client.');
    return createStubClient();
  }

  try {
    const { PrismaClient } = require('@prisma/client');
    return new PrismaClient({
      log: process.env['NODE_ENV'] === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
    });
  } catch (error) {
    console.warn('[Prisma] Failed to initialize PrismaClient. Falling back to stub.', error);
    return createStubClient();
  }
}

export const prisma = initPrismaClient();
export default prisma;
