import express from 'express';
import request from 'supertest';

import { resolveClientIp } from '@/utils/clientIp.util';
import { resolveTrustProxyHops } from '@/utils/trustProxy.util';

/** Kleine App, die die ermittelte Client-IP zurückgibt. */
function appWithHops(hops: string): express.Express {
  const app = express();
  app.set('trust proxy', resolveTrustProxyHops(hops));
  app.get('/ip', (req, res) => {
    res.json({ ip: resolveClientIp(req) ?? null });
  });
  return app;
}

async function ipFor(hops: string, xff?: string): Promise<string> {
  const req = request(appWithHops(hops)).get('/ip');
  const res = await (xff ? req.set('X-Forwarded-For', xff) : req);
  expect(res.status).toBe(200);
  return (res.body as { ip: string }).ip;
}

const isLoopback = (ip: string): boolean => /^(::ffff:)?127\.0\.0\.1$|^::1$/.test(ip);

describe('resolveClientIp', () => {
  it('ignores X-Forwarded-For when no proxy is trusted', async () => {
    const ip = await ipFor('0', '203.0.113.7');
    expect(isLoopback(ip)).toBe(true);
  });

  it('uses the address added by the single trusted proxy (hops=1)', async () => {
    // Client setzt 6.6.6.6 selbst, der Proxy hängt die echte Adresse an.
    expect(await ipFor('1', '6.6.6.6, 198.51.100.20')).toBe('198.51.100.20');
  });

  it('skips Cloudflare and own proxy (hops=2) and rejects a spoofed left entry', async () => {
    // Kette: gefälscht, echter Client (von Cloudflare angehängt), Cloudflare-Edge (vom eigenen Proxy angehängt)
    expect(await ipFor('2', '6.6.6.6, 198.51.100.20, 162.158.1.1')).toBe('198.51.100.20');
  });

  it('falls back to the socket address when the header is missing', async () => {
    expect(isLoopback(await ipFor('2'))).toBe(true);
  });

  it('returns undefined when neither req.ip nor a socket address exists', () => {
    expect(resolveClientIp({ ip: undefined, socket: {} } as never)).toBeUndefined();
  });
});
