import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/product.controller';

export default createCrudRouter(controller);
