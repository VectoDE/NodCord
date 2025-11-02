import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';

const ownerId = process.env['OWNER_ID'];

const botStopCommand: SlashCommandModule = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Shut the bot instance down.'),
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
        content: 'This command is reserved for the bot owner.',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({ content: 'Stopping the bot...', ephemeral: true });

    const embed = new EmbedBuilder()
      .setColor('Red')
      .setDescription('The bot is shutting down. See you soon!');

    try {
      client.user?.setPresence({ status: 'invisible', activities: [] });
    } catch {
      // Ignore failures when updating presence during shutdown.
    }

    await new Promise<void>((resolve) => setTimeout(resolve, 2_000));
    await interaction.editReply({ content: '', embeds: [embed] });

    await client.destroy();
    setTimeout(() => process.exit(0), 250);
  },
};

export default botStopCommand;
