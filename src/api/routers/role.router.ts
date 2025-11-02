import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/role.controller';

export default createCrudRouter(controller);
