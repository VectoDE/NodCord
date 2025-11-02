import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/chat.controller';

export default createCrudRouter(controller);
