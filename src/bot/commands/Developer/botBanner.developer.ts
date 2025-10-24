const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('bot-banner')
  .setDescription('Update the bot\'s banner.')
  .addAttachmentOption(option => option.setName('banner').setDescription('The banner image.').setRequired(true)),
  async execute (interaction) {
    if(interaction.user.id !== authorizedId) {
      const authorizedId = process.env.OWNER_ID;

      return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
    }

    const { options } = interaction;
    const bannerAttachment = options.getAttachment('banner');
    if(!bannerAttachment.contentType.startsWith('image/')) {
      return interaction.reply({ content: 'Please provide a valid image file for the banner.', ephemeral: true });
    }

    try {
      const response = await fetch(bannerAttachment.url);
      const buffer = await response.buffer();
      const base64 = buffer.toString('base64');
      const imageData = `data:${bannerAttachment.contentType};base64,${base64}`;

      const client = interaction.client;

      const patchResponse = await fetch('https://discord.com/api/v10/users/@me', {
        method: 'PATCH',
        headers: {
          Authorization: `Bot ${client.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ banner: imageData }),
      });

      if(!patchResponse.ok) throw new Error(`Failed to update banner: ${patchResponse.statusText}`);
      await interaction.reply({ content: `The bot banner has been updated successfully.` });
    } catch(error) {
      console.error('error', error);
      await interaction.reply({ content: `Error updating the banner: ${error.message}`, ephemeral: true });
    }
  }
}
