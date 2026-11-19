import { MessageFlags, SlashCommandBuilder } from 'discord.js';

import logger from '@/services/logger.service';
import {
  TRANSLATION_CONSENT_VERSION,
  prismaTranslationConsentStore,
  type TranslationConsentStore,
} from '@/services/translationConsent.service';

import type { SlashCommandModule } from '@/bot/types';

export function createTranslateConsentCommand(store: TranslationConsentStore): SlashCommandModule {
  return {
    data: new SlashCommandBuilder()
      .setName('translate-consent')
      .setDescription('Show or withdraw your consent for /translate.')
      .addSubcommand((sub) =>
        sub.setName('status').setDescription('Show whether you have agreed to /translate.'),
      )
      .addSubcommand((sub) =>
        sub
          .setName('revoke')
          .setDescription('Withdraw your consent for /translate and delete the stored entry.'),
      ),
    async execute(interaction) {
      const userId = interaction.user.id;
      const subcommand = interaction.options.getSubcommand(true);

      try {
        if (subcommand === 'revoke') {
          const removed = await store.revoke(userId);
          await interaction.reply({
            content: removed
              ? 'Your consent for /translate is withdrawn and the entry is deleted. /translate will ask again before it sends anything.'
              : 'There was no stored consent for you. Nothing to delete.',
            flags: MessageFlags.Ephemeral,
          });
          return;
        }

        const agreed = await store.hasConsent(userId, TRANSLATION_CONSENT_VERSION);
        await interaction.reply({
          content: agreed
            ? 'You have agreed to /translate. Withdraw with `/translate-consent revoke`.'
            : 'You have not agreed to /translate. It will ask before the first translation.',
          flags: MessageFlags.Ephemeral,
        });
      } catch (error) {
        logger.warn('[BOT] /translate-consent failed', {
          subcommand,
          error: error instanceof Error ? error.name : 'unknown',
        });
        await interaction.reply({
          content: 'Your consent could not be read or changed. Please try again later.',
          flags: MessageFlags.Ephemeral,
        });
      }
    },
  };
}

const translateConsentCommand = createTranslateConsentCommand(prismaTranslationConsentStore);

export default translateConsentCommand;
