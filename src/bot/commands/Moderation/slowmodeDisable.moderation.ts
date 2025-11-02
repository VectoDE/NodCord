import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { TextChannel } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const disableSlowmodeCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('slowmode-disable')
    .setDescription('Disable slowmode in a channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Channel to update (defaults to the current channel).')
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

    const channel = interaction.options.getChannel('channel') ?? interaction.channel ?? null;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: 'Please choose a valid text channel.', ephemeral: true });
      return;
    }

    try {
      await (channel as TextChannel).setRateLimitPerUser(0);
    } catch {
      await interaction.reply({
        content: "I was unable to update that channel's slowmode.",
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`${channel} now has slowmode disabled.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default disableSlowmodeCommand;
