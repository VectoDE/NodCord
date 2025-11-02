import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { User } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const unbanCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Remove a server ban for a user.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('The user to unban.').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for lifting the ban.').setRequired(false),
    ),
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

    const targetUser: User = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason')?.trim() || 'No reason provided.';

    const existingBan = await interaction.guild.bans.fetch(targetUser.id).catch(() => null);
    if (!existingBan) {
      await interaction.reply({
        content: `${targetUser.tag} is not currently banned from this server.`,
        ephemeral: true,
      });
      return;
    }

    try {
      await interaction.guild.bans.remove(targetUser.id, reason);
    } catch {
      await interaction.reply({ content: 'I was unable to lift that ban.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`Unbanned **${targetUser.tag}**.`)
      .addFields({ name: 'Reason', value: reason })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default unbanCommand;
