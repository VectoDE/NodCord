import type { Request, Response } from 'express';

import {
  getStatusSummary,
  getLiveness,
  getReadiness,
  getCloudNetStatus,
} from '@/services/monitor.service';
import { safeAsync } from '@/utils/async.util';
import { standardResponse } from '@/utils/response.util';

export const fetchStatusSummary = safeAsync(async (_req: Request, res: Response) => {
  const summary = await getStatusSummary();
  return standardResponse(res, 200, summary, 'Status summary');
});

export const fetchLiveness = safeAsync(async (_req: Request, res: Response) => {
  const snapshot = await getLiveness();
  return standardResponse(res, 200, snapshot, 'Liveness');
});

export const fetchReadiness = safeAsync(async (_req: Request, res: Response) => {
  const snapshot = await getReadiness();
  return standardResponse(res, snapshot?.ok === false ? 503 : 200, snapshot, 'Readiness');
});

export const fetchCloudNetStatus = safeAsync(async (_req: Request, res: Response) => {
  const snapshot = await getCloudNetStatus();
  return standardResponse(res, 200, snapshot, 'CloudNet status');
});

export default Object.freeze({
  fetchStatusSummary,
  fetchLiveness,
  fetchReadiness,
  fetchCloudNetStatus,
});
