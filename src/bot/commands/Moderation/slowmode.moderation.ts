import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { TextChannel } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const MAX_SLOWMODE_SECONDS = 21_600; // 6 hours, Discord API maximum

const enableSlowmodeCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('slowmode-enable')
    .setDescription('Enable slowmode in a channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((option) =>
      option
        .setName('duration')
        .setDescription('Slowmode duration in seconds.')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(MAX_SLOWMODE_SECONDS),
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to apply slowmode (defaults to current channel).')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({
        content: 'You do not have permission to manage channels.',
        ephemeral: true,
      });
      return;
    }

    const duration = interaction.options.getInteger('duration', true);
    const channel = interaction.options.getChannel('channel') ?? interaction.channel ?? null;

    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: 'Please choose a valid text channel.', ephemeral: true });
      return;
    }

    try {
      await (channel as TextChannel).setRateLimitPerUser(duration);
    } catch {
      await interaction.reply({
        content: 'I was unable to update the channel slowmode.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(
        `${channel} now has slowmode set to **${duration}** second${duration === 1 ? '' : 's'}.`,
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default enableSlowmodeCommand;
