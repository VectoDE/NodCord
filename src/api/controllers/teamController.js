const Team = require('../../models/teamModel');

const listTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const createTeam = async (req, res) => {
  try {
    const { name, description, members, type, logo } = req.body;
    if (!name) {
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
    res.status(201).json(newTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const team = await Team.findById(teamId).populate('members');
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(200).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { teamId, name, description, members, status, type, logo } = req.body;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (name) team.name = name;
    if (description) team.description = description;
    if (members) team.members = members;
    if (status) team.status = status;
    if (type) team.type = type;
    if (logo) team.logo = logo;

    await team.save();
    res.status(200).json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await team.remove();
    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error(error);
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
