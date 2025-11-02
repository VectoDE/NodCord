import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/category.controller';

export default createCrudRouter(controller);
