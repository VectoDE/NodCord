import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import prisma from '@/services/prisma.service';

import type { Role } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const joinRoleCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('joinrole')
    .setDescription('Configure the automatic role assigned to new members.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('Role to assign when a member joins.')
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

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({
        content: 'You do not have permission to manage roles.',
        ephemeral: true,
      });
      return;
    }

    const role = interaction.options.getRole('role', true) as Role;

    if (role.managed) {
      await interaction.reply({
        content: 'Managed roles cannot be assigned to new members.',
        ephemeral: true,
      });
      return;
    }

    if (
      interaction.guild.members.me &&
      role.position >= interaction.guild.members.me.roles.highest.position
    ) {
      await interaction.reply({
        content: 'That role is higher than my highest role. Please pick a lower role.',
        ephemeral: true,
      });
      return;
    }

    await prisma.joinRole.upsert({
      where: { guild_roleId: { guild: interaction.guild.id, roleId: role.id } },
      update: {
        roleName: role.name,
        isActive: true,
      },
      create: {
        guild: interaction.guild.id,
        roleId: role.id,
        roleName: role.name,
        isActive: true,
      },
    });

    // Disable any previous join roles that no longer match the selected role
    await prisma.joinRole.updateMany({
      where: {
        guild: interaction.guild.id,
        roleId: { not: role.id },
        isActive: true,
      },
      data: { isActive: false },
    });

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`${role} will now be assigned automatically to new members.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default joinRoleCommand;
