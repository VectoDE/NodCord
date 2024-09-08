require('dotenv').config();
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');
const logger = require('../services/loggerService');
const Team = require('../../models/teamModel');

exports.listTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    logger.info('Fetched teams:', { count: teams.length });
    const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      teams
    });
  } catch (error) {
    logger.error('Failed to list teams:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching teams',
      error: error.message
    });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const { name, description, members, type, logo } = req.body;
    if (!name) {
      logger.warn('Name is missing in create team request:', { body: req.body });
      const redirectUrl = `${getBaseUrl()}/dashboard/teams/create`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Name is required'
      });
    }

    const newTeam = new Team({ name, description, members, type, logo });
    await newTeam.save();
    logger.info('Created new team:', { teamId: newTeam._id, name });
    const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Team created successfully',
      team: newTeam
    });
  } catch (error) {
    logger.error('Failed to create team:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/teams/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error creating team',
      error: error.message
    });
  }
};

exports.getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId) {
      logger.warn('Team ID is missing in get team details request:', { params: req.params });
      const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Team ID is required'
      });
    }

    const team = await Team.findById(teamId).populate('members');
    if (!team) {
      logger.warn('Team not found:', { teamId });
      const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Team not found'
      });
    }

    logger.info('Fetched team details:', { teamId });
    const redirectUrl = `${getBaseUrl()}/dashboard/teams/${teamId}`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      team
    });
  } catch (error) {
    logger.error('Failed to get team details:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error fetching team details',
      error: error.message
    });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const { teamId, name, description, members, status, type, logo } = req.body;
    if (!teamId) {
      logger.warn('Team ID is missing in update team request:', { body: req.body });
      const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Team ID is required'
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      logger.warn('Team not found for update:', { teamId });
      const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Team not found'
      });
    }

    if (name) team.name = name;
    if (description) team.description = description;
    if (members) team.members = members;
    if (status) team.status = status;
    if (type) team.type = type;
    if (logo) team.logo = logo;

    await team.save();
    logger.info('Updated team:', { teamId });
    const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Team updated successfully',
      team
    });
  } catch (error) {
    logger.error('Failed to update team:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/teams/edit`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error updating team',
      error: error.message
    });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    if (!teamId) {
      logger.warn('Team ID is missing in delete team request:', { body: req.body });
      const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Team ID is required'
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      logger.warn('Team not found for deletion:', { teamId });
      const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
      return sendResponse(req, res, redirectUrl, {
        success: false,
        message: 'Team not found'
      });
    }

    await team.remove();
    logger.info('Deleted team:', { teamId });
    const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete team:', error);
    const redirectUrl = `${getBaseUrl()}/dashboard/teams`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Error deleting team',
      error: error.message
    });
  }
};
