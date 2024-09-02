require('dotenv').config();
const express = require('express');
const router = express.Router();
const cloudnetController = require('../../api/controllers/cloudnetController');
const commentController = require('../../api/controllers/commentController');

const authMiddleware = require('../../api/middlewares/authMiddleware');
const roleMiddleware = require('../../api/middlewares/roleMiddleware');
const betaMiddleware = require('../../api/middlewares/betaMiddleware');

const overviewControl = require('../../api/helpers/overviewControl');

const apiStatusService = require('../../api/services/apiStatusService');
const botStatusService = require('../../api/services/botStatusService');
const dbStatusService = require('../../api/services/dbStatusService');
const logService = require('../../api/services/logService');

const bot = require('../../bot/index');

const User = require('../../models/userModel');
const Role = require('../../models/roleModel');
const Category = require('../../models/categoryModel');
const Ticket = require('../../models/ticketModel');
const BetaKey = require('../../models/betaKeyModel');
const BetaSystem = require('../../models/betaSystemModel');
const ApiKey = require('../../models/apiKeyModel');
const Blog = require('../../models/blogModel');
const Bug = require('../../models/bugModel');
const Company = require('../../models/companyModel');
const Organization = require('../../models/organizationModel');
const Comment = require('../../models/commentModel');
const FileUpload = require('../../models/fileModel');
const Tournament = require('../../models/tournamentModel');
const TournamentMatch = require('../../models/tournamentMatchModel');
const TournamentTeam = require('../../models/tournamentTeamModel');
const Team = require('../../models/teamModel');
const Task = require('../../models/taskModel');
const Tag = require('../../models/tagModel');
const Subscriber = require('../../models/subscriberModel');
const Story = require('../../models/storyModel');
const Project = require('../../models/projectModel');
const Issue = require('../../models/issueModel');
const Group = require('../../models/groupModel');
const Game = require('../../models/gameModel');
const Feedback = require('../../models/feedbackModel');
const Feature = require('../../models/featureModel');
const Favorite = require('../../models/favoriteModel');
const Product = require('../../models/productModel');
const Customer = require('../../models/customerModel');
const CustomerOrders = require('../../models/customerOrderModel');
const Order = require('../../models/orderModel');
const Payment = require('../../models/paymentModel');
const Return = require('../../models/returnModel');

router.use(authMiddleware(true));

// Dashboard Overview
router.get('/', roleMiddleware(['admin', 'moderator']), betaMiddleware.checkBetaSystemStatus, betaMiddleware.checkBetaKeyValidity, async (req, res) => {
  try {
    const users = await User.find();
    const tickets = await Ticket.find();
    const teams = await Team.find();
    const tasks = await Task.find();
    const tags = await Tag.find();
    const subscribers = await Subscriber.find();
    const stories = await Story.find();
    const roles = await Role.find();
    const projects = await Project.find();
    const organizations = await Organization.find();
    const issues = await Issue.find();
    const groups = await Group.find();
    const games = await Game.find();
    const files = await FileUpload.find();
    const feedbacks = await Feedback.find();
    const features = await Feature.find();
    const favorites = await Favorite.find();
    const companies = await Company.find();
    const comments = await Comment.find();
    const categories = await Category.find();
    const bugs = await Bug.find();
    const blogs = await Blog.find();

    const betaKey = await BetaKey.find();
    const apiKey = await ApiKey.find();

    const products = await Product.find();
    const customers = await Customer.find();
    const customerOrders = await CustomerOrders.find();
    const orders = await Order.find();
    const payments = await Payment.find();
    const returns = await Return.find();

    const tournaments = await Tournament.find();
    const tournamentMatch = await TournamentMatch.find();
    const tournamentTeam = await TournamentTeam.find();

    const discordServers = await bot.getServers();
    const discordMembers = await bot.getMembers();

    const botStatus = await botStatusService.getStatus();
    const apiStatus = await apiStatusService.getStatus();
    const dbStatus = await dbStatusService.getStatus();

    const loggerLogs = await logService.getRecentLoggerLogs(20);

    res.render('dashboard/dashboard', {
      botStatus,
      apiStatus,
      dbStatus,
      betaKey,
      apiKey,
      users,
      teams,
      tasks,
      tags,
      subscribers,
      stories,
      roles,
      categories,
      tickets,
      bugs,
      blogs,
      comments,
      companies,
      projects,
      organizations,
      issues,
      groups,
      games,
      feedbacks,
      features,
      favorites,
      tournaments,
      tournamentMatch,
      tournamentTeam,
      discordServers,
      discordMembers,
      files,
      products,
      customers,
      customerOrders,
      orders,
      payments,
      returns,
      loggerLogs,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      errorstack: null
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Status:', error);
    res.status(500).send('Fehler beim Abrufen des Status');
  }
});

// Api Key CRUD
router.get('/api/overview', roleMiddleware(['admin', 'moderator']), async (req, res) => {
  const apiKeys = await ApiKey.find();
  res.render('dashboard/api/apiKey/apiKeys', { apiKeys, errorstack: null, logoImage: '/assets/img/logo.png' });
});
router.get('/api/keys', roleMiddleware(['admin', 'moderator']), async (req, res) => {
  const apiKeys = await ApiKey.find();
  res.render('dashboard/api/apiKey/apiKeys', { apiKeys, errorstack: null, logoImage: '/assets/img/logo.png' });
});
router.get('/api/keys/create', roleMiddleware(['admin', 'moderator']), (req, res) => {
  res.render('dashboard/api/apiKey/createApiKey', { errorstack: null, logoImage: '/assets/img/logo.png' });
});
router.get('/api/keys/update/:id', roleMiddleware(['admin', 'moderator']), async (req, res) => {
  const apiKey = await ApiKey.findById(req.params.id);
  res.render('dashboard/api/apiKey/editApiKey', { apiKey, errorstack: null, logoImage: '/assets/img/logo.png' });
});

// Blog CRUD
router.get('/blogs', roleMiddleware(['admin']), async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.render('dashboard/blogs/blogs', { blogs, errorstack: null, logoImage: '/assets/img/logo.png' });
  } catch (error) {
    res.status(500).send('Error retrieving blogs');
  }
});
router.get('/blogs/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/blogs/createBlog', { errorstack: null, logoImage: '/assets/img/logo.png' });
});
router.get('/blogs/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const blog = await Blog.findById(req, res);
    if (blog) {
      res.render('dashboard/blogs/editBlog', { blog, errorstack: null, logoImage: '/assets/img/logo.png' });
    } else {
      res.status(404).send('Blog not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving blog');
  }
});

// Bug CRUD
router.get('/bugs', roleMiddleware(['admin']), async (req, res) => {
  try {
    const bugs = await Bug.find().populate('project');
    res.render('dashboard/bugs/bugs', { bugs, errorstack: null, logoImage: '/assets/img/logo.png' });
  } catch (error) {
    console.error('Error fetching bugs:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/bugs/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/bugs/createBug', { logoImage: '/assets/img/logo.png' });
});
router.get('/bugs/update/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const bug = await Bug.findById(id).populate('project');
    if (!bug) {
      return res.status(404).send('Bug not found');
    }
    res.render('dashboard/bugs/editBug', { bug, logoImage: '/assets/img/logo.png' });
  } catch (error) {
    console.error(`Error fetching bug with ID ${id}:`, error);
    res.status(500).send('Internal Server Error');
  }
});

// Category CRUD
router.get('/categories', roleMiddleware(['admin']), async (req, res) => {
  try {
    const categories = await Category.find();
    res.render('dashboard/categories/categories', { categories, logoImage: '/assets/img/logo.png' });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/categories/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/categories/createCategory');
});
router.get('/categories/update/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).send('Category not found');
    }
    res.render('dashboard/categories/editCategory', { category, logoImage: '/assets/img/logo.png' });
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    res.status(500).send('Internal Server Error');
  }
});

// Comment CRUD
router.get('/comments', roleMiddleware(['admin']), async (req, res) => {
  try {
    const { blogId } = req.query;
    const commentsData = await commentController.getCommentsByBlog({ params: { blogId } }, res);

    const { comments } = commentsData.json;
    const blogTitle = comments.length > 0 ? comments[0].blog.title : 'Blog Title';

    res.render('dashboard/comments/comments', {
      comments,
      blogTitle,
      blogId,
      logoImage: '/assets/img/logo.png'
    });
  } catch (error) {
    console.error('Error rendering comments:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/comments/create', roleMiddleware(['admin']), async (req, res) => {
  try {
    const { blogId } = req.query;

    const blogTitle = 'Blog Title';

    res.render('dashboard/comments/createComment', {
      blogId,
      blogTitle,
      logoImage: '/assets/img/logo.png'
    });
  } catch (error) {
    console.error('Error rendering create comment form:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/comments/:id/edit', roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const commentData = await commentController.getCommentById({ params: { id } }, res);

    const { comment } = commentData.json;

    res.render('dashboard/comments/editComment', {
      comment,
      blogTitle: comment.blog.title,
      logoImage: '/assets/img/logo.png'
    });
  } catch (error) {
    console.error('Error rendering edit comment form:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Company CRUD
router.get('/companies', roleMiddleware(['admin']), async (req, res) => {
  try {
    const companies = await Company.find();

    res.render('dashboard/companies/companies', {
      companies,
      logoImage: '/assets/img/logo.png'
    });
  } catch (error) {
    console.error('Error rendering companies:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/companies/create', roleMiddleware(['admin']), (req, res) => {
  try {
    res.render('dashboard/companies/createCompany', { logoImage: '/assets/img/logo.png' });
  } catch (error) {
    console.error('Error rendering create company form:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/companies/:companyId/edit', roleMiddleware(['admin']), async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).send('Company not found');
    }

    res.render('dashboard/companies/editCompany', {
      company,
      logoImage: '/assets/img/logo.png'
    });
  } catch (error) {
    console.error('Error rendering edit company form:', error);
    res.status(500).send('Internal Server Error');
  }
});

// User CRUD
router.get('/users/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/users/createUser', { logoImage: '/assets/img/logo.png' });
});
router.get('/users', roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find();
    res.render('dashboard/users/users', { users, logoImage: '/assets/img/logo.png' });
  } catch (err) {
    console.error('Error fetching users for EJS page:', err);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/users/:id/edit', roleMiddleware(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('dashboard/users/editUser', { user, logoImage: '/assets/img/logo.png' });
  } catch (error) {
    console.error('Error displaying edit form:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Organization CRUD
router.get('/organizations', async (req, res) => {
  try {
      const organizations = await Organization.find();
      res.render('dashboard/organizations/organizations', { organizations: organizations.data, logoImage: '/assets/img/logo.png' });
  } catch (error) {
      console.error('Error displaying organizations:', error);
      res.status(500).send('Internal Server Error');
  }
});
router.get('/organizations/create', (req, res) => {
  res.render('dashboard/organizations/createOrganization', { logoImage: '/assets/img/logo.png' });
});
router.get('/organizations/:id/edit', async (req, res) => {
  try {
      const organization = await Organization.findById(req, res);
      res.render('dashboard/organizations/editOrganization', { organization: organization.data, logoImage: '/assets/img/logo.png' });
  } catch (error) {
      console.error('Error displaying edit form:', error);
      res.status(500).send('Internal Server Error');
  }
});

// Games CRUD
router.get('/games', roleMiddleware(['admin']), async (req, res) => {
  try {
    const games = await Game.find();
    res.render('dashboard/games/games', { games, errorstack: null, logoImage: '/assets/img/logo.png' });
  } catch (error) {
    res.status(500).send('Error retrieving games');
  }
});
router.get('/games/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/games/createGame', { errorstack: null, logoImage: '/assets/img/logo.png' });
});
router.get('/games/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const game = await Game.findById(req, res);
    if (game) {
      res.render('dashboard/games/editGame', { game, errorstack: null, logoImage: '/assets/img/logo.png' });
    } else {
      res.status(404).send('Game not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving game');
  }
});

// Groups CRUD
router.get('/groups', roleMiddleware(['admin']), async (req, res) => {
  try {
    const groups = await Group.find();
    res.render('dashboard/groups/groups', { groups, errorstack: null, logoImage: '/assets/img/logo.png' });
  } catch (error) {
    res.status(500).send('Error retrieving groups');
  }
});
router.get('/groups/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/groups/createGroup', { errorstack: null, logoImage: '/assets/img/logo.png' });
});
router.get('/groups/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const group = await Group.findById(req, res);
    if (group) {
      res.render('dashboard/groups/editGroup', { group, errorstack: null, logoImage: '/assets/img/logo.png' });
    } else {
      res.status(404).send('Group not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving group');
  }
});

// Teams CRUD
router.get('/teams', roleMiddleware(['admin']), async (req, res) => {
  try {
    const teams = await Team.find();
    res.render('dashboard/teams/teams', { teams, errorstack: null, logoImage: '/assets/img/logo.png' });
  } catch (error) {
    res.status(500).send('Error retrieving teams');
  }
});
router.get('/teams/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/teams/createTeam', { errorstack: null, logoImage: '/assets/img/logo.png' });
});
router.get('/teams/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const team = await Team.findById(req, res);
    if (team) {
      res.render('dashboard/teams/editTeam', { team, errorstack: null, logoImage: '/assets/img/logo.png' });
    } else {
      res.status(404).send('Team not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving team');
  }
});

// Tournament CRUD
router.get('/tournaments', roleMiddleware(['admin']), async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.render('dashboard/tournaments/tournaments', { tournaments, errorstack: null, logoImage: '/assets/img/logo.png' });
  } catch (error) {
    res.status(500).send('Error retrieving tournaments');
  }
});
router.get('/tournaments/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/tournaments/createTournament', { errorstack: null, logoImage: '/assets/img/logo.png' });
});
router.get('/tournaments/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const tournament = await Tournament.findById(req, res);
    if (tournament) {
      res.render('dashboard/tournaments/editTournament', { tournament, errorstack: null, logoImage: '/assets/img/logo.png' });
    } else {
      res.status(404).send('Tournament not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving tournament');
  }
});






// Tags CRUD
router.get('/tags', roleMiddleware(['admin']), async (req, res) => {
  try {
    const tags = await Tag.find();
    res.render('dashboard/tags/tags', { tags, errorstack: null, logoImage: '/assets/img/logo.png' });
  } catch (error) {
    res.status(500).send('Error retrieving tags');
  }
});
router.get('/tags/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/tags/createTag', { errorstack: null, logoImage: '/assets/img/logo.png' });
});
router.get('/tags/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const tag = await Tag.findById(req, res);
    if (tag) {
      res.render('dashboard/tags/editTag', { tag, errorstack: null, logoImage: '/assets/img/logo.png' });
    } else {
      res.status(404).send('Tag not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving tag');
  }
});





















// Control Overview
router.get('/controls', roleMiddleware(['admin']), overviewControl.getOverview);

// Logs-Route
router.get('/logs', roleMiddleware(['admin']), async (req, res) => {
  try {
    const loggerLogs = await logService.getLoggerLogs();
    res.render('dashboard/logging/logs', {
      loggerLogs,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png'
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Logs:', error);
    res.status(500).send('Fehler beim Abrufen der Logs');
  }
});

// Beta Management-Route
router.get('/beta', roleMiddleware(['admin']), async (req, res) => {
  try {
    let betaSystem = await BetaSystem.findOne();

    if (!betaSystem) {
      betaSystem = {
        isActive: false,
      };
    }

    const betaKeys = await BetaKey.find().populate('user');

    res.render('dashboard/beta/betaOverview', {
      betaKeys,
      betaSystem,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png'
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Beta Keys:', error);
    res.status(500).send('Fehler beim Abrufen der Beta Keys');
  }
});

// CloudNet Service
router.get('/cloudnet', roleMiddleware(['admin']), async (req, res) => {
  try {
    const status = await cloudnetController.getStatus(req, res);
    const servers = await cloudnetController.getServers(req, res);

    res.render('dashboard/cloudnet/overviewCloudNet', {
      status: status,
      servers: servers,
      logoImage: '/assets/img/logo.png'
    });
  } catch (error) {
    console.error('Error rendering CloudNet overview:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
