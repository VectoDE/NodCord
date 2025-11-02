import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { TextChannel } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const purgeCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete a number of recent messages from a text channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete (max 100).')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({
        content: 'You do not have permission to manage messages.',
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.channel;
    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: 'Messages can only be purged in text channels.',
        ephemeral: true,
      });
      return;
    }

    const amount = interaction.options.getInteger('amount', true);

    try {
      await (channel as TextChannel).bulkDelete(amount, true);
    } catch {
      await interaction.reply({
        content:
          'I was unable to delete those messages. Messages older than 14 days cannot be bulk deleted.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`Successfully deleted **${amount}** message${amount === 1 ? '' : 's'}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

export default purgeCommand;
