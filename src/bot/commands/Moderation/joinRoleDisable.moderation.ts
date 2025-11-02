import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import prisma from '@/services/prisma.service';

import type { SlashCommandModule } from '@/bot/types';

const joinRoleDisableCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('joinrole-disable')
    .setDescription('Disable the automatic join role.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({
        content: 'You do not have permission to manage roles.',
        ephemeral: true,
      });
      return;
    }

    const result = await prisma.joinRole.updateMany({
      where: { guild: interaction.guild.id, isActive: true },
      data: { isActive: false },
    });

    if (result.count === 0) {
      await interaction.reply({
        content: 'There is no active join role configured.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription('The automatic join role has been disabled.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default joinRoleDisableCommand;
