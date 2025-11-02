import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const buttonsCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('buttons')
    .setDescription('Preview the different button styles.'),
  async execute(interaction) {
    const previewEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setDescription('Here are some example buttons you can use in your own commands:');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('buttons.primary')
        .setLabel('Primary')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('buttons.emoji')
        .setLabel('Emoji')
        .setEmoji('😄')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setLabel('Link').setStyle(ButtonStyle.Link).setURL('https://youtube.com'),
      new ButtonBuilder().setCustomId('buttons.danger').setEmoji('⚠️').setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('buttons.disabled')
        .setLabel('Disabled')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),
    );

    await interaction.reply({ embeds: [previewEmbed], components: [row] });
  },
};

export default buttonsCommand;
