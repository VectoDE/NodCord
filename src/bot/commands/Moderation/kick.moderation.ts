import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { GuildMember, User } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const kickCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('The member to kick.').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason for the kick.').setRequired(false),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
      await interaction.reply({
        content: 'You do not have permission to kick members.',
        ephemeral: true,
      });
      return;
    }

    const targetUser: User = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason')?.trim() || 'No reason provided.';

    if (targetUser.id === interaction.user.id) {
      await interaction.reply({ content: 'You cannot kick yourself.', ephemeral: true });
      return;
    }

    let targetMember: GuildMember;
    try {
      targetMember = await interaction.guild.members.fetch(targetUser.id);
    } catch {
      await interaction.reply({
        content: 'That user is not currently in this server.',
        ephemeral: true,
      });
      return;
    }

    if (!targetMember.kickable) {
      await interaction.reply({
        content: 'I cannot kick that member due to role hierarchy.',
        ephemeral: true,
      });
      return;
    }

    const dmEmbed = new EmbedBuilder()
      .setColor('Red')
      .setDescription(`You have been kicked from **${interaction.guild.name}**.\nReason: ${reason}`)
      .setTimestamp();

    await targetMember.send({ embeds: [dmEmbed] }).catch(() => undefined);

    try {
      await targetMember.kick(reason);
    } catch {
      await interaction.reply({ content: 'I was unable to kick that member.', ephemeral: true });
      return;
    }

    const resultEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`Successfully kicked **${targetUser.tag}**.`)
      .addFields({ name: 'Reason', value: reason })
      .setTimestamp();

    await interaction.reply({ embeds: [resultEmbed] });
  },
};

export default kickCommand;
