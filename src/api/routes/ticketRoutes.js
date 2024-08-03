const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/', ticketController.listTickets);

router.post('/', ticketController.createTicket);

router.put('/close', ticketController.closeTicket);

router.get('/:ticketId', ticketController.getTicketDetails);

router.put('/update', ticketController.updateTicket);

router.post('/response', ticketController.addTicketResponse);

module.exports = router;
