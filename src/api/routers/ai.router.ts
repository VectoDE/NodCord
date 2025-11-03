import { Router } from 'express';

import {
  createChatCompletion,
  getChatSession,
  listChatSessions,
} from '@/api/controllers/ai.controller';
import { requireApiKey } from '@/middlewares/apiKeyMiddleware';
import {
  type ValidatorFn,
  validationMiddleware,
  v,
} from '@/middlewares/validation.middleware';

const router = Router();

const optional =
  <T>(validator: ValidatorFn<T>): ValidatorFn<T | undefined> =>
  (value): value is T | undefined =>
    value === undefined || validator(value);

const optionalNullableJson: ValidatorFn =
  (value): value is Record<string, unknown> | unknown[] | string | number | boolean | null | undefined =>
    value === undefined ||
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    (typeof value === 'object' && value !== null);

const numberString: ValidatorFn<string> = (value): value is string =>
  typeof value === 'string' && /^\d+$/.test(value);

const chatValidator = validationMiddleware({
  body: {
    prompt: v.string(1, 4000),
    sessionId: optional(v.string(1, 64)),
    guildId: optional(v.string(1, 64)),
    channelId: optional(v.string(1, 64)),
    userId: optional(v.string(1, 64)),
    referenceId: optional(v.string(1, 128)),
    temperature: optional((value): value is number => typeof value === 'number'),
    maxTokens: optional((value): value is number => typeof value === 'number'),
    metadata: optionalNullableJson,
  },
});

const listValidator = validationMiddleware({
  query: {
    guildId: optional(v.string(1, 64)),
    userId: optional(v.string(1, 64)),
    limit: optional(numberString),
  },
});

const sessionValidator = validationMiddleware({
  params: {
    id: v.string(1, 128),
  },
});

router.post('/chat', requireApiKey(), chatValidator, createChatCompletion);
router.get('/sessions', requireApiKey(), listValidator, listChatSessions);
router.get('/sessions/:id', requireApiKey(), sessionValidator, getChatSession);

export default router;
