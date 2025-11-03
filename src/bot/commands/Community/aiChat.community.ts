import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

import type { SlashCommandModule } from '@/bot/types';
import {
  AiServiceUnavailableError,
  createAiChat,
  fetchAiSession,
  type AiChatRequest,
} from '@/bot/services/aiChat.service';
import logger from '@/services/logger.service';

const TRUNCATE_THRESHOLD = 3800;

const truncate = (value: string, limit = TRUNCATE_THRESHOLD): string => {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 3)}...`;
};

const formatHistory = (messages: Awaited<ReturnType<typeof fetchAiSession>>['messages']): string => {
  const recent = messages.slice(-4);
  return recent
    .map((message) => {
      const role = message.role === 'ASSISTANT' ? 'Assistant' : 'User';
      return `**${role}**: ${truncate(message.content, 600)}`;
    })
    .join('\n\n');
};

const aiChatCommand: SlashCommandModule = {
  data: new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Ask the NodCord AI assistant for help.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('What should the AI answer?')
        .setMinLength(4)
        .setMaxLength(2_000)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('session')
        .setDescription('Optional session ID to continue a previous conversation.')
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName('public')
        .setDescription('Share the AI response publicly (default: private).')
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName('history')
        .setDescription('Include a short history excerpt in the reply.')
        .setRequired(false),
    ),
  async execute(interaction) {
    const query = interaction.options.getString('query', true).trim();
    const sessionOption = interaction.options.getString('session') ?? undefined;
    const isPublic = interaction.options.getBoolean('public') ?? false;
    const includeHistory = interaction.options.getBoolean('history') ?? false;

    await interaction.deferReply({ ephemeral: !isPublic });

    try {
      const payload: AiChatRequest = {
        prompt: query,
        userId: interaction.user.id,
        referenceId: interaction.id,
        metadata: {
          requestedByTag: interaction.user.tag,
          requestedById: interaction.user.id,
        },
      };

      if (sessionOption) payload.sessionId = sessionOption;
      if (interaction.guildId) payload.guildId = interaction.guildId;
      if (interaction.channelId) payload.channelId = interaction.channelId;

      const response = await createAiChat(payload);

      const assistantMessage = response.messages.find((msg) => msg.role === 'ASSISTANT');
      const answer = assistantMessage?.content
        ? truncate(assistantMessage.content)
        : 'I could not produce an answer.';

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({
          name: 'NodCord AI Assistant',
        })
        .setDescription(answer)
        .addFields(
          { name: 'Session ID', value: `\`${response.session.id}\`` },
          {
            name: 'Provider',
            value: response.provider ?? 'unknown',
            inline: true,
          },
          {
            name: 'Latency',
            value: `${response.latencyMs.toLocaleString()} ms`,
            inline: true,
          },
        )
        .setFooter({ text: 'Use the session ID to continue the conversation.' })
        .setTimestamp(new Date(response.session.updatedAt));

      if (response.usage) {
        const total = response.usage.totalTokens ??
          (response.usage.promptTokens ?? 0) + (response.usage.completionTokens ?? 0);
        embed.addFields({
          name: 'Token Usage',
          value: `${response.usage.promptTokens ?? '—'} prompt / ${
            response.usage.completionTokens ?? '—'
          } completion / ${total ?? '—'} total`,
          inline: false,
        });
      }

      if (includeHistory) {
        try {
          const session = await fetchAiSession(response.session.id);
          embed.addFields({
            name: 'Recent History',
            value: formatHistory(session.messages),
          });
        } catch (historyError) {
          logger.warn('[AI] Failed to load session history', { error: historyError });
        }
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      if (error instanceof AiServiceUnavailableError) {
        await interaction.editReply({
          content: `⚠️ ${error.message}`,
        });
        return;
      }

      const message = error instanceof Error ? error.message : 'Unknown AI error';
      logger.error('[AI] Command failed', { error: message });
      await interaction.editReply({
        content: `I could not contact the AI service. Details: ${message}`,
      });
    }
  },
};

export default aiChatCommand;
