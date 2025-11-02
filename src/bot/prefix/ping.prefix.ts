import { EmbedBuilder } from 'discord.js';

import type { PrefixCommandContext, PrefixCommandModule } from '@/bot/types';

async function handlePingSummary(ctx: PrefixCommandContext): Promise<void> {
  const { client, message } = ctx;
  const sent = Date.now();
  const reply = await message.reply('🏓 Calculating latency...');

  const roundTrip = Date.now() - sent;
  const ws = Math.round(client.ws.ping);

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle('🏓 Pong!')
    .addFields(
      { name: 'Round Trip', value: `${roundTrip}ms`, inline: true },
      { name: 'Gateway', value: `${ws}ms`, inline: true },
    )
    .setTimestamp();

  await reply.edit({ content: '', embeds: [embed] });
}

async function handlePingGateway(ctx: PrefixCommandContext): Promise<void> {
  const ws = Math.round(ctx.client.ws.ping);
  await ctx.message.reply(`🌐 Current gateway latency: **${ws}ms**`);
}

async function handlePingShard(ctx: PrefixCommandContext): Promise<void> {
  const { message, client } = ctx;
  const shardId = message.guild?.shardId ?? 0;
  const shardPing = client.ws.shards.get(shardId)?.ping ?? client.ws.ping;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🔢 Shard Information')
    .addFields(
      { name: 'Shard ID', value: shardId.toString(), inline: true },
      { name: 'Shard Ping', value: `${Math.round(shardPing)}ms`, inline: true },
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

const pingCommand: PrefixCommandModule = {
  name: 'ping',
  description: "Check the bot's latency and shard information.",
  usage: 'ping [summary|gateway|shard]',
  default: handlePingSummary,
  subcommands: [
    {
      name: 'summary',
      aliases: ['full'],
      description: 'Display round-trip and gateway latency.',
      usage: 'ping summary',
      handler: handlePingSummary,
    },
    {
      name: 'gateway',
      aliases: ['ws', 'api'],
      description: 'Show the raw websocket latency.',
      usage: 'ping gateway',
      handler: handlePingGateway,
    },
    {
      name: 'shard',
      description: 'Show shard-specific latency information.',
      usage: 'ping shard',
      handler: handlePingShard,
    },
  ],
};

export default pingCommand;
