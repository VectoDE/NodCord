import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import {
  Client,
  Collection,
  EmbedBuilder,
  GatewayIntentBits,
  OAuth2Scopes,
  PermissionsBitField,
  type Guild,
  type GuildMember,
  type PermissionResolvable,
} from 'discord.js';
import dotenv from 'dotenv';

import logger from '@/services/logger.service';

import { getBotConfig } from '@/bot/config';
import type {
  NodCordClient,
  PrefixCommandContext,
  PrefixCommandModule,
  PrefixSubcommand,
  PrefixSubcommandGroup,
  SlashCommandModule,
} from '@/bot/types';
import registerCommandHandler from '@/bot/functions/commandHandler.function';
import registerEventHandler from '@/bot/functions/eventHandler.function';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODULE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts']);

function listFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter(
      (file) => MODULE_EXTENSIONS.has(path.extname(file).toLowerCase()) && !file.endsWith('.d.ts'),
    );
}

function listDirectories(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

function resolveImportUrl(basePath: string, fileName: string): string {
  const absolutePath = path.join(basePath, fileName);
  if (fs.existsSync(absolutePath)) {
    return pathToFileURL(absolutePath).href;
  }
  const jsFallback = absolutePath.replace(/\.ts$/i, '.js');
  return pathToFileURL(jsFallback).href;
}

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
}) as NodCordClient;

client.commands = new Collection<string, SlashCommandModule>();
client.prefix = new Collection<string, PrefixCommandModule>();
client.commandArray = [];

const botConfig = getBotConfig();

registerCommandHandler(client);
registerEventHandler(client);

async function loadPrefixCommands(): Promise<void> {
  const prefixDir = path.join(__dirname, 'prefix');
  const files = listFiles(prefixDir);

  for (const file of files) {
    try {
      const moduleUrl = resolveImportUrl(prefixDir, file);
      const mod = await import(moduleUrl);
      const command = (mod.default ?? mod) as PrefixCommandModule | undefined;
      if (!command?.name) {
        logger.warn('[BOT] Prefix command missing name', { file });
        continue;
      }
      const primaryKey = command.name.toLowerCase();
      client.prefix.set(primaryKey, command);

      if (Array.isArray(command.aliases)) {
        for (const alias of command.aliases) {
          const key = alias.toLowerCase();
          if (!client.prefix.has(key)) {
            client.prefix.set(key, command);
          }
        }
      }
    } catch (error) {
      logger.error('[BOT] Failed to register prefix command', { file, error });
    }
  }
}

function matchesName(entity: { name: string; aliases?: string[] }, value: string): boolean {
  const lower = value.toLowerCase();
  if (entity.name.toLowerCase() === lower) return true;
  return entity.aliases?.some((alias) => alias.toLowerCase() === lower) ?? false;
}

function formatPermissionName(raw: string): string {
  return raw
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function ensurePermissions(
  ctx: PrefixCommandContext,
  permissions?: PermissionResolvable[],
): Promise<boolean> {
  if (!permissions?.length) return true;
  const guild = ctx.message.guild;
  if (!guild) return false;

  const invoker = ctx.message.member;
  const missingInvoker = invoker?.permissions.missing(permissions) ?? [];
  if (missingInvoker.length > 0) {
    await ctx.message.reply({
      content: `❌ You are missing the following permissions: ${missingInvoker
        .map(formatPermissionName)
        .join(', ')}`,
    });
    return false;
  }

  const botMember = guild.members.me;
  const missingBot = botMember?.permissions.missing(permissions) ?? [];
  if (missingBot.length > 0) {
    await ctx.message.reply({
      content: `❌ I am missing the following permissions to execute this command: ${missingBot
        .map(formatPermissionName)
        .join(', ')}`,
    });
    return false;
  }

  return true;
}

async function sendCommandUsage(ctx: PrefixCommandContext): Promise<void> {
  const { command, message, prefix, commandName } = ctx;
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`Command: ${prefix}${commandName}`)
    .setDescription(command.description ?? 'No description provided.');

  if (command.usage) {
    embed.addFields({ name: 'Usage', value: `\`${prefix}${command.usage}\`` });
  }

  if (command.subcommands?.length) {
    const detail = command.subcommands
      .map((sub) => {
        const trigger = [`${prefix}${command.name} ${sub.name}`]
          .concat(sub.aliases?.map((alias) => `${prefix}${command.name} ${alias}`) ?? [])
          .join('\n');
        const description = sub.description ?? 'No description provided.';
        return `**${sub.name}** — ${description}\n${trigger}`;
      })
      .join('\n\n');
    embed.addFields({ name: 'Subcommands', value: detail });
  }

  if (command.subcommandGroups?.length) {
    for (const group of command.subcommandGroups) {
      const groupHeader = group.description ?? 'No description provided.';
      const options = group.subcommands
        .map((sub) => {
          const triggers = [`${prefix}${command.name} ${group.name} ${sub.name}`]
            .concat(
              sub.aliases?.map((alias) => `${prefix}${command.name} ${group.name} ${alias}`) ?? [],
            )
            .join('\n');
          return `• **${sub.name}** — ${sub.description ?? 'No description provided.'}\n${triggers}`;
        })
        .join('\n');
      embed.addFields({ name: `Group: ${group.name}`, value: `${groupHeader}\n${options}` });
    }
  }

  await message.reply({ embeds: [embed] });
}

async function sendGroupUsage(
  ctx: PrefixCommandContext,
  group: PrefixSubcommandGroup,
): Promise<void> {
  const { message, prefix, command } = ctx;
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`Group: ${group.name}`)
    .setDescription(group.description ?? 'No description provided.');

  const entries = group.subcommands.map((sub) => {
    const triggers = [`${prefix}${command.name} ${group.name} ${sub.name}`]
      .concat(
        sub.aliases?.map((alias) => `${prefix}${command.name} ${group.name} ${alias}`) ?? [],
      )
      .join('\n');
    return `• **${sub.name}** — ${sub.description ?? 'No description provided.'}\n${triggers}`;
  });

  embed.addFields({ name: 'Subcommands', value: entries.join('\n') });

  await message.reply({ embeds: [embed] });
}

async function executeSubcommand(
  ctx: PrefixCommandContext,
  subcommand: PrefixSubcommand,
  args: string[],
): Promise<void> {
  const nextCtx: PrefixCommandContext = { ...ctx, args };
  const canRun = await ensurePermissions(nextCtx, subcommand.requiredPermissions);
  if (!canRun) return;
  await subcommand.handler(nextCtx);
}

async function executePrefixCommand(
  command: PrefixCommandModule,
  ctx: PrefixCommandContext,
): Promise<void> {
  if (!(await ensurePermissions(ctx, command.requiredPermissions))) {
    return;
  }

  const hasStructuredSubcommands =
    (command.subcommands?.length ?? 0) > 0 || (command.subcommandGroups?.length ?? 0) > 0;

  if (!hasStructuredSubcommands) {
    if (command.default) {
      await command.default(ctx);
      return;
    }
    await sendCommandUsage(ctx);
    return;
  }

  if (ctx.args.length === 0) {
    if (command.default) {
      await command.default(ctx);
      return;
    }
    await sendCommandUsage(ctx);
    return;
  }

  const potentialSub = ctx.args[0] ?? '';
  const remainingArgs = ctx.args.slice(1);
  const group =
    command.subcommandGroups?.find((candidate) => matchesName(candidate, potentialSub)) ?? null;

  if (group) {
    if (remainingArgs.length === 0) {
      await sendGroupUsage(ctx, group);
      return;
    }
    const subName = remainingArgs[0] ?? '';
    const finalArgs = remainingArgs.slice(1);
    const sub =
      group.subcommands.find((candidate) => matchesName(candidate, subName)) ?? null;
    if (!sub) {
      await sendGroupUsage({ ...ctx, args: remainingArgs }, group);
      return;
    }
    await executeSubcommand(ctx, sub, finalArgs);
    return;
  }

  const sub =
    command.subcommands?.find((candidate) => matchesName(candidate, potentialSub)) ?? null;
  if (sub) {
    await executeSubcommand(ctx, sub, remainingArgs);
    return;
  }

  if (command.default) {
    await command.default(ctx);
    return;
  }

  await sendCommandUsage(ctx);
}

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  const prefix = botConfig.prefix ?? '!';
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();
  if (!commandName) return;

  const command = client.prefix.get(commandName);
  if (!command) return;

  try {
    const context: PrefixCommandContext = {
      client,
      message,
      args,
      prefix,
      commandName,
      command,
    };

    await executePrefixCommand(command, context);
  } catch (error) {
    logger.error('[BOT] Prefix command execution failed', { command: commandName, error });
    if (typeof command.onError === 'function') {
      await command.onError(
        {
          client,
          message,
          args,
          prefix,
          commandName,
          command,
        },
        error as Error,
      );
    } else {
      await message.reply('❌ An unexpected error occurred while executing that command.');
    }
  }
});

function ensureReady(): void {
  if (!client.isReady()) {
    throw new Error('Bot client is not ready. Call startBot() before requesting data.');
  }
}

async function gatherGuildMembers(guild: Guild): Promise<Collection<string, GuildMember>> {
  try {
    return await guild.members.fetch();
  } catch (error) {
    logger.warn('[BOT] Failed to fetch guild members', { guildId: guild.id, error });
    return new Collection();
  }
}

export interface BotInfo {
  token?: string;
  guild: string;
  guildId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  tag: string;
  id: string;
  botCreationDate: string;
  botStatus: string;
  botActivity: string;
  botJoinedAt: string | null;
  botPermissions: string;
  inviteLink?: string;
}

export interface MemberInfo {
  guild: string;
  guildId: string;
  username: string;
  tag: string;
  id: string;
  avatar: string | null;
  joinedAt: string | null;
  roles: string[];
  status: string;
}

export interface ServerInfo {
  id: string;
  name: string;
  memberCount: number;
  botCount: number;
  createdAt: string;
  icon: string | null;
}

export async function getBots(): Promise<{ botData: BotInfo[] }> {
  ensureReady();

  const botData: BotInfo[] = [];
  for (const guild of client.guilds.cache.values()) {
    const members = await gatherGuildMembers(guild);
    for (const member of members.values()) {
      if (!member.user.bot) continue;
      const presence = member.presence;
      const status = presence?.status ?? 'offline';
      const activityNames =
        presence?.activities
          ?.map((activity) => activity.name ?? '')
          .filter((name) => name.length > 0)
          .join(', ') ?? 'none';

      let inviteLink: string | undefined;
      try {
        inviteLink = await client.generateInvite({
          scopes: [OAuth2Scopes.Bot],
          permissions: [
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
          ],
        });
      } catch (error) {
        logger.warn('[BOT] Unable to generate invite link', { error });
      }

      botData.push({
        ...(client.token ? { token: client.token } : {}),
        guild: guild.name,
        guildId: guild.id,
        username: member.user.username,
        displayName: member.displayName,
        avatar: member.user.displayAvatarURL(),
        tag: member.user.tag,
        id: member.user.id,
        botCreationDate: new Date(member.user.createdTimestamp).toISOString(),
        botStatus: status,
        botActivity: activityNames,
        botJoinedAt: member.joinedAt ? member.joinedAt.toISOString() : null,
        botPermissions: member.permissions.toArray().join(', '),
        ...(inviteLink ? { inviteLink } : {}),
      });
    }
  }
  return { botData };
}

export async function getMembers(): Promise<{ memberData: MemberInfo[] }> {
  ensureReady();

  const memberData: MemberInfo[] = [];
  for (const guild of client.guilds.cache.values()) {
    const members = await gatherGuildMembers(guild);
    for (const member of members.values()) {
      if (member.user.bot) continue;
      const presence = member.presence;
      memberData.push({
        guild: guild.name,
        guildId: guild.id,
        username: member.user.username,
        tag: member.user.tag,
        id: member.user.id,
        avatar: member.user.displayAvatarURL(),
        joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null,
        roles: member.roles.cache.map((role) => role.name),
        status: presence?.status ?? 'offline',
      });
    }
  }

  return { memberData };
}

export async function getServers(): Promise<{ serverData: ServerInfo[] }> {
  ensureReady();

  const serverData: ServerInfo[] = [];
  for (const guild of client.guilds.cache.values()) {
    const members = await gatherGuildMembers(guild);
    const botCount = members.filter((member) => member.user.bot).size;
    serverData.push({
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount ?? members.size,
      botCount,
      createdAt: guild.createdAt.toISOString(),
      icon: guild.iconURL(),
    });
  }

  return { serverData };
}

export async function startBot(): Promise<void> {
  await loadPrefixCommands();

  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = listFiles(eventsPath);
  await client.handleEvents(eventFiles, eventsPath);

  const commandPath = path.join(__dirname, 'commands');
  const commandFolders = listDirectories(commandPath);
  await client.handleCommands(commandFolders, commandPath);

  await client.login(botConfig.token);
  client.token = botConfig.token;
  logger.info('[BOT] Login successful');
}

export default { client, startBot, getBots, getMembers, getServers };
