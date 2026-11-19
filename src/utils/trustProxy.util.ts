/**
 * Wert für Express `trust proxy` aus TRUST_PROXY_HOPS.
 *
 * Anzahl der Reverse-Proxys vor der App (z. B. 1 = nur nginx,
 * 2 = Cloudflare + nginx). Ohne gültigen Wert gilt 1 (bisheriges Verhalten).
 * 0 schaltet das Vertrauen ab. Nur ganze Zahlen 0-10, damit kein
 * Freitext wie "true" alle X-Forwarded-For-Einträge vertrauenswürdig macht.
 */
export function resolveTrustProxyHops(
  raw: string | undefined = process.env['TRUST_PROXY_HOPS'],
): number {
  const value = raw?.trim();
  if (!value || !/^\d{1,2}$/.test(value)) return 1;
  const hops = Number(value);
  return hops <= 10 ? hops : 1;
}
