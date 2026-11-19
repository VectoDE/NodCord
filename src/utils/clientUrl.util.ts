import { normalizeOrigin } from '@/utils/origin.util';

/**
 * Öffentliche Adresse für das Start-Log. Ist CLIENT_BASE_URL eine vollständige
 * URL (z. B. http://localhost:4000), wird sie unverändert genutzt; sonst wird
 * sie aus CLIENT_HTTPS (true/https), Host und Port zusammengesetzt.
 */
export function resolveClientPublicUrl(
  port: number,
  env: Record<string, string | undefined> = process.env,
): string {
  const rawBase = env['CLIENT_BASE_URL']?.trim() ?? '';
  const origin = /^https?:\/\//i.test(rawBase) ? normalizeOrigin(rawBase) : null;
  if (origin) return origin;

  const httpsFlag = env['CLIENT_HTTPS']?.trim().toLowerCase();
  const protocol = httpsFlag === 'true' || httpsFlag === 'https' ? 'https' : 'http';
  // Nur der Hostname: Benutzerdaten, Pfad und ein mitgegebener Port fallen weg.
  const host = rawBase.replace(/^.*@/, '').replace(/[/?#].*$/, '').replace(/:\d+$/, '') || 'localhost';
  return `${protocol}://${host}:${port}`;
}
