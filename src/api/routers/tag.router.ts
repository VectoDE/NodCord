import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/tag.controller';

export default createCrudRouter(controller);
