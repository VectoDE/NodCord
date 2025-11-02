import { Events, type ChatInputCommandInteraction, type Interaction } from 'discord.js';

import logger from '@/services/logger.service';

import type { BotEventModule, NodCordClient } from '@/bot/types';

const interactionCreateEvent: BotEventModule<'interactionCreate'> = {
  name: Events.InteractionCreate,
  async execute(client: NodCordClient, interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction as ChatInputCommandInteraction, client);
    } catch (error) {
      logger.error('[BOT] Failed to execute command', { command: interaction.commandName, error });
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: 'There was an error while executing this command!',
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  },
};

export default interactionCreateEvent;
