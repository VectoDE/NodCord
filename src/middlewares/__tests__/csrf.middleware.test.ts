import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';

import { csrfIssueToken, csrfVerify } from '@/middlewares/csrf.middleware';
import { isAllowedMutationSource } from '@/utils/origin.util';

jest.mock('@/services/logger.service', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const UA = 'jest-agent';
const TRUSTED = 'https://app.example.com';

function buildApp(): express.Express {
  const app = express();
  app.use(cookieParser());
  app.use(csrfIssueToken());
  app.use(csrfVerify({ trustedOrigins: [TRUSTED] }));
  app.get('/token', (_req, res) => {
    res.json({ token: res.locals['csrfToken'] as string });
  });
  app.post('/action', (_req, res) => {
    res.status(204).end();
  });
  return app;
}

describe('isAllowedMutationSource', () => {
  const allowed = new Set(['https://api.example.com', TRUSTED]);
  const check = (origin: string | undefined, referer: string | undefined, hasCookie = true) =>
    isAllowedMutationSource({ origin, referer, hasCookie, allowed });

  it('accepts listed origins and referers of listed origins', () => {
    expect(check(TRUSTED, undefined)).toBe(true);
    expect(check(undefined, `${TRUSTED}/page?x=1`)).toBe(true);
  });

  it('rejects foreign, "null" and malformed origins', () => {
    expect(check('https://evil.example', undefined)).toBe(false);
    expect(check('null', undefined)).toBe(false);
    expect(check('api.example.com', undefined)).toBe(false);
    expect(check('', undefined)).toBe(false);
    // Origin hat Vorrang vor Referer
    expect(check('https://evil.example', TRUSTED)).toBe(false);
  });

  it('allows a missing source only without cookies', () => {
    expect(check(undefined, undefined, true)).toBe(false);
    expect(check(undefined, undefined, false)).toBe(true);
  });

  it('is fail-closed with an empty allowlist', () => {
    expect(
      isAllowedMutationSource({ origin: TRUSTED, referer: undefined, hasCookie: true, allowed: new Set() }),
    ).toBe(false);
  });
});

describe('csrfVerify origin check', () => {
  let server: Server;
  let selfOrigin: string;

  beforeAll((done) => {
    server = buildApp().listen(0, '127.0.0.1', () => {
      selfOrigin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(() => done());
  });

  async function post(origin?: string): Promise<number> {
    const tokenRes = await request(server).get('/token').set('User-Agent', UA);
    const token = (tokenRes.body as { token: string }).token;
    let req = request(server)
      .post('/action')
      .set('User-Agent', UA)
      .set('Cookie', `csrf_token=${token}`)
      .set('x-csrf-token', token);
    if (origin !== undefined) req = req.set('Origin', origin);
    return (await req).status;
  }

  it('passes a same-origin request with a valid token', async () => {
    expect(await post(selfOrigin)).toBe(204);
  });

  it('passes a trusted cross origin with a valid token', async () => {
    expect(await post(TRUSTED)).toBe(204);
  });

  it('rejects a foreign origin even with a valid token', async () => {
    expect(await post('https://evil.example')).toBe(403);
  });

  it('rejects the "null" origin', async () => {
    expect(await post('null')).toBe(403);
  });

  it('rejects a cookie request without Origin and Referer', async () => {
    expect(await post()).toBe(403);
  });
});
