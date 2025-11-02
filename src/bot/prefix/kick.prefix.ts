import {
  EmbedBuilder,
  PermissionsBitField,
  type GuildMember,
  type GuildTextBasedChannel,
} from 'discord.js';

import type { PrefixCommandContext, PrefixCommandModule } from '@/bot/types';

const DEFAULT_REASON = 'No reason provided.';

function cleanIdentifier(input: string): string {
  return input.replace(/[<@!>#]/g, '');
}

async function resolveMember(
  ctx: PrefixCommandContext,
  identifier?: string,
): Promise<GuildMember | null> {
  const { message } = ctx;
  const guild = message.guild;
  if (!guild) return null;

  const mentioned = message.mentions.members?.first();
  if (mentioned) return mentioned;

  if (!identifier) return null;

  const cleaned = cleanIdentifier(identifier);

  try {
    return await guild.members.fetch(cleaned);
  } catch {
    return null;
  }
}

async function handleKickSingle(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const guild = message.guild;
  if (!guild) return;

  const channel = message.channel as GuildTextBasedChannel;
  const member = await resolveMember(ctx, args[0]);

  if (!member) {
    await channel.send('❌ Please specify a valid member to kick.');
    return;
  }

  if (member.id === message.author.id) {
    await channel.send("❌ You cannot kick yourself.");
    return;
  }

  if (!member.kickable) {
    await channel.send('❌ I do not have permission to kick that member.');
    return;
  }

  const reason = args.slice(1).join(' ') || DEFAULT_REASON;

  try {
    await member.kick(reason);
  } catch {
    await channel.send('⚠️ Something went wrong while trying to kick that member.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setDescription(`👢 **${member.user.tag}** has been kicked.`)
    .addFields({ name: 'Reason', value: reason })
    .setAuthor({
      name: message.member?.displayName ?? message.author.tag,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

async function handleKickPrune(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const guild = message.guild;
  if (!guild) return;

  if (!args[0]) {
    await message.reply('❌ Please provide the number of days (1-30).');
    return;
  }

  const days = Number.parseInt(args[0], 10);
  if (!Number.isFinite(days) || days < 1 || days > 30) {
    await message.reply('⚠️ The number of days must be between 1 and 30.');
    return;
  }

  const reason = args.slice(1).join(' ') || DEFAULT_REASON;

  let removed = 0;
  try {
    removed = await guild.members.prune({ days, reason, dry: false, count: true });
  } catch {
    await message.reply('⚠️ I was unable to prune inactive members. Do I have the correct permissions?');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xe67e22)
    .setDescription(`🧹 Pruned **${removed}** inactive member(s) not seen in the past ${days} day(s).`)
    .addFields({ name: 'Reason', value: reason })
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

const kickCommand: PrefixCommandModule = {
  name: 'kick',
  description: 'Kick a member or prune inactive members.',
  aliases: ['boot'],
  usage: 'kick <member|prune> ...',
  requiredPermissions: [PermissionsBitField.Flags.KickMembers],
  default: handleKickSingle,
  subcommands: [
    {
      name: 'member',
      aliases: ['user'],
      description: 'Kick a single member.',
      usage: 'kick member <member> [reason]',
      handler: handleKickSingle,
    },
    {
      name: 'prune',
      aliases: ['cleanup'],
      description: 'Prune inactive members by days.',
      usage: 'kick prune <days> [reason]',
      handler: handleKickPrune,
    },
  ],
};

export default kickCommand;
