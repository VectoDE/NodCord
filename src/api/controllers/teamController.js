const Team = require('../../models/teamModel');
const logger = require('../services/loggerService');

const listTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    logger.info('Fetched teams:', { count: teams.length });
    res.status(200).json(teams);
  } catch (error) {
    logger.error('Failed to list teams:', error);
    res.status(500).json({ error: error.message });
  }
};

const createTeam = async (req, res) => {
  try {
    const { name, description, members, type, logo } = req.body;
    if (!name) {
      logger.warn('Name is missing in create team request:', {
        body: req.body,
      });
      return res.status(400).json({ error: 'Name is required' });
    }

    const newTeam = new Team({
      name,
      description,
      members,
      type,
      logo,
    });

    await newTeam.save();
    logger.info('Created new team:', { teamId: newTeam._id, name });
    res.status(201).json(newTeam);
  } catch (error) {
    logger.error('Failed to create team:', error);
    res.status(500).json({ error: error.message });
  }
};

const getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId) {
      logger.warn('Team ID is missing in get team details request:', {
        params: req.params,
      });
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const team = await Team.findById(teamId).populate('members');
    if (!team) {
      logger.warn('Team not found:', { teamId });
      return res.status(404).json({ error: 'Team not found' });
    }

    logger.info('Fetched team details:', { teamId });
    res.status(200).json(team);
  } catch (error) {
    logger.error('Failed to get team details:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { teamId, name, description, members, status, type, logo } = req.body;
    if (!teamId) {
      logger.warn('Team ID is missing in update team request:', {
        body: req.body,
      });
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      logger.warn('Team not found for update:', { teamId });
      return res.status(404).json({ error: 'Team not found' });
    }

    if (name) team.name = name;
    if (description) team.description = description;
    if (members) team.members = members;
    if (status) team.status = status;
    if (type) team.type = type;
    if (logo) team.logo = logo;

    await team.save();
    logger.info('Updated team:', { teamId });
    res.status(200).json(team);
  } catch (error) {
    logger.error('Failed to update team:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    if (!teamId) {
      logger.warn('Team ID is missing in delete team request:', {
        body: req.body,
      });
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      logger.warn('Team not found for deletion:', { teamId });
      return res.status(404).json({ error: 'Team not found' });
    }

    await team.remove();
    logger.info('Deleted team:', { teamId });
    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete team:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  listTeams,
  createTeam,
  getTeamDetails,
  updateTeam,
  deleteTeam,
};
