const Ticket = require('../../models/ticketModel');
const TicketResponse = require('../../models/ticketResponseModel');
const logger = require('../services/loggerService');

const listTickets = async (req, res) => {
  try {
    const guildId = req.query.guildId;
    if (!guildId) {
      logger.warn('Guild ID is missing in request');
      return res.status(400).json({ error: 'Guild ID is required' });
    }

    const tickets = await Ticket.find({ guildId });
    logger.info('Fetched tickets for guild:', {
      guildId,
      count: tickets.length,
    });

    res.status(200).json(tickets);
  } catch (error) {
    logger.error('Failed to list tickets:', error);
    res.status(500).json({ error: error.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const { guildId, userId, title, description } = req.body;
    if (!guildId || !userId || !title) {
      logger.warn('Missing required fields for creating ticket:', {
        guildId,
        userId,
        title,
      });
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
    logger.info('Created new ticket:', {
      ticketId: newTicket._id,
      guildId,
      userId,
    });

    res.status(201).json(newTicket);
  } catch (error) {
    logger.error('Failed to create ticket:', error);
    res.status(500).json({ error: error.message });
  }
};

const closeTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) {
      logger.warn('Ticket ID is missing in request');
      return res.status(400).json({ error: 'Ticket ID is required' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      logger.warn('Ticket not found:', { ticketId });
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.status = 'closed';
    await ticket.save();
    logger.info('Closed ticket:', { ticketId });

    res.status(200).json(ticket);
  } catch (error) {
    logger.error('Failed to close ticket:', error);
    res.status(500).json({ error: error.message });
  }
};

const getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) {
      logger.warn('Ticket ID is missing in request');
      return res.status(400).json({ error: 'Ticket ID is required' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      logger.warn('Ticket not found:', { ticketId });
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const responses = await TicketResponse.find({ ticketId });
    logger.info('Fetched ticket details:', {
      ticketId,
      responsesCount: responses.length,
    });

    res.status(200).json({ ticket, responses });
  } catch (error) {
    logger.error('Failed to get ticket details:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { ticketId, title, description, status } = req.body;
    if (!ticketId) {
      logger.warn('Ticket ID is missing in request');
      return res.status(400).json({ error: 'Ticket ID is required' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      logger.warn('Ticket not found for update:', { ticketId });
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (status) ticket.status = status;

    await ticket.save();
    logger.info('Updated ticket:', { ticketId });

    res.status(200).json(ticket);
  } catch (error) {
    logger.error('Failed to update ticket:', error);
    res.status(500).json({ error: error.message });
  }
};

const addTicketResponse = async (req, res) => {
  try {
    const { ticketId, userId, response } = req.body;
    if (!ticketId || !userId || !response) {
      logger.warn('Missing required fields for adding response:', {
        ticketId,
        userId,
      });
      return res
        .status(400)
        .json({ error: 'Ticket ID, User ID, and Response are required' });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      logger.warn('Ticket not found for response:', { ticketId });
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === 'closed') {
      logger.warn('Attempted to add response to a closed ticket:', {
        ticketId,
      });
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
    logger.info('Added response to ticket:', {
      ticketId,
      responseId: newResponse._id,
    });

    res.status(201).json(newResponse);
  } catch (error) {
    logger.error('Failed to add ticket response:', error);
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
