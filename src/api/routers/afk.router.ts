import { Router } from 'express';

import {
  upsertAfkStatus,
  deleteAfkStatus,
  getAfkStatus,
  listGuildAfkStatuses,
} from '@/api/controllers/afk.controller';

const router = Router();

router.put('/:guildId/:userId', upsertAfkStatus);
router.delete('/:guildId/:userId', deleteAfkStatus);
router.get('/:guildId/:userId', getAfkStatus);
router.get('/:guildId', listGuildAfkStatuses);

export default router;
