import type { Router } from 'express';
import afkRouter from '@/api/routers/afk.router';
import aiRouter from '@/api/routers/ai.router';
import apiKeyRouter from '@/api/routers/apiKey.router';
import blogRouter from '@/api/routers/blog.router';
import bugRouter from '@/api/routers/bug.router';
import categoryRouter from '@/api/routers/category.router';
import chatRouter from '@/api/routers/chat.router';
import commentRouter from '@/api/routers/comment.router';
import companyRouter from '@/api/routers/company.router';
import developerProgramRouter from '@/api/routers/developerProgram.router';
import favoriteRouter from '@/api/routers/favorite.router';
import feedbackRouter from '@/api/routers/feedback.router';
import fileRouter from '@/api/routers/file.router';
import groupRouter from '@/api/routers/group.router';
import invoiceRouter from '@/api/routers/invoice.router';
import logRouter from '@/api/routers/log.router';
import newsletterRouter from '@/api/routers/newsletter.router';
import orderRouter from '@/api/routers/order.router';
import organizationRouter from '@/api/routers/organization.router';
import paymentRouter from '@/api/routers/payment.router';
import productRouter from '@/api/routers/product.router';
import projectRouter from '@/api/routers/project.router';
import roleRouter from '@/api/routers/role.router';
import subscriberRouter from '@/api/routers/subscriber.router';
import tagRouter from '@/api/routers/tag.router';
import taskRouter from '@/api/routers/task.router';
import teamRouter from '@/api/routers/team.router';
import ticketRouter from '@/api/routers/ticket.router';
import userRouter from '@/api/routers/user.router';

export interface ApiRoute {
  path: string;
  router: Router;
}

export const crudRoutes: readonly ApiRoute[] = [
  { path: '/api/v1/afk', router: afkRouter },
  { path: '/api/v1/ai', router: aiRouter },
  { path: '/api/v1/api-keys', router: apiKeyRouter },
  { path: '/api/v1/blogs', router: blogRouter },
  { path: '/api/v1/bugs', router: bugRouter },
  { path: '/api/v1/categories', router: categoryRouter },
  { path: '/api/v1/chats', router: chatRouter },
  { path: '/api/v1/comments', router: commentRouter },
  { path: '/api/v1/companies', router: companyRouter },
  { path: '/api/v1/developer-programs', router: developerProgramRouter },
  { path: '/api/v1/favorites', router: favoriteRouter },
  { path: '/api/v1/feedbacks', router: feedbackRouter },
  { path: '/api/v1/files', router: fileRouter },
  { path: '/api/v1/groups', router: groupRouter },
  { path: '/api/v1/invoices', router: invoiceRouter },
  { path: '/api/v1/logs', router: logRouter },
  { path: '/api/v1/newsletters', router: newsletterRouter },
  { path: '/api/v1/orders', router: orderRouter },
  { path: '/api/v1/organizations', router: organizationRouter },
  { path: '/api/v1/payments', router: paymentRouter },
  { path: '/api/v1/products', router: productRouter },
  { path: '/api/v1/projects', router: projectRouter },
  { path: '/api/v1/roles', router: roleRouter },
  { path: '/api/v1/subscribers', router: subscriberRouter },
  { path: '/api/v1/tags', router: tagRouter },
  { path: '/api/v1/tasks', router: taskRouter },
  { path: '/api/v1/teams', router: teamRouter },
  { path: '/api/v1/tickets', router: ticketRouter },
  { path: '/api/v1/users', router: userRouter },
];

export default crudRoutes;
