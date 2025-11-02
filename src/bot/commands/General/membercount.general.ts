import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const memberCountCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('Show a breakdown of server members, humans, and bots.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages),
  async execute(interaction, client) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used inside a server.',
        ephemeral: true,
      });
      return;
    }

    const clientUser = client.user;
    if (!clientUser) {
      await interaction.reply({
        content: 'The client user is not ready yet. Please try again in a moment.',
        ephemeral: true,
      });
      return;
    }

    const guild = interaction.guild;
    await guild.members.fetch();

    const totalMembers = guild.memberCount;
    const botMembers = guild.members.cache.filter((member) => member.user.bot).size;
    const humanMembers = totalMembers - botMembers;

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setColor('Blurple')
      .setThumbnail(clientUser.displayAvatarURL())
      .addFields(
        { name: 'Total Members', value: `${totalMembers}`, inline: true },
        { name: 'Humans', value: `${humanMembers}`, inline: true },
        { name: 'Bots', value: `${botMembers}`, inline: true },
      )
      .setFooter({ text: guild.name })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

export default memberCountCommand;
