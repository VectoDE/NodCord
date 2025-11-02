import {
  ActionRowBuilder,
  ModalBuilder,
  PermissionsBitField,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const embedBuilderCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('embed-builder')
    .setDescription('Open a modal that collects information to build a custom embed.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: 'You can only use this command inside a server.',
        ephemeral: true,
      });
      return;
    }

    const modal = new ModalBuilder().setTitle('Embed Builder').setCustomId('embed-builder.modal');

    const titleInput = new TextInputBuilder()
      .setCustomId('title')
      .setLabel('Title')
      .setPlaceholder('Enter the embed title')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('description')
      .setLabel('Description')
      .setPlaceholder('Enter the embed description')
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const colorInput = new TextInputBuilder()
      .setCustomId('color')
      .setLabel('Colour (hex)')
      .setPlaceholder('e.g. #00ffff')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const imageInput = new TextInputBuilder()
      .setCustomId('image')
      .setLabel('Image URL')
      .setPlaceholder('https://example.com/image.png')
      .setRequired(false)
      .setStyle(TextInputStyle.Short);

    const thumbnailInput = new TextInputBuilder()
      .setCustomId('thumbnail')
      .setLabel('Thumbnail URL')
      .setPlaceholder('https://example.com/thumbnail.png')
      .setRequired(false)
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(colorInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(thumbnailInput),
    );

    await interaction.showModal(modal);
  },
};

export default embedBuilderCommand;
