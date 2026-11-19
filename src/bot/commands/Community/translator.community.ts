import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';
import {
  TranslationNotConfiguredError,
  getTranslationProvider,
  translateText,
} from '@/services/translation.service';

const LANGUAGE_CHOICES = [
  { name: 'Afrikaans', value: 'af' },
  { name: 'Albanian', value: 'sq' },
  { name: 'Amharic', value: 'am' },
  { name: 'Arabic', value: 'ar' },
  { name: 'Armenian', value: 'hy' },
  { name: 'Azerbaijani', value: 'az' },
  { name: 'Basque', value: 'eu' },
  { name: 'Belarusian', value: 'be' },
  { name: 'Bengali', value: 'bn' },
  { name: 'Bosnian', value: 'bs' },
  { name: 'Bulgarian', value: 'bg' },
  { name: 'Catalan', value: 'ca' },
  { name: 'Cebuano', value: 'ceb' },
  { name: 'Chichewa', value: 'ny' },
  { name: 'Chinese (Simplified)', value: 'zh-CN' },
] as const;

const translateCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Translate text into a different language.')
    .addStringOption((option) =>
      option.setName('text').setDescription('What should be translated?').setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('to')
        .setDescription('Target language')
        .setRequired(true)
        .addChoices(...LANGUAGE_CHOICES),
    )
    .addBooleanOption((option) =>
      option.setName('hidden').setDescription('Should the response be hidden?').setRequired(false),
    ),
  async execute(interaction) {
    const text = interaction.options.getString('text', true);
    const language = interaction.options.getString('to', true);
    const hidden = interaction.options.getBoolean('hidden') ?? false;

    await interaction.deferReply({ ephemeral: hidden });

    if (!getTranslationProvider()) {
      await interaction.editReply({
        content:
          'Translation is not configured on this bot. Ask the bot owner to set LIBRETRANSLATE_URL or DEEPL_API_KEY.',
      });
      return;
    }

    await interaction.editReply({ content: 'Translating...' });

    try {
      const { text: translatedText } = await translateText(text, language);

      const embed = new EmbedBuilder()
        .setColor('Random')
        .setTitle('Translation Result')
        .addFields(
          { name: 'Original', value: text.substring(0, 1024) },
          { name: 'Translated', value: translatedText.substring(0, 1024) || '-' },
        );

      await interaction.editReply({ content: '', embeds: [embed] });
    } catch (error) {
      const content =
        error instanceof TranslationNotConfiguredError
          ? 'Translation is not configured on this bot.'
          : "I couldn't translate that text. Please try again later.";
      await interaction.editReply({ content });
    }
  },
};

export default translateCommand;
