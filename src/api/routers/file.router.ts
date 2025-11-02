import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/file.controller';

export default createCrudRouter(controller);
