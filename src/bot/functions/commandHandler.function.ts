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

    try {
      logger.info('[BOT] Refreshing application (/) commands');
      await rest.put(Routes.applicationCommands(botConfig.clientId), {
        body: client.commandArray,
      });
      logger.info('[BOT] Successfully reloaded application (/) commands');
    } catch (error) {
      logger.error('[BOT] Failed to refresh slash commands', { error });
    }
  };
}
