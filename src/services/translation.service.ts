/**
 * Übersetzung über eine kostenlose API.
 *
 * Reihenfolge:
 * 1. LibreTranslate, wenn LIBRETRANSLATE_URL gesetzt ist (selbst gehostet,
 *    keine Daten an Dritte). LIBRETRANSLATE_API_KEY ist optional.
 * 2. DeepL API Free, wenn DEEPL_API_KEY gesetzt ist.
 * 3. Sonst ist die Übersetzung nicht konfiguriert.
 */

export type TranslationProvider = 'libretranslate' | 'deepl';

export class TranslationNotConfiguredError extends Error {
  constructor() {
    super('Translation is not configured');
    this.name = 'TranslationNotConfiguredError';
  }
}

export class TranslationFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranslationFailedError';
  }
}

export interface TranslationResult {
  text: string;
  provider: TranslationProvider;
}

type Env = Record<string, string | undefined>;

const REQUEST_TIMEOUT_MS = 10_000;
const DEEPL_FREE_ENDPOINT = 'https://api-free.deepl.com/v2/translate';
const DEEPL_PRO_ENDPOINT = 'https://api.deepl.com/v2/translate';

const LIBRE_LANGUAGE_MAP: Record<string, string> = {
  'zh-CN': 'zh',
};

const DEEPL_LANGUAGE_MAP: Record<string, string> = {
  'zh-CN': 'ZH-HANS',
  en: 'EN-US',
  pt: 'PT-PT',
};

export function getTranslationProvider(env: Env = process.env): TranslationProvider | null {
  if (env.LIBRETRANSLATE_URL?.trim()) return 'libretranslate';
  if (env.DEEPL_API_KEY?.trim()) return 'deepl';
  return null;
}

function parseLibreUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new TranslationFailedError('LIBRETRANSLATE_URL is not a valid URL');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TranslationFailedError('LIBRETRANSLATE_URL must use http or https');
  }
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/translate`;
  url.search = '';
  url.hash = '';
  return url;
}

async function translateWithLibre(text: string, target: string, env: Env): Promise<string> {
  const url = parseLibreUrl(env.LIBRETRANSLATE_URL ?? '');
  const body: Record<string, string> = {
    q: text,
    source: 'auto',
    target: LIBRE_LANGUAGE_MAP[target] ?? target,
    format: 'text',
  };
  const apiKey = env.LIBRETRANSLATE_API_KEY?.trim();
  if (apiKey) body.api_key = apiKey;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    redirect: 'error',
  });
  if (!response.ok) {
    throw new TranslationFailedError(`LibreTranslate responded with ${response.status}`);
  }
  const data = (await response.json()) as { translatedText?: unknown };
  if (typeof data.translatedText !== 'string') {
    throw new TranslationFailedError('LibreTranslate returned no text');
  }
  return data.translatedText;
}

async function translateWithDeepl(text: string, target: string, env: Env): Promise<string> {
  const apiKey = (env.DEEPL_API_KEY ?? '').trim();
  // Schlüssel der kostenlosen API enden auf ":fx".
  const endpoint = apiKey.endsWith(':fx') ? DEEPL_FREE_ENDPOINT : DEEPL_PRO_ENDPOINT;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      target_lang: DEEPL_LANGUAGE_MAP[target] ?? target.toUpperCase(),
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    redirect: 'error',
  });
  if (!response.ok) {
    throw new TranslationFailedError(`DeepL responded with ${response.status}`);
  }
  const data = (await response.json()) as { translations?: Array<{ text?: unknown }> };
  const translated = data.translations?.[0]?.text;
  if (typeof translated !== 'string') {
    throw new TranslationFailedError('DeepL returned no text');
  }
  return translated;
}

export async function translateText(
  text: string,
  target: string,
  env: Env = process.env,
): Promise<TranslationResult> {
  const provider = getTranslationProvider(env);
  if (!provider) throw new TranslationNotConfiguredError();

  const translated =
    provider === 'libretranslate'
      ? await translateWithLibre(text, target, env)
      : await translateWithDeepl(text, target, env);

  return { text: translated, provider };
}
