import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/project.controller';

export default createCrudRouter(controller);
