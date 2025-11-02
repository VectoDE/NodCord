import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

import logger from '@/services/logger.service';

import type { BotEventModule, NodCordClient } from '@/bot/types';

function resolveImportUrl(filePath: string): string {
  if (fs.existsSync(filePath)) {
    return pathToFileURL(filePath).href;
  }
  const jsFallback = filePath.replace(/\.ts$/i, '.js');
  return pathToFileURL(jsFallback).href;
}

async function loadEventModule(filePath: string): Promise<BotEventModule | null> {
  const url = resolveImportUrl(filePath);
  const module = await import(url);
  const event: BotEventModule | undefined = module.default ?? module;
  return event ?? null;
}

export default function registerEventHandler(client: NodCordClient): void {
  client.handleEvents = async (eventFiles: string[], basePath: string) => {
    for (const file of eventFiles) {
      const absolutePath = path.join(basePath, file);
      const event = await loadEventModule(absolutePath);
      if (!event) {
        logger.warn('[BOT] Skipping event without default export', { file });
        continue;
      }

      const executor = async (...args: unknown[]) => {
        const run = event.execute as (
          client: NodCordClient,
          ...params: unknown[]
        ) => Promise<void> | void;
        await run(client, ...args);
      };

      if (event.once) {
        client.once(event.name, executor as (...args: unknown[]) => void);
      } else {
        client.on(event.name, executor as (...args: unknown[]) => void);
      }
    }
  };
}
