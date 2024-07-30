const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// Route zum Auflisten aller Tickets
router.get('/', ticketController.listTickets);

// Route zum Erstellen eines neuen Tickets
router.post('/', ticketController.createTicket);

// Route zum Schließen eines Tickets
router.post('/close', ticketController.closeTicket);

module.exports = router;
