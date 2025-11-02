import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/user.controller';

export default createCrudRouter(controller);
