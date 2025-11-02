import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { NewsChannel, TextChannel } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const unlockCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a text channel for @everyone.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Choose the channel to unlock.')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(true),
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

    const channel = interaction.options.getChannel('channel', true);
    if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
      await interaction.reply({
        content: 'Only text channels can be unlocked with this command.',
        ephemeral: true,
      });
      return;
    }

    const guildChannel =
      channel.type === ChannelType.GuildText ? (channel as TextChannel) : (channel as NewsChannel);

    try {
      await guildChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null,
      });
    } catch {
      await interaction.reply({
        content: "I was unable to update that channel's permissions.",
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`🔓 ${guildChannel} is now unlocked for @everyone.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default unlockCommand;
