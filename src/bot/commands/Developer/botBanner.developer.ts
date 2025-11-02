import { SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const ownerId = process.env['OWNER_ID'];

const botBannerCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('bot-banner')
    .setDescription("Update the bot's profile banner image.")
    .addAttachmentOption((option) =>
      option
        .setName('banner')
        .setDescription('The image file to use as the banner.')
        .setRequired(true),
    ),
  async execute(interaction, client) {
    if (!ownerId) {
      await interaction.reply({
        content: 'The bot owner has not configured an OWNER_ID environment variable.',
        ephemeral: true,
      });
      return;
    }

    if (interaction.user.id !== ownerId) {
      await interaction.reply({
        content: 'You are not authorised to use this command.',
        ephemeral: true,
      });
      return;
    }

    const attachment = interaction.options.getAttachment('banner', true);
    const contentType = attachment.contentType ?? '';
    if (!contentType.startsWith('image/')) {
      await interaction.reply({ content: 'Please provide a valid image file.', ephemeral: true });
      return;
    }

    if (!client.token) {
      await interaction.reply({
        content: 'The bot token is not available. Cannot update the banner.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const response = await fetch(attachment.url);
      if (!response.ok) {
        throw new Error(`Failed to download banner (${response.status})`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const dataUri = `data:${contentType};base64,${buffer.toString('base64')}`;

      const patchResponse = await fetch('https://discord.com/api/v10/users/@me', {
        method: 'PATCH',
        headers: {
          Authorization: `Bot ${client.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ banner: dataUri }),
      });

      if (!patchResponse.ok) {
        const errorBody = await patchResponse.text().catch(() => patchResponse.statusText);
        throw new Error(`Failed to update banner (${patchResponse.status}): ${errorBody}`);
      }

      await interaction.editReply({ content: 'The bot banner has been updated successfully.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await interaction.editReply({
        content: `An error occurred whilst updating the banner: ${message}`,
      });
    }
  },
};

export default botBannerCommand;
