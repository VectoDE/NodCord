import {
  EmbedBuilder,
  PermissionsBitField,
  type GuildMember,
  type GuildTextBasedChannel,
} from 'discord.js';

import type { PrefixCommandContext, PrefixCommandModule } from '@/bot/types';

type DurationUnit = 's' | 'm' | 'h' | 'd';

const UNIT_MULTIPLIER: Record<DurationUnit, number> = {
  s: 1,
  m: 60,
  h: 3_600,
  d: 86_400,
};

const MAX_TIMEOUT_SECONDS = 28 * 24 * 3_600; // 28 days
const DEFAULT_REASON = 'No reason provided.';

function cleanIdentifier(input: string): string {
  return input.replace(/[<@!>#]/g, '');
}

function parseDuration(input: string): number | null {
  const trimmed = input.trim().toLowerCase();
  if (trimmed === '0' || trimmed === 'none') return 0;

  const match = trimmed.match(/^(\d+)([smhd])$/);
  if (!match) return null;

  const amount = Number.parseInt(match[1]!, 10);
  const unit = match[2] as DurationUnit;
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const seconds = amount * UNIT_MULTIPLIER[unit];
  if (seconds > MAX_TIMEOUT_SECONDS) return null;
  return seconds;
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

  try {
    const cleaned = cleanIdentifier(identifier);
    return await guild.members.fetch(cleaned);
  } catch {
    return null;
  }
}

async function handleMuteAdd(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const guild = message.guild;
  if (!guild) return;

  const channel = message.channel as GuildTextBasedChannel;
  const target = await resolveMember(ctx, args[0]);

  if (!target) {
    await channel.send('❌ Please specify a valid member to mute.');
    return;
  }

  if (target.id === message.author.id) {
    await channel.send("❌ You cannot mute yourself.");
    return;
  }

  if (!target.moderatable) {
    await channel.send('❌ I am unable to mute that member due to role hierarchy.');
    return;
  }

  if (!args[1]) {
    await channel.send('⚠️ Please provide a duration (e.g. `15m`, `2h`, `3d`).');
    return;
  }

  const parsedSeconds = parseDuration(args[1]);
  if (parsedSeconds === null) {
    await channel.send('⚠️ Invalid duration. Use formats like `30m`, `2h`, or `1d` (max 28 days).');
    return;
  }

  const reason = args.slice(2).join(' ') || DEFAULT_REASON;

  if (parsedSeconds === 0) {
    await target.timeout(null, reason);
    await channel.send(`✅ **${target.user.tag}** has been unmuted.`);
    return;
  }

  const durationMs = parsedSeconds * 1000;
  const expiresAt = new Date(Date.now() + durationMs);

  try {
    await target.timeout(durationMs, reason);
  } catch {
    await channel.send('⚠️ I could not apply that mute. Do I have the correct permissions?');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0xf97316)
    .setDescription(`🔇 Muted **${target.user.tag}** until <t:${Math.floor(expiresAt.getTime() / 1000)}:R>.`)
    .addFields({ name: 'Reason', value: reason })
    .setTimestamp();

  await channel.send({ embeds: [embed] });

  const dmEmbed = new EmbedBuilder()
    .setColor(0xf97316)
    .setDescription(
      `You have been muted in **${guild.name}** until <t:${Math.floor(
        expiresAt.getTime() / 1000,
      )}:R>.\nReason: ${reason}`,
    )
    .setTimestamp();

  await target.send({ embeds: [dmEmbed] }).catch(() => undefined);
}

async function handleMuteRemove(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const guild = message.guild;
  if (!guild) return;

  const channel = message.channel as GuildTextBasedChannel;
  const target = await resolveMember(ctx, args[0]);
  if (!target) {
    await channel.send('❌ Please specify a valid member to unmute.');
    return;
  }

  const reason = args.slice(1).join(' ') || 'Manual unmute.';

  try {
    await target.timeout(null, reason);
  } catch {
    await channel.send('⚠️ I was unable to remove that mute.');
    return;
  }

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setDescription(`✅ **${target.user.tag}** has been unmuted.`)
    .addFields({ name: 'Reason', value: reason })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

async function handleMuteStatus(ctx: PrefixCommandContext): Promise<void> {
  const { message, args } = ctx;
  const guild = message.guild;
  if (!guild) return;

  const target = await resolveMember(ctx, args[0]);
  if (!target) {
    await message.reply('❌ Please specify a valid member.');
    return;
  }

  const until = target.communicationDisabledUntilTimestamp;
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setAuthor({ name: target.user.tag, iconURL: target.displayAvatarURL() })
    .setDescription(
      until
        ? `🔇 Muted until <t:${Math.floor(until / 1000)}:F> (<t:${Math.floor(until / 1000)}:R>).`
        : '🔊 This member is not currently muted.',
    )
    .setTimestamp();

  await message.reply({ embeds: [embed] });
}

const muteCommand: PrefixCommandModule = {
  name: 'mute',
  description: 'Timeout members (mute/unmute/status).',
  usage: 'mute <add|remove|status> ...',
  requiredPermissions: [PermissionsBitField.Flags.ModerateMembers],
  default: handleMuteAdd,
  subcommands: [
    {
      name: 'add',
      aliases: ['timeout'],
      description: 'Apply a timeout to a member.',
      usage: 'mute add <member> <duration> [reason]',
      handler: handleMuteAdd,
    },
    {
      name: 'remove',
      aliases: ['unmute', 'clear'],
      description: 'Remove a timeout from a member.',
      usage: 'mute remove <member> [reason]',
      handler: handleMuteRemove,
    },
    {
      name: 'status',
      description: 'Check mute status for a member.',
      usage: 'mute status <member>',
      handler: handleMuteStatus,
    },
  ],
};

export default muteCommand;
export { handleMuteRemove };
