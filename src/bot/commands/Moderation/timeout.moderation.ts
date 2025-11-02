import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { GuildMember, User } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

type DurationUnit = 's' | 'm' | 'h' | 'd';

const UNIT_MULTIPLIER: Record<DurationUnit, number> = {
  s: 1,
  m: 60,
  h: 3_600,
  d: 86_400,
};

const MAX_TIMEOUT_SECONDS = 28 * 24 * 3_600; // Discord limit (28 days)

function parseDuration(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  const match = trimmed.match(/^(\d+)([smhd])$/);
  if (!match) return null;

  const rawAmount = match[1] ?? '';
  const unitRaw = match[2] ?? '';
  if (!rawAmount || !unitRaw) {
    return null;
  }

  const unit = unitRaw as DurationUnit;
  const amount = Number.parseInt(rawAmount, 10);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const multiplier = UNIT_MULTIPLIER[unit];
  const seconds = amount * multiplier;
  if (!Number.isFinite(seconds) || seconds > MAX_TIMEOUT_SECONDS) {
    return null;
  }

  return seconds;
}

const timeoutCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member for a limited period.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('The member to timeout.').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('duration')
        .setDescription('Duration (e.g. 30m, 2h, 1d). Maximum 28 days.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for the timeout.').setRequired(false),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
      await interaction.reply({
        content: 'You do not have permission to timeout members.',
        ephemeral: true,
      });
      return;
    }

    const targetUser: User = interaction.options.getUser('user', true);
    const durationInput = interaction.options.getString('duration', true);
    const timeoutSeconds = parseDuration(durationInput);

    if (timeoutSeconds === null) {
      await interaction.reply({
        content: 'Invalid duration. Use formats like `30m`, `2h`, or `1d` (maximum 28 days).',
        ephemeral: true,
      });
      return;
    }

    const reason = interaction.options.getString('reason')?.trim() || 'No reason provided.';

    let targetMember: GuildMember;
    try {
      targetMember = await interaction.guild.members.fetch(targetUser.id);
    } catch {
      await interaction.reply({
        content: 'I could not find that member in this server.',
        ephemeral: true,
      });
      return;
    }

    if (!targetMember.moderatable) {
      await interaction.reply({
        content: 'I cannot timeout that member due to role hierarchy.',
        ephemeral: true,
      });
      return;
    }

    const durationMs = timeoutSeconds * 1000;
    const expiryTimestamp = new Date(Date.now() + durationMs);

    const dmEmbed = new EmbedBuilder()
      .setColor('Red')
      .setDescription(
        `You have been timed out in **${interaction.guild.name}** until <t:${Math.floor(
          expiryTimestamp.getTime() / 1000,
        )}:R>.\nReason: ${reason}`,
      );

    await targetUser.send({ embeds: [dmEmbed] }).catch(() => undefined);

    try {
      await targetMember.timeout(durationMs, reason);
    } catch {
      await interaction.reply({ content: 'I was unable to apply that timeout.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`Timed out **${targetUser.tag}** for ${durationInput}.`)
      .addFields({ name: 'Reason', value: reason })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default timeoutCommand;
