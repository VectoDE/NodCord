import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/feedback.controller';

export default createCrudRouter(controller);
