import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/newsletter.controller';

export default createCrudRouter(controller);
