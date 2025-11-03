import { createRequire } from 'node:module';

import dotenv from 'dotenv';

import { createServer } from '@/api/app';
import { startBot } from '@/bot/index';
import { startClient } from '@/client/client';
import logger from '@/services/logger.service';

dotenv.config();

const require = createRequire(import.meta.url);
const packageInfo = require('../package.json') as { name: string };

async function bootstrap(): Promise<void> {
  try {
    await createServer();
    await startBot();
    await startClient();
    logger.info(`[Server] ${packageInfo.name} bootstrapped`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('[Server] Failed to start', { error: message });
    process.exit(1);
  }
}

void bootstrap();

