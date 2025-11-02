import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const avatarCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Display a user\'s avatar.")
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user whose avatar you want to view.')
        .setRequired(false),
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('user') ?? interaction.user;
    const avatarUrl = user.displayAvatarURL({ forceStatic: false, size: 1024 });

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setImage(avatarUrl)
      .setColor('Blurple');

    await interaction.reply({ embeds: [embed] });
  },
};

export default avatarCommand;
