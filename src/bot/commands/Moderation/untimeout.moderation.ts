import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

import type { GuildMember, User } from 'discord.js';
import type { SlashCommandModule } from '@/bot/types';

const untimeoutCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove an active timeout from a member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The member to remove the timeout from.')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for removing the timeout.')
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

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers)) {
      await interaction.reply({
        content: 'You do not have permission to manage timeouts.',
        ephemeral: true,
      });
      return;
    }

    const targetUser: User = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason')?.trim() || 'No reason provided.';

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

    if (!targetMember.isCommunicationDisabled()) {
      await interaction.reply({
        content: 'That member is not currently timed out.',
        ephemeral: true,
      });
      return;
    }

    try {
      await targetMember.timeout(null, reason);
    } catch {
      await interaction.reply({ content: 'I was unable to remove the timeout.', ephemeral: true });
      return;
    }

    const dmEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(
        `Your timeout in **${interaction.guild.name}** has been removed.\nReason: ${reason}`,
      )
      .setTimestamp();

    await targetUser.send({ embeds: [dmEmbed] }).catch(() => undefined);

    const resultEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription(`Removed the timeout from **${targetUser.tag}**.`)
      .addFields({ name: 'Reason', value: reason })
      .setTimestamp();

    await interaction.reply({ embeds: [resultEmbed] });
  },
};

export default untimeoutCommand;
