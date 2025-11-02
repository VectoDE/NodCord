import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/company.controller';

export default createCrudRouter(controller);
