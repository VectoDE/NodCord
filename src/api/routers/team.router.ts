import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/team.controller';

export default createCrudRouter(controller);
