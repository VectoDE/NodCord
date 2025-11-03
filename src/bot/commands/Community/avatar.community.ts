import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const COLOR_PRIMARY = 0x5865f2;
const MAX_SIZE = 4096;
const FALLBACK_SIZES = [4096, 2048, 1024, 512, 256];

const avatarCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("Display a user's avatar.")
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The user whose avatar you want to view.')
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName('public')
        .setDescription('Show the avatar to everyone (default: private).')
        .setRequired(false),
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') ?? interaction.user;
    const isPublic = interaction.options.getBoolean('public') ?? false;

    const sizeLinks = FALLBACK_SIZES.map((size) => {
      const url = targetUser.displayAvatarURL({ size, forceStatic: false });
      return `[${size}px](${url})`;
    }).join(' • ');

    const avatarUrl = targetUser.displayAvatarURL({
      forceStatic: false,
      size: MAX_SIZE,
    });

    const embed = new EmbedBuilder()
      .setColor(COLOR_PRIMARY)
      .setAuthor({
        name: `${targetUser.username}`,
        iconURL: avatarUrl,
      })
      .setTitle('Avatar Preview')
      .setDescription(`Download sizes: ${sizeLinks}`)
      .setImage(avatarUrl)
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: !isPublic,
    });
  },
};

export default avatarCommand;
