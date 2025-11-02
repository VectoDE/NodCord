import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/favorite.controller';

export default createCrudRouter(controller);
