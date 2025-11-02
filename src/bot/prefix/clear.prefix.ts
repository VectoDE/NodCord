import {
  EmbedBuilder,
  PermissionsBitField,
  type GuildTextBasedChannel,
  type Message,
  type User,
} from 'discord.js';

import type { PrefixCommandContext, PrefixCommandModule } from '@/bot/types';

function ensureTextChannel(message: Message): GuildTextBasedChannel | null {
  if (!message.guild) return null;
  if (!message.channel.isTextBased() || message.channel.isDMBased()) return null;
  return message.channel as GuildTextBasedChannel;
}

function parseAmount(input: string | undefined): number | null {
  if (!input) return null;
  const value = Number.parseInt(input, 10);
  if (!Number.isInteger(value) || value <= 0 || value > 100) return null;
  return value;
}

async function sendResultEmbed(
  channel: GuildTextBasedChannel,
  title: string,
  description: string,
): Promise<void> {
  const embed = new EmbedBuilder().setColor(0x2b2d31).setTitle(title).setDescription(description);
  const confirmation = await channel.send({ embeds: [embed] });
  setTimeout(() => confirmation.delete().catch(() => undefined), 5000);
}

async function handleClearSimple(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const textChannel = ensureTextChannel(message);
  if (!textChannel) {
    await message.reply('❌ This command can only be used in a guild text channel.');
    return;
  }

  const amount = parseAmount(args[0]);
  if (amount === null) {
    await message.reply('⚠️ Provide an amount between 1 and 100 messages to delete.');
    return;
  }

  try {
    const deleted = await textChannel.bulkDelete(amount, true);
    await sendResultEmbed(
      textChannel,
      '🧹 Messages Cleared',
      `Removed **${deleted.size}** message(s) from this channel.`,
    );
  } catch {
    await message.reply('⚠️ I could not delete those messages (they may be older than 14 days).');
  }
}

async function handleClearBots(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const textChannel = ensureTextChannel(message);
  if (!textChannel) {
    await message.reply('❌ This command can only be used in a guild text channel.');
    return;
  }

  const amount = parseAmount(args[0]) ?? 25;

  const fetched = await textChannel.messages.fetch({ limit: 100 });
  const botsOnly = fetched.filter((msg) => msg.author.bot).first(amount);

  if (botsOnly.length === 0) {
    await message.reply('🤖 No recent bot messages found to remove.');
    return;
  }

  await textChannel.bulkDelete(botsOnly, true).catch(() => undefined);
  await sendResultEmbed(
    textChannel,
    '🤖 Bot Messages Cleared',
    `Removed **${botsOnly.length}** bot message(s).`,
  );
}

async function handleClearUser(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const textChannel = ensureTextChannel(message);
  if (!textChannel) {
    await message.reply('❌ This command can only be used in a guild text channel.');
    return;
  }

  const targetUser: User | undefined = message.mentions.users.first();
  if (!targetUser && !args[0]) {
    await message.reply('⚠️ Mention the user whose messages you want to delete.');
    return;
  }

  const amount = parseAmount(args[1]) ?? 25;
  let user = targetUser;

  if (!user && args[0]) {
    const cleaned = args[0].replace(/[<@!>#]/g, '');
    try {
      user = await message.client.users.fetch(cleaned);
    } catch {
      await message.reply('❌ I could not resolve that user.');
      return;
    }
  }

  if (!user) {
    await message.reply('❌ Please mention a valid user.');
    return;
  }

  const fetched = await textChannel.messages.fetch({ limit: 100 });
  const byUser = fetched.filter((msg) => msg.author.id === user!.id).first(amount);

  if (byUser.length === 0) {
    await message.reply('ℹ️ No messages from that user were found in the recent history.');
    return;
  }

  await textChannel.bulkDelete(byUser, true).catch(() => undefined);
  await sendResultEmbed(
    textChannel,
    '👤 User Messages Cleared',
    `Removed **${byUser.length}** message(s) from **${user.tag}**.`,
  );
}

async function handleClearAttachments(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const textChannel = ensureTextChannel(message);
  if (!textChannel) {
    await message.reply('❌ This command can only be used in a guild text channel.');
    return;
  }

  const amount = parseAmount(args[0]) ?? 25;
  const fetched = await textChannel.messages.fetch({ limit: 100 });
  const attachments = fetched.filter((msg) => msg.attachments.size > 0).first(amount);

  if (attachments.length === 0) {
    await message.reply('📎 No recent messages with attachments were found.');
    return;
  }

  await textChannel.bulkDelete(attachments, true).catch(() => undefined);
  await sendResultEmbed(
    textChannel,
    '📎 Attachments Cleared',
    `Removed **${attachments.length}** message(s) containing attachments.`,
  );
}

const clearCommand: PrefixCommandModule = {
  name: 'clear',
  description: 'Bulk delete messages with advanced filtering.',
  aliases: ['purge'],
  usage: 'clear <amount>\nclear bots [amount]\nclear user @user [amount]\nclear attachments [amount]',
  requiredPermissions: [PermissionsBitField.Flags.ManageMessages],
  default: handleClearSimple,
  subcommands: [
    {
      name: 'messages',
      aliases: ['text', 'simple'],
      description: 'Delete the last N messages.',
      usage: 'clear messages <amount>',
      handler: handleClearSimple,
    },
    {
      name: 'bots',
      description: 'Delete messages sent by bots.',
      usage: 'clear bots [amount]',
      handler: handleClearBots,
    },
    {
      name: 'user',
      aliases: ['member'],
      description: 'Delete messages from a specific user.',
      usage: 'clear user @user [amount]',
      handler: handleClearUser,
    },
    {
      name: 'attachments',
      aliases: ['files', 'media'],
      description: 'Delete messages that contain attachments.',
      usage: 'clear attachments [amount]',
      handler: handleClearAttachments,
    },
  ],
};

export default clearCommand;
