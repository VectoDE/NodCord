import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/group.controller';

export default createCrudRouter(controller);
