import axios from 'axios';

import logger from '@/services/logger.service';

const API_BASE_URL = process.env['API_BASE_URL'] ?? 'http://localhost:8080';
const BOT_API_KEY = process.env['BOT_API_KEY'] ?? process.env['API_KEY'] ?? '';

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

if (BOT_API_KEY) {
  http.defaults.headers.common['x-api-key'] = BOT_API_KEY;
}

export interface AiChatMessage {
  id: string;
  sessionId: string;
  role: 'SYSTEM' | 'USER' | 'ASSISTANT';
  content: string;
  tokens?: number | null;
  latencyMs?: number | null;
  createdAt: string;
}

export interface AiChatSession {
  id: string;
  guildId: string | null;
  channelId: string | null;
  userId: string | null;
  referenceId: string | null;
  provider: string;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface AiChatResponse {
  session: AiChatSession;
  messages: AiChatMessage[];
  provider: string;
  latencyMs: number;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AiChatRequest {
  prompt: string;
  sessionId?: string;
  guildId?: string;
  channelId?: string;
  userId?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
}

export class AiServiceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiServiceUnavailableError';
  }
}

export async function createAiChat(request: AiChatRequest): Promise<AiChatResponse> {
  try {
    const payload = Object.fromEntries(
      Object.entries(request).filter(([, value]) => value !== undefined),
    );
    const response = await http.post<AiChatResponse>('/api/v1/ai/chat', payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 503) {
        const reason =
          (error.response.data as { error?: string } | undefined)?.error ??
          'AI provider unavailable';
        throw new AiServiceUnavailableError(reason);
      }

      const reason =
        (error.response?.data as { error?: string } | undefined)?.error ??
        error.response?.statusText ??
        'Unknown error';
      throw new Error(reason);
    }

    logger.error('[AI] createAiChat failed', { error });
    throw new Error('Failed to contact AI service');
  }
}

export async function fetchAiSession(sessionId: string): Promise<AiChatSession & { messages: AiChatMessage[] }> {
  const response = await http.get<AiChatSession & { messages: AiChatMessage[] }>(
    `/api/v1/ai/sessions/${sessionId}`,
  );
  return response.data;
}

export default Object.freeze({
  createAiChat,
  fetchAiSession,
});
