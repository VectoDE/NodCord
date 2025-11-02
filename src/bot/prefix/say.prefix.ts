import {
  EmbedBuilder,
  PermissionsBitField,
  type GuildTextBasedChannel,
  type TextChannel,
  type User,
} from 'discord.js';

import type { PrefixCommandContext, PrefixCommandModule } from '@/bot/types';

function resolveChannelFromArgs(
  ctx: PrefixCommandContext,
  args: string[],
): { channel: GuildTextBasedChannel | null; remaining: string[] } {
  const { message } = ctx;
  const mentioned = message.mentions.channels.first() as TextChannel | undefined;
  if (mentioned && mentioned.isTextBased()) {
    const remaining = args.filter((part) => part !== `<#${mentioned.id}>`);
    return { channel: mentioned, remaining };
  }

  if (!message.guild) return { channel: null, remaining: args };
  if (!args[0]) return { channel: message.channel as GuildTextBasedChannel, remaining: args };

  const potentialId = args[0].replace(/[<#>]/g, '');
  if (/^\d{16,20}$/.test(potentialId)) {
    const targetChannel = message.guild.channels.cache.get(potentialId);
    if (targetChannel && targetChannel.isTextBased() && !targetChannel.isDMBased()) {
      return {
        channel: targetChannel as GuildTextBasedChannel,
        remaining: args.slice(1),
      };
    }
  }

  return { channel: message.channel as GuildTextBasedChannel, remaining: args };
}

async function resolveUser(
  ctx: PrefixCommandContext,
  identifier?: string,
): Promise<User | null> {
  if (!identifier) {
    const mentioned = ctx.message.mentions.users.first();
    return mentioned ?? null;
  }

  const cleaned = identifier.replace(/[<@!>]/g, '');

  try {
    return await ctx.client.users.fetch(cleaned);
  } catch {
    return null;
  }
}

async function handleSayText(ctx: PrefixCommandContext): Promise<void> {
  const { message } = ctx;
  if (!message.guild) return;

  const { channel, remaining } = resolveChannelFromArgs(ctx, ctx.args);
  if (!channel) {
    await message.reply('❌ I could not resolve that channel.');
    return;
  }

  const content = remaining.join(' ').trim();
  if (!content) {
    await message.reply('⚠️ Provide a message to send.');
    return;
  }

  await channel.send({ content });
  if (channel.id !== message.channel.id) {
    await message.reply(`✅ Message forwarded to <#${channel.id}>.`);
  } else {
    await message.delete().catch(() => undefined);
  }
}

async function handleSayEmbed(ctx: PrefixCommandContext): Promise<void> {
  const { message } = ctx;
  if (!message.guild) return;

  const { channel, remaining } = resolveChannelFromArgs(ctx, ctx.args);
  if (!channel) {
    await message.reply('❌ I could not resolve that channel.');
    return;
  }

  const joined = remaining.join(' ').trim();
  const [title, description] = joined.split('|').map((part) => part?.trim() ?? '');

  if (!title || !description) {
    await message.reply(
      '⚠️ Provide embed content as `title | description`. Optional color via `--color #hex`.',
    );
    return;
  }

  const colorMatch = description.match(/--color\s+(#[0-9a-f]{6})/i);
  const colorValue = colorMatch ? parseInt(colorMatch[1]!.replace('#', ''), 16) : 0x5865f2;
  const cleanedDescription = description.replace(/--color\s+#[0-9a-f]{6}/i, '').trim();

  const embed = new EmbedBuilder()
    .setColor(colorValue)
    .setTitle(title)
    .setDescription(cleanedDescription)
    .setFooter({ text: `Requested by ${message.author.tag}` })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
  await message.delete().catch(() => undefined);
}

async function handleSayDM(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const user = await resolveUser(ctx, args[0]);
  if (!user) {
    await message.reply('❌ Please mention or provide the ID of the user to DM.');
    return;
  }

  let remaining = [...args];
  if (message.mentions.users.has(user.id)) {
    remaining = remaining.filter((part) => !part.includes(user.id));
  } else {
    remaining = remaining.slice(1);
  }

  const content = remaining.join(' ').trim();
  if (!content) {
    await message.reply('⚠️ Provide a message to send to that user.');
    return;
  }

  try {
    await user.send({ content });
    await message.reply(`📬 Message delivered to **${user.tag}**.`);
  } catch {
    await message.reply('⚠️ I could not DM that user (their DMs might be closed).');
  }
}

const sayCommand: PrefixCommandModule = {
  name: 'say',
  description: 'Relay messages or embeds as the bot.',
  aliases: ['announce'],
  usage: 'say <message>\nsay embed <title | description>\nsay dm @user <message>',
  requiredPermissions: [PermissionsBitField.Flags.ManageMessages],
  default: handleSayText,
  subcommands: [
    {
      name: 'text',
      aliases: ['message', 'post'],
      description: 'Send a plain text message.',
      usage: 'say text [#channel] <message>',
      handler: handleSayText,
    },
    {
      name: 'embed',
      description: 'Send a styled embed.',
      usage: 'say embed [#channel] <title | description [--color #hex]>',
      handler: handleSayEmbed,
    },
    {
      name: 'dm',
      aliases: ['direct'],
      description: 'Direct message a user.',
      usage: 'say dm @user <message>',
      handler: handleSayDM,
    },
  ],
};

export default sayCommand;
