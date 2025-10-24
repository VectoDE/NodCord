const { SlashCommandBuilder, PermissionsBitField, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('embed-builder')
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  .setDescription('Build your embeds using modals.'),
  async execute(interaction) {
    const modal = new ModalBuilder()
    .setTitle('Embed Builder')
    .setCustomId('modal');

    const title = new TextInputBuilder()
    .setCustomId('title')
    .setLabel('Title')
    .setRequired(true)
    .setPlaceholder('Enter your embed title here.')
    .setStyle(TextInputStyle.Short);

    const description = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Description')
    .setRequired(true)
    .setPlaceholder('Enter your embed description here.')
    .setStyle(TextInputStyle.Paragraph);

    const color = new TextInputBuilder()
    .setCustomId('color')
    .setRequired(true)
    .setPlaceholder('Enter your embed color here. example: #00ffff')
    .setStyle(TextInputStyle.Short);

    const image_link = new TextInputBuilder()
    .setCustomId('image_link')
    .setLabel('Image URL')
    .setPlaceholder('Enter your embed image URL here.')
    .setRequired(true)
    .setStyle(TextInputStyle.URL);

    const thumbnail_link = new TextInputBuilder()
    .setCustomId('thumbnail_link')
    .setLabel('Thumbnail URL')
    .setPlaceholder('Enter your embed thumbnail URL here.')
    .setRequired(true)
    .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder().addComponents(title);
    const secondActionRow = new ActionRowBuilder().addComponents(description);
    const colorofembed = new ActionRowBuilder().addComponents(color);
    const image = new ActionRowBuilder().addComponents(image_link);
    const thumbnail = new ActionRowBuilder().addComponents(thumbnail_link);

    modal.addComponents(
      firstActionRow,
      secondActionRow,
      colorofembed,
      image,
      thumbnail
    );
    interaction.showModal(modal);
  }
}
