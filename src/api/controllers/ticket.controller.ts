const Ticket = require('../../models/ticketModel');
const TicketResponse = require('../../models/ticketModel');
const logger = require('../../services/logger.service');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.listTickets = async (req, res) => {
  try {
    const { guildId } = req.query;
    const query = guildId ? { guildId } : {};

    const tickets = await Ticket.find(query);
    logger.info('Fetched tickets:', {
      guildId,
      count: tickets.length,
    });

    const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      tickets
    });
  } catch (error) {
    logger.error('Error listing tickets:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error listing tickets',
      error: error.message
    });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const { guildId, userId, title, description } = req.body;
    if (!userId || !title) {
      logger.warn('Missing required fields for creating ticket:', { userId, title });
      const redirectUrl = `${getBaseUrl()}/dashboard/tickets/create`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'User ID and Title are required'
      });
    }

    const newTicket = new Ticket({ guildId, userId, title, description });
    await newTicket.save();

    logger.info('Created new ticket:', { ticketId: newTicket._id, userId });
    const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Ticket created successfully',
      ticket: newTicket
    });
  } catch (error) {
    logger.error('Error creating ticket:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tickets/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error creating ticket',
      error: error.message
    });
  }
};

exports.closeTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) {
      logger.warn('Ticket ID is missing in request');
      const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Ticket ID is required'
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      logger.warn('Ticket not found:', { ticketId });
      const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.status = 'closed';
    await ticket.save();
    logger.info('Closed ticket:', { ticketId });

    const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Ticket closed successfully',
      ticket
    });
  } catch (error) {
    logger.error('Error closing ticket:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error closing ticket',
      error: error.message
    });
  }
};

exports.getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) {
      logger.warn('Ticket ID is missing in request');
      const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Ticket ID is required'
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      logger.warn('Ticket not found:', { ticketId });
      const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Ticket not found'
      });
    }

    const responses = await TicketResponse.find({ ticketId });
    logger.info('Fetched ticket details:', {
      ticketId,
      responsesCount: responses.length,
    });

    const redirectUrl = `${getBaseUrl()}/dashboard/tickets/${ticketId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      ticket,
      responses
    });
  } catch (error) {
    logger.error('Error fetching ticket details:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching ticket details',
      error: error.message
    });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const { ticketId, title, description, status } = req.body;
    if (!ticketId) {
      logger.warn('Ticket ID is missing in request');
      const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Ticket ID is required'
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      logger.warn('Ticket not found for update:', { ticketId });
      const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Ticket not found'
      });
    }

    if (title) ticket.title = title;
    if (description) ticket.description = description;
    if (status) ticket.status = status;

    await ticket.save();
    logger.info('Updated ticket:', { ticketId });

    const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    logger.error('Error updating ticket:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error updating ticket',
      error: error.message
    });
  }
};

exports.addTicketResponse = async (req, res) => {
  try {
    const { ticketId, userId, response } = req.body;
    if (!ticketId || !userId || !response) {
      logger.warn('Missing required fields for adding response:', { ticketId, userId });
      const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Ticket ID, User ID, and Response are required'
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      logger.warn('Ticket not found for response:', { ticketId });
      const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status === 'closed') {
      logger.warn('Attempted to add response to a closed ticket:', { ticketId });
      const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Cannot add response to a closed ticket'
      });
    }

    const newResponse = new TicketResponse({ ticketId, userId, response });
    await newResponse.save();

    logger.info('Added response to ticket:', { ticketId, responseId: newResponse._id });
    const redirectUrl = `${getBaseUrl()}/dashboard/tickets/${ticketId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Response added successfully',
      response: newResponse
    });
  } catch (error) {
    logger.error('Error adding response to ticket:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/tickets`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error adding response to ticket',
      error: error.message
    });
  }
};
