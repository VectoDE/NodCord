import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { User } from 'discord.js';
import prisma from '@/services/prisma.service';

import type { SlashCommandModule } from '@/bot/types';

const warnCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issue a warning to a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('The member to warn.').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for the warning.')
        .setRequired(false)
        .setMaxLength(400),
    ),
  async execute(interaction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
      await interaction.reply({
        content: 'You do not have permission to warn members.',
        ephemeral: true,
      });
      return;
    }

    const targetUser: User = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason')?.trim() || 'No reason provided.';

    await prisma.warn.create({
      data: {
        guildId: interaction.guild.id,
        userId: targetUser.id,
        moderatorId: interaction.user.id,
        reason,
      },
    });

    const dmEmbed = new EmbedBuilder()
      .setColor('Red')
      .setDescription(
        `You have received a warning in **${interaction.guild.name}**.\nReason: ${reason}`,
      )
      .setTimestamp();

    await targetUser.send({ embeds: [dmEmbed] }).catch(() => undefined);

    const resultEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`Warned **${targetUser.tag}**.`)
      .addFields({ name: 'Reason', value: reason })
      .setTimestamp();

    await interaction.reply({ embeds: [resultEmbed] });
  },
};

export default warnCommand;
