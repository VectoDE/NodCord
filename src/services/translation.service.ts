/**
 * Übersetzung ausschließlich über einen selbst betriebenen LibreTranslate-Server.
 *
 * Konfiguration:
 * - LIBRETRANSLATE_URL: Basis-URL des eigenen Servers. Leer = /translate aus.
 * - LIBRETRANSLATE_API_KEY: optional, falls der Server einen Schlüssel verlangt.
 *
 * Regeln (fail-closed, jede Abweichung = "nicht konfiguriert"):
 * - https ist Pflicht. http nur für Loopback (localhost, 127.0.0.0/8, ::1),
 *   private Netze (10/8, 172.16/12, 192.168/16, fc00::/7) und einteilige
 *   Hostnamen (z. B. Docker-Dienstname `libretranslate`).
 * - Keine Zugangsdaten in der URL (user:pass@host).
 * - Bekannte öffentliche Instanzen (PUBLIC_LIBRETRANSLATE_HOSTS) und die
 *   Anonymisierungsnetze .onion/.i2p werden abgelehnt, auch als Subdomain.
 */

export const TRANSLATION_SERVICE_NAME = 'LibreTranslate';

/** Obergrenze für die Antwort des Servers. */
export const MAX_RESPONSE_BYTES = 64 * 1024;

/** Obergrenze für den zu übersetzenden Text (entspricht setMaxLength der Option). */
export const MAX_TEXT_LENGTH = 1000;

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Öffentliche LibreTranslate-Instanzen, die nicht verwendet werden dürfen.
 * Quellen (abgerufen 2026-11-19):
 * - aktuelle Mirror-Liste: https://docs.libretranslate.com/community/mirrors/
 *   (libretranslate.com, translate.cutie.dating, translate.fedilab.app, Tor/I2P)
 * - frühere Mirror-Listen im README von LibreTranslate, Tags v1.2.9, v1.3.11,
 *   v1.5.0, v1.6.0 (libretranslate.de, translate.argosopentech.com,
 *   libretranslate.pussthecat.org, translate.api.skitzen.com,
 *   translate.fortytwo-it.com, translate.terraprint.co,
 *   translate.foxhaven.cyou, libretranslate.eownerdead.dedyn.io,
 *   trans.zillyhuhn.com)
 * Subdomains sind mit erfasst (z. B. portal.libretranslate.com).
 * Die Liste schützt vor Fehlkonfiguration; sie erkennt nicht jeden
 * öffentlichen Server.
 */
export const PUBLIC_LIBRETRANSLATE_HOSTS: readonly string[] = [
  'libretranslate.com',
  'libretranslate.de',
  'translate.argosopentech.com',
  'translate.cutie.dating',
  'translate.fedilab.app',
  'libretranslate.pussthecat.org',
  'translate.api.skitzen.com',
  'translate.fortytwo-it.com',
  'translate.terraprint.co',
  'translate.foxhaven.cyou',
  'libretranslate.eownerdead.dedyn.io',
  'trans.zillyhuhn.com',
];

/** Top-Level-Domains öffentlicher Anonymisierungsnetze (Tor/I2P-Mirrors). */
const BLOCKED_TLDS: readonly string[] = ['onion', 'i2p'];

export class TranslationNotConfiguredError extends Error {
  constructor() {
    super('Translation is not configured');
    this.name = 'TranslationNotConfiguredError';
  }
}

export class TranslationFailedError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'TranslationFailedError';
    this.status = status;
  }
}

export interface TranslationResult {
  text: string;
}

export type TranslationConfig =
  | { status: 'disabled' }
  | { status: 'invalid'; reason: string }
  | { status: 'ready'; endpoint: URL; apiKey: string | undefined };

type Env = Record<string, string | undefined>;

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.+$/, '');
}

function isBlockedPublicHost(host: string): boolean {
  const tld = host.split('.').pop() ?? '';
  if (BLOCKED_TLDS.includes(tld)) return true;
  return PUBLIC_LIBRETRANSLATE_HOSTS.some(
    (blocked) => host === blocked || host.endsWith(`.${blocked}`),
  );
}

function parseIpv4(host: string): number[] | null {
  const parts = host.split('.');
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => (/^\d{1,3}$/.test(part) ? Number(part) : NaN));
  if (octets.some((octet) => Number.isNaN(octet) || octet > 255)) return null;
  return octets;
}

function isLocalOrPrivateIpv4(octets: number[]): boolean {
  const [a = -1, b = -1] = octets;
  if (a === 127) return true; // 127.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  return false;
}

function isLocalOrPrivateIpv6(host: string): boolean {
  // URL liefert IPv6 in eckigen Klammern und bereits normalisiert.
  const address = host.replace(/^\[|\]$/g, '');
  if (address === '::1') return true;
  const firstGroup = address.split(':')[0] ?? '';
  if (!/^[0-9a-f]{1,4}$/.test(firstGroup)) return false;
  // fc00::/7 = erstes Byte 0xfc oder 0xfd
  const firstByte = parseInt(firstGroup.padStart(4, '0').slice(0, 2), 16);
  return firstByte === 0xfc || firstByte === 0xfd;
}

/** true, wenn für diesen Host unverschlüsseltes http zulässig ist. */
export function isHttpAllowedHost(rawHost: string): boolean {
  const host = normalizeHostname(rawHost);
  if (!host) return false;
  if (host.startsWith('[')) return isLocalOrPrivateIpv6(host);
  const ipv4 = parseIpv4(host);
  if (ipv4) return isLocalOrPrivateIpv4(ipv4);
  if (host === 'localhost') return true;
  // Einteiliger Hostname (Docker-Dienstname o. Ä.): Buchstaben, Ziffern, Bindestrich.
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(host) && !/^\d+$/.test(host);
}

/**
 * Prüft LIBRETRANSLATE_URL und liefert den Endpunkt oder den Grund der Ablehnung.
 * Der Grund enthält nie den API-Schlüssel und nie Zugangsdaten aus der URL.
 */
export function getTranslationConfig(env: Env = process.env): TranslationConfig {
  const raw = env['LIBRETRANSLATE_URL']?.trim();
  if (!raw) return { status: 'disabled' };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { status: 'invalid', reason: 'LIBRETRANSLATE_URL is not a valid URL' };
  }

  if (url.username || url.password) {
    return { status: 'invalid', reason: 'LIBRETRANSLATE_URL must not contain credentials' };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { status: 'invalid', reason: 'LIBRETRANSLATE_URL must use https' };
  }

  const host = normalizeHostname(url.hostname);
  if (!host) {
    return { status: 'invalid', reason: 'LIBRETRANSLATE_URL has no host' };
  }

  if (isBlockedPublicHost(host)) {
    return {
      status: 'invalid',
      reason: `LIBRETRANSLATE_URL points to a public LibreTranslate instance (${host}); only a self-hosted server is allowed`,
    };
  }

  if (url.protocol === 'http:' && !isHttpAllowedHost(url.hostname)) {
    return {
      status: 'invalid',
      reason:
        'LIBRETRANSLATE_URL must use https unless it points to localhost, a private network or a single-label host',
    };
  }

  const endpoint = new URL(url.href);
  endpoint.pathname = `${endpoint.pathname.replace(/\/+$/, '')}/translate`;
  endpoint.search = '';
  endpoint.hash = '';

  const apiKey = env['LIBRETRANSLATE_API_KEY']?.trim() || undefined;
  return { status: 'ready', endpoint, apiKey };
}

export function isTranslationConfigured(env: Env = process.env): boolean {
  return getTranslationConfig(env).status === 'ready';
}

/** Liest den Antwort-Body höchstens bis `limit` Bytes und bricht sonst ab. */
export async function readLimitedBody(
  response: Response,
  limit = MAX_RESPONSE_BYTES,
): Promise<string> {
  const declared = Number(response.headers.get('content-length') ?? '');
  if (Number.isFinite(declared) && declared > limit) {
    await response.body?.cancel().catch(() => undefined);
    throw new TranslationFailedError('LibreTranslate response too large', response.status);
  }
  if (!response.body) return '';

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel().catch(() => undefined);
      throw new TranslationFailedError('LibreTranslate response too large', response.status);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export async function translateText(
  text: string,
  target: string,
  env: Env = process.env,
): Promise<TranslationResult> {
  const config = getTranslationConfig(env);
  if (config.status !== 'ready') throw new TranslationNotConfiguredError();
  if (text.length > MAX_TEXT_LENGTH) {
    throw new TranslationFailedError('Text too long');
  }

  const body: Record<string, string> = {
    q: text,
    source: 'auto',
    target,
    format: 'text',
  };
  if (config.apiKey) body['api_key'] = config.apiKey;

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    redirect: 'error',
  });
  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined);
    throw new TranslationFailedError(
      `LibreTranslate responded with ${response.status}`,
      response.status,
    );
  }

  const raw = await readLimitedBody(response);
  let data: { translatedText?: unknown };
  try {
    data = JSON.parse(raw) as { translatedText?: unknown };
  } catch {
    throw new TranslationFailedError('LibreTranslate returned invalid JSON', response.status);
  }
  if (typeof data.translatedText !== 'string') {
    throw new TranslationFailedError('LibreTranslate returned no text', response.status);
  }
  return { text: data.translatedText };
}
