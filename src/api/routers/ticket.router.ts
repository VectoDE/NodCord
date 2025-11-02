import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/ticket.controller';

export default createCrudRouter(controller);
