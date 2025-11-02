import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/invoice.controller';

export default createCrudRouter(controller);
