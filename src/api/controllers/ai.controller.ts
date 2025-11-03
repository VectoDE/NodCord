import type { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';

import {
  requestPublicAiCompletion,
  AiProviderUnavailableError,
  type AiMessageInput,
  type AiCompletionOptions,
} from '@/services/ai.service';
import { prisma } from '@/services/prisma.service';
import logger from '@/services/logger.service';
import { standardResponse } from '@/utils/response.util';
import { safeAsync } from '@/utils/async.util';

type JsonInput = Prisma.JsonValue | null;

const toJsonValue = (value: unknown): JsonInput | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (
    typeof value === 'object' ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value as JsonInput;
  }
  return undefined;
};

const estimateTokens = (text: string): number => {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(4, Math.round(words * 1.3));
};

export const createChatCompletion = safeAsync(async (req: Request, res: Response) => {
  const {
    prompt,
    sessionId,
    guildId,
    channelId,
    userId,
    referenceId,
    metadata,
    temperature,
    maxTokens,
  } = req.body as Record<string, unknown>;

  const promptText = typeof prompt === 'string' ? prompt.trim() : '';
  if (!promptText) {
    standardResponse(res, 400, { error: 'Prompt is required' }, 'Invalid prompt');
    return;
  }

  try {
    const historyRecords =
      typeof sessionId === 'string' && sessionId.length > 0
        ? ((await prisma.aiChatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' },
            take: 10,
          })) as Array<{ role: 'SYSTEM' | 'USER' | 'ASSISTANT'; content: string }>)
        : [];

    const historyForProvider: AiMessageInput[] = historyRecords
      .map((message): AiMessageInput => {
        const role =
          message.role === 'ASSISTANT'
            ? ('assistant' as const)
            : message.role === 'SYSTEM'
              ? ('system' as const)
              : ('user' as const);
        return {
          role,
          content: message.content,
        };
      })
      .reverse();

    const completionOptions: AiCompletionOptions = {
      messages: historyForProvider,
    };
    if (typeof temperature === 'number') completionOptions.temperature = temperature;
    if (typeof maxTokens === 'number') completionOptions.maxTokens = maxTokens;

    const aiResult = await requestPublicAiCompletion(promptText, completionOptions);

    const promptTokens = estimateTokens(promptText);

    const data = await prisma.$transaction(async (tx: typeof prisma) => {
      const metadataValue = toJsonValue(metadata);

      const existingSession =
        typeof sessionId === 'string' && sessionId.length > 0
          ? await tx.aiChatSession.findUnique({ where: { id: sessionId } })
          : null;

      const session = existingSession
        ? await tx.aiChatSession.update({
            where: { id: existingSession.id },
            data: {
              provider: aiResult.provider,
              guildId: typeof guildId === 'string' ? guildId : existingSession.guildId,
              channelId: typeof channelId === 'string' ? channelId : existingSession.channelId,
              userId: typeof userId === 'string' ? userId : existingSession.userId,
              referenceId:
                typeof referenceId === 'string' ? referenceId : existingSession.referenceId,
              metadata: metadataValue !== undefined ? metadataValue : existingSession.metadata,
            },
          })
        : await tx.aiChatSession.create({
            data: {
              provider: aiResult.provider,
              guildId: typeof guildId === 'string' ? guildId : null,
              channelId: typeof channelId === 'string' ? channelId : null,
              userId: typeof userId === 'string' ? userId : null,
              referenceId: typeof referenceId === 'string' ? referenceId : null,
              metadata: metadataValue ?? null,
            },
          });

      const userMessage = await tx.aiChatMessage.create({
        data: {
          sessionId: session.id,
          role: 'USER',
          content: promptText,
          tokens: promptTokens,
        },
      });

      const assistantMessage = await tx.aiChatMessage.create({
        data: {
          sessionId: session.id,
          role: 'ASSISTANT',
          content: aiResult.text,
          tokens: aiResult.completionTokenEstimate,
          latencyMs: aiResult.latencyMs,
        },
      });

      return { session, userMessage, assistantMessage };
    });

    logger.info('[AI] Chat completion generated', {
      sessionId: data.session.id,
      provider: aiResult.provider,
      latencyMs: aiResult.latencyMs,
    });

    standardResponse(
      res,
      200,
      {
        session: data.session,
        messages: [data.userMessage, data.assistantMessage],
        provider: aiResult.provider,
        latencyMs: aiResult.latencyMs,
        usage: {
          promptTokens,
          completionTokens: aiResult.completionTokenEstimate,
          totalTokens: promptTokens + aiResult.completionTokenEstimate,
        },
      },
      'AI response generated',
    );
  } catch (error) {
    if (error instanceof AiProviderUnavailableError) {
      logger.warn('[AI] Provider unavailable', { message: error.message });
      standardResponse(
        res,
        503,
        { error: error.message },
        'AI provider is not available right now',
      );
      return;
    }

    const message = error instanceof Error ? error.message : 'Failed to generate AI response';
    logger.error('[AI] Chat completion failed', { error: message });
    standardResponse(res, 500, { error: message }, 'Failed to generate AI response');
  }
});

export const getChatSession = safeAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    standardResponse(res, 400, { error: 'Session ID is required' }, 'Invalid request');
    return;
  }

  const session = await prisma.aiChatSession.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!session) {
    standardResponse(res, 404, { error: 'Session not found' }, 'Session not found');
    return;
  }

  standardResponse(res, 200, session, 'AI chat session retrieved');
});

export const listChatSessions = safeAsync(async (req: Request, res: Response) => {
  const { guildId, userId, limit } = req.query as Record<string, string | undefined>;
  const parsedLimit = limit !== undefined ? Number(limit) : 20;
  const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;
  const take = Math.min(Math.max(Math.floor(safeLimit), 1), 50);

  const sessions = await prisma.aiChatSession.findMany({
    where: {
      guildId: guildId ?? undefined,
      userId: userId ?? undefined,
    },
    orderBy: { updatedAt: 'desc' },
    take,
  });

  standardResponse(res, 200, sessions, 'AI chat sessions retrieved');
});

export default Object.freeze({
  createChatCompletion,
  getChatSession,
  listChatSessions,
});
