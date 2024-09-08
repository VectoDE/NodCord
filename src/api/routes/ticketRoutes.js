const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/', ticketController.listTickets);

router.get('/:ticketId', ticketController.getTicketDetails);

router.post('/create', ticketController.createTicket);

router.post('/:ticketId/response', ticketController.addTicketResponse);

router.post('/:ticketId/update', ticketController.updateTicket);

router.post('/:ticketId/close', ticketController.closeTicket);

module.exports = router;
