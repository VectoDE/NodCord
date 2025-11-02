import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const unbanAllCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('unban-all')
    .setDescription('Remove bans for every user currently banned from the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({
        content: 'You do not have permission to manage bans.',
        ephemeral: true,
      });
      return;
    }

    const bans = await interaction.guild.bans.fetch();
    if (bans.size === 0) {
      await interaction.reply({
        content: 'There are no users banned from this server.',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({ content: 'Unbanning all users...', ephemeral: true });

    let successCount = 0;
    for (const [userId] of bans) {
      try {
        await interaction.guild.bans.remove(userId, 'Mass unban initiated by command.');
        successCount += 1;
      } catch {
        // continue attempting to unban remaining users
      }
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`Removed bans for **${successCount}** user${successCount === 1 ? '' : 's'}.`)
      .setTimestamp();

    await interaction.editReply({ content: '', embeds: [embed] });
  },
};

export default unbanAllCommand;
