const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/ticketController');

// Listet alle Tickets auf
router.get('/', ticketController.listTickets);

// Erstellt ein neues Ticket
router.post('/', ticketController.createTicket);

// Schließt ein Ticket
router.put('/close', ticketController.closeTicket);

// Zeigt Details eines bestimmten Tickets an
router.get('/:ticketId', ticketController.getTicketDetails);

// Aktualisiert ein Ticket
router.put('/update', ticketController.updateTicket);

// Fügt eine Antwort zu einem Ticket hinzu
router.post('/response', ticketController.addTicketResponse);

module.exports = router;