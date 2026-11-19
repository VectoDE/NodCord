import type { AuthUser } from '@/middlewares/authentication.middleware';

/**
 * Metadaten für Stripe-Checkout-Sessions.
 *
 * Der Webhook (stripe.service.ts) ordnet Zahlungen über `userId` und
 * `tenantId` zu. Diese Schlüssel setzt deshalb nur der Server.
 */

export type MetadataIntent = 'one_time' | 'subscription';

/** Stripe erlaubt Metadaten-Schlüssel bis 40 Zeichen, höchstens 50 Einträge. */
const METADATA_KEY_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;
const METADATA_MAX_ENTRIES = 50;
const FORBIDDEN_KEYS: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype']);
/** Nur der Server setzt diese Schlüssel. */
const RESERVED_METADATA_KEYS: ReadonlySet<string> = new Set([
  'intent',
  'userId',
  'userEmail',
  'tenantId',
]);

/**
 * Übernimmt nur Schlüssel aus einem festen Zeichensatz. Damit sind
 * `__proto__`, `constructor` und ähnliche Namen ausgeschlossen
 * (Remote Property Injection); gesammelt wird in einer Map.
 */
export function normalizeMetadata(input: unknown): Record<string, string> | undefined {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;
  const entries = Object.entries(input as Record<string, unknown>);
  if (!entries.length) return undefined;

  const result = new Map<string, string>();
  for (const [key, value] of entries) {
    if (result.size >= METADATA_MAX_ENTRIES) break;
    if (!METADATA_KEY_PATTERN.test(key) || FORBIDDEN_KEYS.has(key)) continue;
    if (typeof value === 'string') {
      result.set(key, value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      result.set(key, String(value));
    }
  }
  return result.size ? Object.fromEntries(result) : undefined;
}

export function buildMetadata(
  user: AuthUser | undefined,
  provided: Record<string, string> | undefined,
  intent: MetadataIntent,
): Record<string, string> {
  // Vom Client gelieferte Werte zuerst, Serverwerte danach: reservierte
  // Schlüssel (userId, userEmail, tenantId, intent) kann der Client so weder
  // setzen noch überschreiben. Der Webhook ordnet Zahlungen über userId zu.
  const metadata = new Map<string, string>();
  for (const [key, value] of Object.entries(provided ?? {})) {
    if (!RESERVED_METADATA_KEYS.has(key)) metadata.set(key, value);
  }
  metadata.set('intent', intent);
  if (user?.id) metadata.set('userId', user.id);
  if (user?.email) metadata.set('userEmail', user.email);

  return Object.fromEntries(metadata);
}
