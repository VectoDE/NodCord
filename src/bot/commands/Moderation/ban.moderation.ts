import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { GuildMember, User } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const banCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from this server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('The member to ban.').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Provide the reason for this ban.')
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

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      await interaction.reply({
        content: 'You do not have permission to ban members.',
        ephemeral: true,
      });
      return;
    }

    const targetUser: User = interaction.options.getUser('user', true);

    if (targetUser.id === interaction.user.id) {
      await interaction.reply({ content: 'You cannot ban yourself.', ephemeral: true });
      return;
    }

    if (targetUser.id === interaction.client.user?.id) {
      await interaction.reply({ content: 'I cannot ban myself.', ephemeral: true });
      return;
    }

    const reason = interaction.options.getString('reason')?.trim() || 'No reason provided.';

    let targetMember: GuildMember | null = null;
    try {
      targetMember = await interaction.guild.members.fetch(targetUser.id);
    } catch {
      targetMember = null;
    }

    if (targetMember && !targetMember.bannable) {
      await interaction.reply({
        content: 'I cannot ban that member due to role hierarchy.',
        ephemeral: true,
      });
      return;
    }

    const dmEmbed = new EmbedBuilder()
      .setColor('Red')
      .setDescription(`You have been banned from **${interaction.guild.name}**.\nReason: ${reason}`)
      .setTimestamp();

    await targetUser.send({ embeds: [dmEmbed] }).catch(() => undefined);

    try {
      await interaction.guild.bans.create(targetUser.id, { reason });
    } catch (error) {
      await interaction.reply({
        content: 'I was unable to ban that member. Please check my permissions and role hierarchy.',
        ephemeral: true,
      });
      return;
    }

    const resultEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`Successfully banned **${targetUser.tag}**.`)
      .addFields({ name: 'Reason', value: reason })
      .setTimestamp();

    await interaction.reply({ embeds: [resultEmbed] });
  },
};

export default banCommand;
