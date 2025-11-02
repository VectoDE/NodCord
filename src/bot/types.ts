import type {
  ChatInputCommandInteraction,
  Client,
  ClientEvents,
  Collection,
  Message,
  PermissionResolvable,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export type SlashCommandData =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | SlashCommandOptionsOnlyBuilder;

export interface NodCordClient extends Client {
  commands: Collection<string, SlashCommandModule>;
  prefix: Collection<string, PrefixCommandModule>;
  commandArray: RESTPostAPIChatInputApplicationCommandsJSONBody[];
  handleEvents: (eventFiles: string[], basePath: string) => Promise<void>;
  handleCommands: (folders: string[], basePath: string) => Promise<void>;
  token: string | null;
}

export interface SlashCommandModule {
  data: SlashCommandData;
  execute: (
    interaction: ChatInputCommandInteraction,
    client: NodCordClient,
  ) => Promise<void> | void;
}

export interface PrefixCommandContext {
  client: NodCordClient;
  message: Message;
  args: string[];
  prefix: string;
  commandName: string;
  command: PrefixCommandModule;
}

export type PrefixCommandHandler = (ctx: PrefixCommandContext) => Promise<void> | void;

export interface PrefixSubcommand {
  name: string;
  description?: string;
  aliases?: string[];
  usage?: string;
  requiredPermissions?: PermissionResolvable[];
  handler: PrefixCommandHandler;
}

export interface PrefixSubcommandGroup {
  name: string;
  description?: string;
  aliases?: string[];
  subcommands: PrefixSubcommand[];
}

export interface PrefixCommandModule {
  name: string;
  description?: string;
  aliases?: string[];
  usage?: string;
  requiredPermissions?: PermissionResolvable[];
  default?: PrefixCommandHandler;
  subcommands?: PrefixSubcommand[];
  subcommandGroups?: PrefixSubcommandGroup[];
  onError?: (ctx: PrefixCommandContext, error: Error) => Promise<void> | void;
}

export interface BotEventModule<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (client: NodCordClient, ...args: ClientEvents[K]) => Promise<void> | void;
}
