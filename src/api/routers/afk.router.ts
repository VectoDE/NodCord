import { Router } from 'express';

import {
  upsertAfkStatus,
  deleteAfkStatus,
  getAfkStatus,
  listGuildAfkStatuses,
} from '@/api/controllers/afk.controller';
import {
  validationMiddleware,
  v,
  type ValidatorFn,
} from '@/middlewares/validation.middleware';

const router = Router();

const paramsValidator = validationMiddleware({
  params: {
    guildId: v.string(1, 64),
    userId: v.string(1, 64),
  },
});

const optionalString =
  (validator: ValidatorFn<string>): ValidatorFn<string | undefined> =>
  (value): value is string | undefined =>
    value === undefined || validator(value);

const bodyValidator = validationMiddleware({
  body: {
    message: optionalString(v.string(0, 500)),
  },
});

const optionalNumberString: ValidatorFn<string | undefined> = (value): value is string | undefined =>
  value === undefined || (typeof value === 'string' && /^\d+$/.test(value));

const listValidator = validationMiddleware({
  params: {
    guildId: v.string(1, 64),
  },
  query: {
    limit: optionalNumberString,
  },
});

router.put('/:guildId/:userId', paramsValidator, bodyValidator, upsertAfkStatus);
router.delete('/:guildId/:userId', paramsValidator, deleteAfkStatus);
router.get('/:guildId/:userId', paramsValidator, getAfkStatus);
router.get('/:guildId', listValidator, listGuildAfkStatuses);

export default router;
