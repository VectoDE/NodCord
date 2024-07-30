const Ticket = require('../../models/ticketModel');

// Listet alle Tickets auf
const listTickets = async (req, res) => {
    try {
        const guildId = req.query.guildId; // Die Guild-ID wird als Query-Parameter erwartet
        if (!guildId) {
            return res.status(400).json({ error: 'Guild ID is required' });
        }

        const tickets = await Ticket.find({ guildId });

        res.status(200).json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Erstellt ein neues Ticket
const createTicket = async (req, res) => {
    try {
        const { guildId, userId, title, description } = req.body;
        if (!guildId || !userId || !title) {
            return res.status(400).json({ error: 'Guild ID, User ID, and Title are required' });
        }

        const newTicket = new Ticket({
            guildId,
            userId,
            title,
            description
        });

        await newTicket.save();

        res.status(201).json(newTicket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Schließt ein Ticket
const closeTicket = async (req, res) => {
    try {
        const { ticketId } = req.body;
        if (!ticketId) {
            return res.status(400).json({ error: 'Ticket ID is required' });
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        ticket.status = 'closed';
        await ticket.save();

        res.status(200).json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    listTickets,
    createTicket,
    closeTicket
};
