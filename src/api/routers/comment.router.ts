import { createCrudRouter } from '@/api/shared/crud.factory';
import controller from '@/api/controllers/comment.controller';

export default createCrudRouter(controller);
