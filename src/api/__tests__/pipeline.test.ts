import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

import express from 'express';
import request from 'supertest';

import { applyCorsAndRateLimits } from '@/api/pipeline';
import { stopRateLimiterSweeper } from '@/middlewares/rateLimiter.middleware';

jest.mock('@/services/logger.service', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

const ORIGIN = 'https://nodcord.hauknetz.de';
const NAMESPACE = 'test-pipeline';

describe('applyCorsAndRateLimits (#91)', () => {
  let server: Server;

  beforeAll((done) => {
    const app = express();
    applyCorsAndRateLimits(app, { corsOrigins: [ORIGIN], rateLimiterNamespace: NAMESPACE });
    app.get('/ping', (_req, res) => {
      res.json({ ok: true });
    });
    server = app.listen(0, '127.0.0.1', () => done());
  });

  afterAll((done) => {
    stopRateLimiterSweeper(NAMESPACE);
    server.close(() => done());
  });

  it('sends Access-Control-Allow-Origin on 429 for an allowed origin', async () => {
    const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    let throttled: request.Response | undefined;
    // Burst des Token-Buckets ist 30; spätestens danach kommt 429.
    for (let i = 0; i < 40 && !throttled; i++) {
      const res = await request(base).get('/ping').set('Origin', ORIGIN);
      if (res.status === 429) throttled = res;
      else expect(res.status).toBe(200);
    }
    expect(throttled).toBeDefined();
    expect(throttled?.headers['access-control-allow-origin']).toBe(ORIGIN);
  });
});

describe('routes registered later on a router mounted before 404 (#89)', () => {
  it('stays reachable', async () => {
    // Gleiches Muster wie in src/api/app.ts: Router vor dem 404-Handler,
    // Routen kommen erst später dazu (startMonitor beim Serverstart).
    const app = express();
    const monitorRouter = express.Router();
    app.use(monitorRouter);
    app.use((_req, res) => {
      res.status(404).json({ error: 'Not Found' });
    });

    monitorRouter.get('/system/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    const res = await request(app).get('/system/health');
    expect(res.status).toBe(200);
    expect(await request(app).get('/system/unknown').then((r) => r.status)).toBe(404);
  });
});
