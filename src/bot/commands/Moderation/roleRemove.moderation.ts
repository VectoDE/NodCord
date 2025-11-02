import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { GuildMember, Role, User } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const removeRoleCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('role-remove')
    .setDescription('Remove a role from a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Select the member to remove the role from.')
        .setRequired(true),
    )
    .addRoleOption((option) =>
      option.setName('role').setDescription('Choose the role to remove.').setRequired(true),
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

    const targetUser: User = interaction.options.getUser('user', true);
    const role = interaction.options.getRole('role') as Role | null;

    if (!role) {
      await interaction.reply({ content: 'I could not find that role.', ephemeral: true });
      return;
    }

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

    const executor = await interaction.guild.members.fetch(interaction.user.id);

    if (!targetMember.roles.cache.has(role.id)) {
      await interaction.reply({
        content: `${targetMember} does not have the ${role} role.`,
        ephemeral: true,
      });
      return;
    }

    if (
      interaction.guild.members.me &&
      role.position >= interaction.guild.members.me.roles.highest.position
    ) {
      await interaction.reply({
        content: 'That role is higher than my highest role, so I cannot remove it.',
        ephemeral: true,
      });
      return;
    }

    if (
      role.position >= executor.roles.highest.position &&
      interaction.user.id !== interaction.guild.ownerId
    ) {
      await interaction.reply({
        content: 'You cannot remove a role that is higher or equal to your highest role.',
        ephemeral: true,
      });
      return;
    }

    try {
      await targetMember.roles.remove(role);
    } catch {
      await interaction.reply({ content: 'I was unable to remove that role.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`Removed ${role} from ${targetMember}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default removeRoleCommand;
