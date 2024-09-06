require('dotenv').config();
const Group = require('../../models/groupModel');
const logger = require('../services/loggerService');

exports.getAllGroups = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const groups = await Group.find(query).populate('members');
    logger.info('Fetched all groups:', { count: groups.length });

    res.render('dashboard/groups/groups', {
      groups,
      errorMessage: null,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  } catch (err) {
    logger.error('Error fetching all groups:', err);

    res.render('dashboard/groups/groups', {
      groups: [],
      errorMessage: 'Error fetching groups',
      errorstack: err.stack,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members');
    if (!group) {
      logger.warn('Group not found:', { groupId: req.params.id });
      if (process.env.NODE_ENV === 'production') {
        return res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/groups`);
      } else if (process.env.NODE_ENV === 'development') {
        return res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/groups`);
      }
    }

    logger.info('Group fetched by ID:', { groupId: req.params.id });

    res.render('dashboard/groups/editGroup', {
      group,
      errorMessage: null,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  } catch (err) {
    logger.error('Error fetching group by ID:', err);

    if (process.env.NODE_ENV === 'production') {
      res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/groups`);
    } else if (process.env.NODE_ENV === 'development') {
      res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/groups`);
    }
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const group = new Group({ name, description, members });
    await group.save();

    logger.info('Group created successfully:', { groupId: group._id });

    if (process.env.NODE_ENV === 'production') {
      res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/groups`);
    } else if (process.env.NODE_ENV === 'development') {
      res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/groups`);
    }
  } catch (err) {
    logger.error('Error creating group:', err);

    res.render('dashboard/groups/createGroup', {
      errorMessage: 'Error creating group',
      errorstack: err.stack,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const group = await Group.findByIdAndUpdate(req.params.id, { name, description, members }, { new: true });
    if (!group) {
      logger.warn('Group not found for update:', { groupId: req.params.id });
      if (process.env.NODE_ENV === 'production') {
        return res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/groups`);
      } else if (process.env.NODE_ENV === 'development') {
        return res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/groups`);
      }
    }

    logger.info('Group updated successfully:', { groupId: req.params.id });

    if (process.env.NODE_ENV === 'production') {
      res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/groups`);
    } else if (process.env.NODE_ENV === 'development') {
      res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/groups`);
    }
  } catch (err) {
    logger.error('Error updating group:', err);

    res.render('dashboard/groups/editGroup', {
      group: req.body,
      errorMessage: 'Error updating group',
      errorstack: err.stack,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
    });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      logger.warn('Group not found for deletion:', { groupId: req.params.id });
      if (process.env.NODE_ENV === 'production') {
        return res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/groups`);
      } else if (process.env.NODE_ENV === 'development') {
        return res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/groups`);
      }
    }

    logger.info('Group deleted successfully:', { groupId: req.params.id });

    if (process.env.NODE_ENV === 'production') {
      res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/groups`);
    } else if (process.env.NODE_ENV === 'development') {
      res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/groups`);
    }
  } catch (err) {
    logger.error('Error deleting group:', err);

    if (process.env.NODE_ENV === 'production') {
      res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}/dashboard/groups`);
    } else if (process.env.NODE_ENV === 'development') {
      res.redirect(`${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}:${process.env.CLIENT_PORT}/dashboard/groups`);
    }
  }
};
