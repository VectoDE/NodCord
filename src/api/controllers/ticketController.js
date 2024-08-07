const Ticket = require('../../models/ticketModel');
const TicketResponse = require('../../models/ticketResponseModel');

const listTickets = async (req, res) => {
  try {
    const guildId = req.query.guildId;
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

const createTicket = async (req, res) => {
  try {
    const { guildId, userId, title, description } = req.body;
    if (!guildId || !userId || !title) {
      return res
        .status(400)
        .json({ error: 'Guild ID, User ID, and Title are required' });
    }

    const newTicket = new Ticket({
      guildId,
      userId,
      title,
      description,
    });

    await newTicket.save();

    res.status(201).json(newTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

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

const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const responses = await TicketResponse.find({ ticketId });

    res.status(200).json({ ticket, responses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { ticketId, title, description, status } = req.body;
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (status) ticket.status = status;

    await ticket.save();

    res.status(200).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const addTicketResponse = async (req, res) => {
  try {
    const { ticketId, userId, response } = req.body;
    if (!ticketId || !userId || !response) {
      return res
        .status(400)
        .json({ error: 'Ticket ID, User ID, and Response are required' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === 'closed') {
      return res
        .status(400)
        .json({ error: 'Cannot add response to a closed ticket' });
    }

    const newResponse = new TicketResponse({
      ticketId,
      userId,
      response,
    });

    await newResponse.save();

    res.status(201).json(newResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listTickets,
  createTicket,
  closeTicket,
  getTicketDetails,
  updateTicket,
  addTicketResponse,
};
