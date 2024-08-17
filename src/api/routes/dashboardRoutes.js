require('dotenv').config();
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const betaMiddleware = require('../middlewares/betaMiddleware');
const apiStatusService = require('../services/apiStatusService');
const botStatusService = require('../services/botStatusService');
const dbStatusService = require('../services/dbStatusService');
const logService = require('../services/logService');
const bot = require('../../bot/index');
const overviewControl = require('../helpers/overviewControl');
const cloudnetController = require('../controllers/cloudnetController');

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

router.use(authMiddleware(true));

// Dashboard Overview
router.get('/', roleMiddleware(['admin', 'moderator']), betaMiddleware.checkBetaSystemStatus, betaMiddleware.checkBetaKeyValidity, async (req, res) => {
  try {
    const botStatus = await botStatusService.getStatus();
    const apiStatus = await apiStatusService.getStatus();
    const dbStatus = await dbStatusService.getStatus();

    const betaKey = await BetaKey.find();
    const apiKey = await ApiKey.find();
    const users = await User.find();
    const roles = await Role.find();
    const categories = await Category.find();
    const tickets = await Ticket.find();
    const bugs = await Bug.find();
    const blogs = await Blog.find();
    const comments = await Comment.find();
    const companies = await Company.find();
    const organizations = await Organization.find();
    const discordServers = await bot.getServers();
    const discordMembers = await bot.getMembers();

    const files = await FileUpload.find();

    const loggerLogs = await logService.getRecentLoggerLogs(20);

    res.render('dashboard/dashboard', {
      botStatus,
      apiStatus,
      dbStatus,
      betaKey,
      apiKey,
      users,
      roles,
      categories,
      tickets,
      bugs,
      blogs,
      comments,
      companies,
      organizations,
      discordServers,
      discordMembers,
      files,
      loggerLogs,
      isAuthenticated: res.locals.isAuthenticated,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Status:', error);
    res.status(500).send('Fehler beim Abrufen des Status');
  }
});

// Api Key CRUD
router.get('/apiKeys', roleMiddleware(['admin', 'moderator']), async (req, res) => {
  const apiKeys = await ApiKey.find();
  res.render('dashboard/apiKey/apiKeys', { apiKeys });
});
router.get('/apiKeys/create', roleMiddleware(['admin', 'moderator']), (req, res) => {
  res.render('dashboard/apiKey/createApiKey');
});
router.get('/apiKeys/update/:id', roleMiddleware(['admin', 'moderator']), async (req, res) => {
  const apiKey = await ApiKey.findById(req.params.id);
  res.render('dashboard/apiKey/updateApiKey', { apiKey });
});

// Blog CRUD
router.get('/blogs', roleMiddleware(['admin']), async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.render('dashboard/blogs/blogs', { blogs });
  } catch (error) {
    res.status(500).send('Error retrieving blogs');
  }
});
router.get('/blogs/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/blogs/createBlog');
});
router.get('/blogs/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const blog = await Blog.findById(req, res);
    if (blog) {
      res.render('dashboard/blogs/updateBlog', { blog });
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
    res.render('dashboard/bugs/bugs', { bugs });
  } catch (error) {
    console.error('Error fetching bugs:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/bugs/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/bugs/createBug');
});
router.get('/bugs/update/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const bug = await Bug.findById(id).populate('project');
    if (!bug) {
      return res.status(404).send('Bug not found');
    }
    res.render('dashboard/bugs/updateBug', { bug });
  } catch (error) {
    console.error(`Error fetching bug with ID ${id}:`, error);
    res.status(500).send('Internal Server Error');
  }
});

// Category CRUD
router.get('/categories', roleMiddleware(['admin']), async (req, res) => {
  try {
    const categories = await Category.find();
    res.render('dashboard/categories/categories', { categories });
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
    res.render('dashboard/categories/updateCategory', { category });
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

    res.render('dashboard/comments/updateComment', {
      comment,
      blogTitle: comment.blog.title,
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
    });
  } catch (error) {
    console.error('Error rendering companies:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/companies/create', roleMiddleware(['admin']), (req, res) => {
  try {
    res.render('dashboard/companies/createCompany');
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

    res.render('dashboard/companies/updateCompany', {
      company,
    });
  } catch (error) {
    console.error('Error rendering edit company form:', error);
    res.status(500).send('Internal Server Error');
  }
});

// User CRUD
router.get('/users/create', roleMiddleware(['admin']), (req, res) => {
  res.render('dashboard/users/createUser');
});
router.get('/users', roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find();
    res.render('dashboard/users/users', { users });
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

    res.render('dashboard/users/updateUser', { user });
  } catch (error) {
    console.error('Error displaying edit form:', error);
    res.status(500).send('Internal Server Error');
  }
});



// Organization CRUD
router.get('/organizations', async (req, res) => {
  try {
      const organizations = await Organization.find();
      res.render('dashboard/organizations/organizations', { organizations: organizations.data });
  } catch (error) {
      console.error('Error displaying organizations:', error);
      res.status(500).send('Internal Server Error');
  }
});
router.get('/organizations/create', (req, res) => {
  res.render('dashboard/organizations/createOrganization');
});
router.get('/organizations/:id/edit', async (req, res) => {
  try {
      const organization = await Organization.findById(req, res);
      res.render('dashboard/organizations/updateOrganization', { organization: organization.data });
  } catch (error) {
      console.error('Error displaying edit form:', error);
      res.status(500).send('Internal Server Error');
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
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Logs:', error);
    res.status(500).send('Fehler beim Abrufen der Logs');
  }
});

// Beta Management-Route
router.get('/beta-management', roleMiddleware(['admin']), async (req, res) => {
  try {
    let betaSystem = await BetaSystem.findOne();

    if (!betaSystem) {
      betaSystem = {
        isActive: false,
      };
    }

    const betaKeys = await BetaKey.find().populate('user');

    res.render('dashboard/beta/beta-management', {
      betaKeys,
      betaSystem,
      isAuthenticated: res.locals.isAuthenticated,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Beta Keys:', error);
    res.status(500).send('Fehler beim Abrufen der Beta Keys');
  }
});

// CloudNet Service
router.get('/cloudnet/overview', roleMiddleware(['admin']), async (req, res) => {
  try {
    const status = await cloudnetController.getStatus(req, res);
    const servers = await cloudnetController.getServers(req, res);

    res.render('dashboard/cloudnet/overviewCloudNet', {
      status: status,
      servers: servers
    });
  } catch (error) {
    console.error('Error rendering CloudNet overview:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
