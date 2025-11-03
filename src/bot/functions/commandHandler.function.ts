import { REST, Routes } from 'discord.js';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

import logger from '@/services/logger.service';

import { getBotConfig } from '@/bot/config';
import type { NodCordClient, SlashCommandModule } from '@/bot/types';

const botConfig = getBotConfig();

function resolveImportUrl(filePath: string): string {
  if (fs.existsSync(filePath)) {
    return pathToFileURL(filePath).href;
  }
  const jsFallback = filePath.replace(/\.ts$/i, '.js');
  return pathToFileURL(jsFallback).href;
}

async function loadCommandFile(filePath: string): Promise<SlashCommandModule | null> {
  const url = resolveImportUrl(filePath);
  const module = await import(url);
  const command: SlashCommandModule | undefined = module.default ?? module;
  return command ?? null;
}

export default function registerCommandHandler(client: NodCordClient): void {
  client.handleCommands = async (folders: string[], basePath: string) => {
    client.commandArray = [];

    for (const folder of folders) {
      const folderPath = path.join(basePath, folder);
      const entries = await fsPromises.readdir(folderPath);
      const commandFiles = entries.filter(
        (file) => (file.endsWith('.js') || file.endsWith('.ts')) && !file.endsWith('.d.ts'),
      );

      for (const file of commandFiles) {
        const commandPath = path.join(folderPath, file);
        const command = await loadCommandFile(commandPath);
        if (!command) {
          logger.warn('[BOT] Skipping command without default export', { commandPath });
          continue;
        }

        const name = command.data?.name;
        if (!name) {
          logger.warn('[BOT] Command data missing name', { commandPath });
          continue;
        }

        client.commands.set(name, command);
        client.commandArray.push(command.data.toJSON());
      }
    }

    const rest = new REST({ version: '10' }).setToken(botConfig.token);

    const readOnlyKeys = new Set(['id', 'application_id', 'version', 'guild_id']);

    const sanitizePayload = (input: unknown): Record<string, unknown> => {
      if (!input || typeof input !== 'object') return {};

      const entries = Object.entries(input as Record<string, unknown>)
        .filter(([key, value]) => !readOnlyKeys.has(key) && value !== undefined)
        .sort(([a], [b]) => a.localeCompare(b));

      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of entries) {
        if (Array.isArray(value)) {
          sanitized[key] = value.map((item) =>
            typeof item === 'object' && item !== null ? sanitizePayload(item) : item,
          );
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = sanitizePayload(value);
        } else {
          sanitized[key] = value;
        }
      }

      return sanitized;
    };

    const serialize = (payload: Record<string, unknown>): string => JSON.stringify(payload);

    try {
      const existing = (await rest.get(
        Routes.applicationCommands(botConfig.clientId),
      )) as Array<Record<string, unknown>>;

      const merged = new Map<string, Record<string, unknown>>();
      const untouchedKeys = new Set<string>();

      for (const command of existing) {
        const name = typeof command['name'] === 'string' ? (command['name'] as string) : undefined;
        if (!name) continue;
        const type = (typeof command['type'] === 'number' ? (command['type'] as number) : 1) ?? 1;
        const key = `${name}:${type}`;
        const sanitized = sanitizePayload(command);
        merged.set(key, sanitized);
        untouchedKeys.add(key);
      }

      let created = 0;
      let updated = 0;

      for (const command of client.commandArray) {
        const key = `${command.name}:${command.type ?? 1}`;
        const payload = sanitizePayload(command as unknown as Record<string, unknown>);
        const previous = merged.get(key);

        if (!previous) {
          created += 1;
        } else if (serialize(previous) !== serialize(payload)) {
          updated += 1;
        }

        merged.set(key, payload);
        untouchedKeys.delete(key);
      }

      const finalPayload = Array.from(merged.values());

      await rest.put(Routes.applicationCommands(botConfig.clientId), { body: finalPayload });

      logger.info('[BOT] Slash commands synced', {
        created,
        updated,
        untouched: untouchedKeys.size,
        totalPublished: finalPayload.length,
      });
    } catch (error) {
      logger.error('[BOT] Failed to refresh slash commands', { error });
    }
  };
}
