import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/organization.controller';

export default createCrudRouter(controller);
