/**
 * ------------------------------------------------------------
 * Origin Utilities
 * ------------------------------------------------------------
 *
 * Reine Hilfsfunktionen (ohne Express-/Logger-Abhängigkeit) für
 * CORS-Allowlists und die Origin-/Referer-Prüfung des CSRF-Schutzes.
 */

/**
 * Normalisiert einen Origin-String auf `scheme://host[:port]` in Kleinbuchstaben.
 * Gibt `null` zurück, wenn der Wert kein gültiger http(s)-Origin ist
 * (inklusive des Literal-Origins "null").
 */
export function normalizeOrigin(value: string | undefined | null): string | null {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Liest eine kommagetrennte Origin-Liste (z. B. aus einer Umgebungsvariable)
 * und gibt nur gültige, normalisierte Origins zurück. `*` wird bewusst verworfen.
 */
export function parseOriginList(raw: string | undefined | null): string[] {
  if (!raw) return [];
  const out = new Set<string>();
  for (const part of raw.split(',')) {
    const origin = normalizeOrigin(part);
    if (origin) out.add(origin);
  }
  return [...out];
}

/**
 * Sucht den Request-Origin in einer Allowlist und gibt den Eintrag
 * **aus der Allowlist** zurück (nie den Request-Wert selbst).
 */
export function findAllowedOrigin(
  originHeader: string | undefined,
  allowList: readonly string[],
): string | undefined {
  const requested = normalizeOrigin(originHeader);
  if (!requested) return undefined;
  const match = allowList.find((entry) => normalizeOrigin(entry) === requested);
  return match ? (normalizeOrigin(match) ?? undefined) : undefined;
}

/**
 * Ermittelt den Origin der Anfrage aus dem `Origin`-Header bzw. – falls dieser
 * fehlt – aus dem `Referer`-Header. Gibt `null` zurück, wenn beides fehlt
 * oder ungültig ist.
 */
export function requestSourceOrigin(
  originHeader: string | undefined,
  refererHeader: string | undefined,
): string | null {
  if (originHeader !== undefined) return normalizeOrigin(originHeader);
  return normalizeOrigin(refererHeader);
}

/**
 * Entscheidet, ob eine zustandsändernde Anfrage nach ihrer Herkunft zulässig ist
 * (OWASP "Verifying Origin With Standard Headers").
 *
 * - Origin bzw. Referer vorhanden: zulässig nur, wenn der normalisierte Wert in
 *   `allowed` steht. Der Literal-Origin "null" und ungültige Werte sind nie zulässig.
 * - Beide Header fehlen: zulässig nur ohne Cookie (Server-zu-Server, Bearer/API-Key).
 *   Ein Browser mit Cookie sendet bei nicht-GET-Anfragen immer Origin.
 * - Leere Allowlist: nie zulässig, wenn eine Herkunft angegeben ist (fail-closed).
 */
export function isAllowedMutationSource(input: {
  origin: string | undefined;
  referer: string | undefined;
  hasCookie: boolean;
  allowed: ReadonlySet<string>;
}): boolean {
  const { origin, referer, hasCookie, allowed } = input;
  if (origin === undefined && referer === undefined) return !hasCookie;
  const source = requestSourceOrigin(origin, referer);
  if (!source) return false;
  return allowed.has(source);
}
