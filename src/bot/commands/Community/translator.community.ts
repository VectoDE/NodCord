import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
} from 'discord.js';

import logger from '@/services/logger.service';
import {
  MAX_TEXT_LENGTH,
  TRANSLATION_SERVICE_NAME,
  TranslationFailedError,
  TranslationNotConfiguredError,
  isTranslationConfigured,
  translateText,
  type TranslationResult,
} from '@/services/translation.service';
import {
  TRANSLATION_CONSENT_VERSION,
  UserCooldown,
  prismaTranslationConsentStore,
  type TranslationConsentStore,
} from '@/services/translationConsent.service';

import type { SlashCommandModule } from '@/bot/types';

/** Zielsprachen mit den Codes von LibreTranslate (GET /languages), max. 25 Discord-Choices. */
export const LANGUAGE_CHOICES = [
  { name: 'English', value: 'en' },
  { name: 'German', value: 'de' },
  { name: 'French', value: 'fr' },
  { name: 'Spanish', value: 'es' },
  { name: 'Italian', value: 'it' },
  { name: 'Portuguese', value: 'pt' },
  { name: 'Portuguese (Brazil)', value: 'pt-BR' },
  { name: 'Dutch', value: 'nl' },
  { name: 'Polish', value: 'pl' },
  { name: 'Czech', value: 'cs' },
  { name: 'Danish', value: 'da' },
  { name: 'Swedish', value: 'sv' },
  { name: 'Finnish', value: 'fi' },
  { name: 'Greek', value: 'el' },
  { name: 'Hungarian', value: 'hu' },
  { name: 'Romanian', value: 'ro' },
  { name: 'Russian', value: 'ru' },
  { name: 'Ukrainian', value: 'uk' },
  { name: 'Turkish', value: 'tr' },
  { name: 'Arabic', value: 'ar' },
  { name: 'Hindi', value: 'hi' },
  { name: 'Japanese', value: 'ja' },
  { name: 'Korean', value: 'ko' },
  { name: 'Chinese (Simplified)', value: 'zh-Hans' },
  { name: 'Chinese (Traditional)', value: 'zh-Hant' },
] as const;

export const TRANSLATE_COOLDOWN_MS = 10_000;
export const CONSENT_TIMEOUT_MS = 120_000;

export const CONSENT_ACCEPT_ID = 'translate-consent:accept';
export const CONSENT_DECLINE_ID = 'translate-consent:decline';

export const TRANSLATION_FOOTER = `Translated via this bot's own ${TRANSLATION_SERVICE_NAME} server.`;

export const NOT_CONFIGURED_MESSAGE = 'Translation is not configured on this bot.';

export const CONSENT_NOTICE = [
  '**Before your first translation**',
  `Your text is sent to the ${TRANSLATION_SERVICE_NAME} server that the operator of this bot runs, translated there and shown here. It is not passed on to any other translation service.`,
  'What is transferred: the text you enter and the target language. Your Discord ID is not sent to the translation server.',
  'What is stored: the bot does not store the text. It stores only that you agreed (your Discord ID, time, notice version) until you withdraw.',
  'You can withdraw at any time with `/translate-consent revoke`. Details are in the privacy policy of this bot’s operator.',
].join('\n\n');

export interface TranslateDeps {
  consentStore: TranslationConsentStore;
  translate: (text: string, target: string) => Promise<TranslationResult>;
  isConfigured: () => boolean;
  cooldown: UserCooldown;
  consentTimeoutMs: number;
}

function buildData() {
  return new SlashCommandBuilder()
    .setName('translate')
    .setDescription(
      `Translate text with the bot's own ${TRANSLATION_SERVICE_NAME} server (asks for consent first).`,
    )
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('What should be translated?')
        .setRequired(true)
        .setMaxLength(MAX_TEXT_LENGTH),
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
    );
}

function consentButtons() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(CONSENT_ACCEPT_ID)
      .setLabel('Agree and translate')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(CONSENT_DECLINE_ID)
      .setLabel('Decline')
      .setStyle(ButtonStyle.Secondary),
  );
}

export function buildResultEmbed(original: string, translated: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('Translation Result')
    .addFields(
      { name: 'Original', value: original.substring(0, 1024) || '-' },
      { name: 'Translated', value: translated.substring(0, 1024) || '-' },
    )
    .setFooter({ text: TRANSLATION_FOOTER });
}

function logFailure(error: unknown): void {
  if (error instanceof TranslationFailedError) {
    logger.warn('[BOT] /translate failed', { error: error.name, status: error.status });
  } else if (error instanceof Error) {
    logger.warn('[BOT] /translate failed', { error: error.name });
  } else {
    logger.warn('[BOT] /translate failed', { error: 'unknown' });
  }
}

function failureMessage(error: unknown): string {
  if (error instanceof TranslationNotConfiguredError) return NOT_CONFIGURED_MESSAGE;
  if (error instanceof TranslationFailedError && error.status === 400) {
    return 'The translation server does not support this language or text.';
  }
  return "I couldn't translate that text. Please try again later.";
}

/**
 * Holt die Zustimmung ein. Liefert true, wenn übersetzt werden darf.
 * Die Rückfrage ist immer ephemer; danach folgt die eigentliche Antwort als followUp.
 */
async function ensureConsent(
  interaction: ChatInputCommandInteraction,
  deps: TranslateDeps,
): Promise<'granted' | 'already' | 'denied'> {
  const userId = interaction.user.id;
  if (await deps.consentStore.hasConsent(userId, TRANSLATION_CONSENT_VERSION)) return 'already';

  await interaction.reply({
    content: CONSENT_NOTICE,
    components: [consentButtons()],
    flags: MessageFlags.Ephemeral,
  });
  const prompt = await interaction.fetchReply();

  let choice: ButtonInteraction;
  try {
    choice = await prompt.awaitMessageComponent({
      componentType: ComponentType.Button,
      filter: (button) => button.user.id === userId,
      time: deps.consentTimeoutMs,
    });
  } catch {
    await interaction.editReply({
      content: 'No answer received. Nothing was sent for translation.',
      components: [],
    });
    return 'denied';
  }

  if (choice.customId !== CONSENT_ACCEPT_ID) {
    await choice.update({
      content: 'Declined. Nothing was sent for translation.',
      components: [],
    });
    return 'denied';
  }

  await deps.consentStore.grant(userId, TRANSLATION_CONSENT_VERSION);
  await choice.update({
    content: 'Thanks, your consent is saved. Withdraw any time with `/translate-consent revoke`.',
    components: [],
  });
  return 'granted';
}

export function createTranslateCommand(deps: TranslateDeps): SlashCommandModule {
  return {
    data: buildData(),
    async execute(interaction) {
      const text = interaction.options.getString('text', true);
      const language = interaction.options.getString('to', true);
      const hidden = interaction.options.getBoolean('hidden') ?? false;
      const userId = interaction.user.id;

      if (!deps.isConfigured()) {
        await interaction.reply({ content: NOT_CONFIGURED_MESSAGE, flags: MessageFlags.Ephemeral });
        return;
      }

      if (text.length > MAX_TEXT_LENGTH) {
        await interaction.reply({
          content: `The text is too long (max. ${MAX_TEXT_LENGTH} characters).`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const waitMs = deps.cooldown.remaining(userId);
      if (waitMs > 0) {
        await interaction.reply({
          content: `Please wait ${Math.ceil(waitMs / 1000)} s before the next translation.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      let consent: 'granted' | 'already' | 'denied';
      try {
        consent = await ensureConsent(interaction, deps);
      } catch (error) {
        logFailure(error);
        const content = 'Consent could not be checked. Nothing was sent for translation.';
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
        } else {
          await interaction.reply({ content, flags: MessageFlags.Ephemeral });
        }
        return;
      }
      if (consent === 'denied') return;

      // Nach der Rückfrage gibt es schon eine (ephemere) Antwort, daher followUp.
      const viaFollowUp = consent === 'granted';
      if (!viaFollowUp) {
        await interaction.deferReply(hidden ? { flags: MessageFlags.Ephemeral } : {});
      }

      const send = async (payload: { content?: string; embeds?: EmbedBuilder[] }) => {
        if (viaFollowUp) {
          await interaction.followUp(
            hidden ? { ...payload, flags: MessageFlags.Ephemeral } : payload,
          );
        } else {
          await interaction.editReply(payload);
        }
      };

      deps.cooldown.start(userId);
      try {
        const { text: translated } = await deps.translate(text, language);
        await send({ embeds: [buildResultEmbed(text, translated)] });
      } catch (error) {
        logFailure(error);
        await send({ content: failureMessage(error) });
      }
    },
  };
}

const translateCommand = createTranslateCommand({
  consentStore: prismaTranslationConsentStore,
  translate: (text, target) => translateText(text, target),
  isConfigured: () => isTranslationConfigured(),
  cooldown: new UserCooldown(TRANSLATE_COOLDOWN_MS),
  consentTimeoutMs: CONSENT_TIMEOUT_MS,
});

export default translateCommand;
