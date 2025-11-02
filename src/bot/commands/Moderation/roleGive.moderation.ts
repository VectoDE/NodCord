import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { GuildMember, Role, User } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const giveRoleCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('role-give')
    .setDescription('Assign a role to a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Select the member to assign the role to.')
        .setRequired(true),
    )
    .addRoleOption((option) =>
      option.setName('role').setDescription('Choose the role to assign.').setRequired(true),
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

    if (role.managed) {
      await interaction.reply({
        content: 'Managed roles cannot be assigned manually.',
        ephemeral: true,
      });
      return;
    }

    if (
      interaction.guild.members.me &&
      role.position >= interaction.guild.members.me.roles.highest.position
    ) {
      await interaction.reply({
        content: 'That role is higher than my highest role. I cannot assign it.',
        ephemeral: true,
      });
      return;
    }

    if (
      role.position >= executor.roles.highest.position &&
      interaction.user.id !== interaction.guild.ownerId
    ) {
      await interaction.reply({
        content: 'You cannot assign a role that is higher or equal to your highest role.',
        ephemeral: true,
      });
      return;
    }

    if (targetMember.roles.cache.has(role.id)) {
      await interaction.reply({
        content: `${targetMember} already has the ${role} role.`,
        ephemeral: true,
      });
      return;
    }

    try {
      await targetMember.roles.add(role);
    } catch {
      await interaction.reply({ content: 'I was unable to assign that role.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`Assigned ${role} to ${targetMember}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default giveRoleCommand;
