import logger from '@/services/logger.service';
import { clamp } from '@/utils/number.util';

const DEFAULT_MODEL = process.env['PUBLIC_AI_MODEL'] ?? 'mistralai/Mistral-7B-Instruct-v0.2';
const PROVIDER = (process.env['PUBLIC_AI_PROVIDER'] ?? 'huggingface').toLowerCase();
const API_KEY = process.env['PUBLIC_AI_API_KEY'] ?? '';
const BASE_ENDPOINT =
  process.env['PUBLIC_AI_ENDPOINT'] ??
  (PROVIDER === 'openrouter'
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : `https://api-inference.huggingface.co/models/${DEFAULT_MODEL}`);
const REQUEST_TIMEOUT_MS = Number(process.env['PUBLIC_AI_TIMEOUT_MS'] ?? 25_000);

export class AiProviderUnavailableError extends Error {
  constructor(message = 'AI provider is not configured') {
    super(message);
    this.name = 'AiProviderUnavailableError';
  }
}

export interface AiMessageInput {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  messages?: AiMessageInput[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface AiCompletionResult {
  text: string;
  provider: string;
  latencyMs: number;
  promptTokenEstimate: number;
  completionTokenEstimate: number;
  rawResponse: unknown;
}

const estimateTokens = (text: string): number => {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  // Rough approximation: tokens ~ words * 1.3 for Latin scripts
  return Math.max(4, Math.round(words * 1.3));
};

const buildPromptFromMessages = (messages: readonly AiMessageInput[]): string => {
  if (!messages.length) return '';
  return messages
    .map((msg) => {
      const prefix =
        msg.role === 'system' ? 'System' : msg.role === 'assistant' ? 'Assistant' : 'User';
      return `${prefix}:\n${msg.content.trim()}`;
    })
    .join('\n\n')
    .concat('\n\nAssistant:');
};

const assertProviderConfigured = (): void => {
  if (PROVIDER === 'huggingface' && !API_KEY) {
    throw new AiProviderUnavailableError(
      'PUBLIC_AI_API_KEY is required for the HuggingFace provider.',
    );
  }

  if (PROVIDER === 'openrouter' && !API_KEY) {
    throw new AiProviderUnavailableError(
      'PUBLIC_AI_API_KEY is required for the OpenRouter provider.',
    );
  }
};

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function callHuggingFace(
  prompt: string,
  options: AiCompletionOptions,
): Promise<AiCompletionResult> {
  assertProviderConfigured();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  };

  const body = {
    inputs: prompt,
    parameters: {
      max_new_tokens: clamp(options.maxTokens ?? 512, 64, 1024),
      temperature: clamp(options.temperature ?? 0.7, 0, 1.5),
      top_p: clamp(options.topP ?? 0.9, 0, 1),
      return_full_text: false,
    },
  };

  const startedAt = Date.now();
  const response = await fetchWithTimeout(
    BASE_ENDPOINT,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    },
    REQUEST_TIMEOUT_MS,
  );

  const latencyMs = Date.now() - startedAt;
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = typeof payload?.error === 'string' ? payload.error : response.statusText;
    logger.error('[AI] HuggingFace request failed', {
      status: response.status,
      detail,
      latencyMs,
    });
    throw new Error(detail || 'AI provider returned an error');
  }

  if (Array.isArray(payload)) {
    const generated = payload[0]?.generated_text ?? '';
    return {
      text: typeof generated === 'string' ? generated.trim() : '',
      provider: 'huggingface',
      latencyMs,
      promptTokenEstimate: estimateTokens(prompt),
      completionTokenEstimate: estimateTokens(generated ?? ''),
      rawResponse: payload,
    };
  }

  const generated =
    typeof payload?.generated_text === 'string' ? payload.generated_text : JSON.stringify(payload);

  return {
    text: generated.trim(),
    provider: 'huggingface',
    latencyMs,
    promptTokenEstimate: estimateTokens(prompt),
    completionTokenEstimate: estimateTokens(generated),
    rawResponse: payload,
  };
}

async function callOpenRouter(
  messages: AiMessageInput[],
  options: AiCompletionOptions,
): Promise<AiCompletionResult> {
  assertProviderConfigured();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  };

  const body = {
    model: DEFAULT_MODEL,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    temperature: clamp(options.temperature ?? 0.7, 0, 2),
    max_tokens: clamp(options.maxTokens ?? 512, 64, 1024),
    top_p: clamp(options.topP ?? 0.9, 0, 1),
    stream: options.stream ?? false,
  };

  const startedAt = Date.now();
  const response = await fetchWithTimeout(
    BASE_ENDPOINT,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    },
    REQUEST_TIMEOUT_MS,
  );

  const latencyMs = Date.now() - startedAt;
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = payload?.error?.message ?? response.statusText;
    logger.error('[AI] OpenRouter request failed', {
      status: response.status,
      detail,
      latencyMs,
    });
    throw new Error(detail || 'AI provider returned an error');
  }

  const choiceText = payload?.choices?.[0]?.message?.content ?? '';

  return {
    text: typeof choiceText === 'string' ? choiceText.trim() : '',
    provider: 'openrouter',
    latencyMs,
    promptTokenEstimate: Number(payload?.usage?.prompt_tokens ?? estimateTokens(JSON.stringify(body))),
    completionTokenEstimate: Number(
      payload?.usage?.completion_tokens ?? estimateTokens(String(choiceText)),
    ),
    rawResponse: payload,
  };
}

export async function requestPublicAiCompletion(
  prompt: string,
  options: AiCompletionOptions = {},
): Promise<AiCompletionResult> {
  const history = options.messages ?? [];
  const normalizedHistory = history.filter(
    (msg) => msg.content.trim().length > 0 && msg.role !== 'system',
  );

  try {
    if (PROVIDER === 'openrouter') {
      const messageStack: AiMessageInput[] = [
        {
          role: 'system',
          content:
            'You are NodCord Assistant, a helpful AI for Discord communities. Provide concise, safe answers.',
        },
        ...history,
        { role: 'user', content: prompt },
      ];

      return await callOpenRouter(messageStack, options);
    }

    // Default to HuggingFace text generation
    const promptBuilder = [
      'You are NodCord Assistant, a helpful AI for Discord communities.',
      'Provide concise, safe answers using markdown when helpful.',
    ];

    if (normalizedHistory.length > 0) {
      promptBuilder.push(
        '\nConversation history:',
        normalizedHistory
          .map((msg) => `${msg.role.toUpperCase()}: ${msg.content.trim()}`)
          .join('\n'),
        '\n',
      );
    }

    promptBuilder.push(`USER: ${prompt.trim()}\nASSISTANT:`);
    const finalPrompt = promptBuilder.join('\n');
    return await callHuggingFace(finalPrompt, options);
  } catch (error) {
    if (error instanceof AiProviderUnavailableError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    logger.error('[AI] Completion failed', { error: message });
    throw new Error(message || 'AI provider request failed');
  }
}

export default Object.freeze({
  requestPublicAiCompletion,
  AiProviderUnavailableError,
});
