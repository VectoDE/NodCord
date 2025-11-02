export interface BotConfig {
  token: string;
  clientId: string;
  devGuild?: string;
  prefix: string;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getBotConfig(): BotConfig {
  const token = process.env['DISCORD_BOT_TOKEN'] ?? process.env['BOT_TOKEN'];
  const clientId = process.env['DISCORD_CLIENT_ID'] ?? process.env['CLIENT_ID'];
  const prefix = process.env['DISCORD_BOT_PREFIX'] ?? '!';
  const devGuild = process.env['DISCORD_DEV_GUILD_ID'] ?? process.env['DEV_GUILD_ID'] ?? undefined;

  return {
    token: token ?? requiredEnv('DISCORD_BOT_TOKEN'),
    clientId: clientId ?? requiredEnv('DISCORD_CLIENT_ID'),
    prefix,
    ...(devGuild ? { devGuild } : {}),
  };
}
