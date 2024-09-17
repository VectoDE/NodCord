require('dotenv').config();
const express = require('express');
const router = express.Router();
const betaController = require('../../api/controllers/betaController');
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
const logger = require('../../api/services/loggerService');

const bot = require('../../bot/index');

const User = require('../../models/userModel');
const Role = require('../../models/roleModel');
const Category = require('../../models/categoryModel');
const Ticket = require('../../models/ticketModel');
const BetaKey = require('../../models/betaKeyModel');
const BetaSystem = require('../../models/betaSystemModel');
const ApiKey = require('../../models/apiKeyModel');
const ApiSystem = require('../../models/apiSystemModel');
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
const Version = require('../../models/versionModel');

router.use(authMiddleware(true));

// Dashboard Overview
router.get('/', roleMiddleware(['admin', 'moderator']), betaMiddleware.checkBetaSystemStatus, betaMiddleware.checkBetaKeyValidity, async (req, res) => {
  try {
    const users = await User.find();
    const versions = await Version.find();
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

    const { serverData: discordServers } = await bot.getServers();
    const { memberData: discordMembers } = await bot.getMembers();

    const botStatus = await botStatusService.getStatus();
    const apiStatus = await apiStatusService.getStatus();
    const dbStatus = await dbStatusService.getStatus();

    const loggerLogs = await logService.getRecentLoggerLogs(20);

    const currentPage = req.params.page || 'overview';

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
      versions,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Status:', error);
    res.status(500).send('Fehler beim Abrufen des Status');
  }
});

// Blog CRUD
router.get('/blogs', roleMiddleware(['admin']), async (req, res) => {
  try {
    const blogs = await Blog.find();
    const currentPage = req.params.page || 'blogs';
    res.render('dashboard/blogs/blogs', {
      blogs,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    res.status(500).send('Error retrieving blogs');
  }
});
router.get('/blogs/create', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'blogs';
  const projects = await Project.find();
  res.render('dashboard/blogs/createBlog', {
    projects,
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/blogs/update/:id', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'blogs';
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog) {
      res.render('dashboard/blogs/editBlog', {
        blog,
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
        currentPage,
      });
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
    const currentPage = req.params.page || 'bugs';
    res.render('dashboard/bugs/bugs', {
      bugs,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    console.error('Error fetching bugs:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/bugs/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'bugs';
  res.render('dashboard/bugs/createBug', {
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/bugs/update/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const bug = await Bug.findById(id).populate('project');
    const currentPage = req.params.page || 'bugs';
    if (!bug) {
      return res.status(404).send('Bug not found');
    }
    res.render('dashboard/bugs/editBug', {
      bug,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    console.error(`Error fetching bug with ID ${id}:`, error);
    res.status(500).send('Internal Server Error');
  }
});

// Category CRUD
router.get('/categories', roleMiddleware(['admin']), async (req, res) => {
  try {
    const categories = await Category.find();
    const currentPage = req.params.page || 'categories';
    res.render('dashboard/categories/categories', {
      categories,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/categories/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'categories';
  res.render('dashboard/categories/createCategory', {
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/categories/update/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    const currentPage = req.params.page || 'categories';
    if (!category) {
      return res.status(404).send('Category not found');
    }
    res.render('dashboard/categories/editCategory', {
      category,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
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

    const currentPage = req.params.page || 'comments';

    res.render('dashboard/comments/comments', {
      comments,
      blogTitle,
      blogId,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
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

    const currentPage = req.params.page || 'comments';

    res.render('dashboard/comments/createComment', {
      blogId,
      blogTitle,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
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

    const currentPage = req.params.page || 'comments';

    res.render('dashboard/comments/editComment', {
      comment,
      blogTitle: comment.blog.title,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
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

    const currentPage = req.params.page || 'companies';

    res.render('dashboard/companies/companies', {
      companies,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    console.error('Error rendering companies:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/companies/create', roleMiddleware(['admin']), (req, res) => {
  try {
    const currentPage = req.params.page || 'companies';

    res.render('dashboard/companies/createCompany', {
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
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

    const currentPage = req.params.page || 'companies';

    res.render('dashboard/companies/editCompany', {
      company,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    console.error('Error rendering edit company form:', error);
    res.status(500).send('Internal Server Error');
  }
});

// User CRUD
router.get('/users/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'users';
  res.render('dashboard/users/createUser', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    errorstack: null,
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/users', roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find();
    const currentPage = req.params.page || 'users';
    res.render('dashboard/users/users', {
      users,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
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

    const currentPage = req.params.page || 'users';

    res.render('dashboard/users/editUser', {
      user,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    console.error('Error displaying edit form:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Organization CRUD
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await Organization.find();
    const currentPage = req.params.page || 'organizations';
    res.render('dashboard/organizations/organizations', {
      organizations:
        organizations.data,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    console.error('Error displaying organizations:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/organizations/create', (req, res) => {
  const currentPage = req.params.page || 'organizations';
  res.render('dashboard/organizations/createOrganization', {
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/organizations/:id/edit', async (req, res) => {
  try {
    const organization = await Organization.findById(req, res);
    const currentPage = req.params.page || 'organizations';
    res.render('dashboard/organizations/editOrganization', {
      organization:
        organization.data,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    console.error('Error displaying edit form:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Games CRUD
router.get('/games', roleMiddleware(['admin']), async (req, res) => {
  try {
    const games = await Game.find();
    const currentPage = req.params.page || 'games';
    res.render('dashboard/games/games', {
      games,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    res.status(500).send('Error retrieving games');
  }
});
router.get('/games/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'games';
  res.render('dashboard/games/createGame', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/games/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const game = await Game.findById(req, res);
    const currentPage = req.params.page || 'games';
    if (game) {
      res.render('dashboard/games/editGame', {
        game,
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
        currentPage,
      });
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
    const currentPage = req.params.page || 'groups';
    res.render('dashboard/groups/groups', {
      groups,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    res.status(500).send('Error retrieving groups');
  }
});
router.get('/groups/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'groups';
  res.render('dashboard/groups/createGroup', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/groups/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const currentPage = req.params.page || 'groups';
    if (group) {
      res.render('dashboard/groups/editGroup', {
        group,
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
        currentPage,
      });
    } else {
      res.status(404).send('Group not found');
    }
  } catch (error) {
    logger.error('Error retrieving group:', error);
    res.status(500).send('Error retrieving group');
  }
});

// Teams CRUD
router.get('/teams', roleMiddleware(['admin']), async (req, res) => {
  try {
    const teams = await Team.find();
    const currentPage = req.params.page || 'teams';
    res.render('dashboard/teams/teams', {
      teams,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    res.status(500).send('Error retrieving teams');
  }
});
router.get('/teams/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'teams';
  res.render('dashboard/teams/createTeam', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/teams/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const team = await Team.findById(req, res);
    const currentPage = req.params.page || 'teams';
    if (team) {
      res.render('dashboard/teams/editTeam', {
        team,
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
        currentPage,
      });
    } else {
      res.status(404).send('Team not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving team');
  }
});

// Tags CRUD
router.get('/tags', roleMiddleware(['admin']), async (req, res) => {
  try {
    const tags = await Tag.find();
    const currentPage = req.params.page || 'tags';
    res.render('dashboard/tags/tags', {
      tags,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    res.status(500).send('Error retrieving tags');
  }
});
router.get('/tags/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'tags';
  res.render('dashboard/tags/createTag', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/tags/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const tag = await Tag.findById(req, res);
    const currentPage = req.params.page || 'tags';
    if (tag) {
      res.render('dashboard/tags/editTag', {
        tag,
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
        currentPage,
      });
    } else {
      res.status(404).send('Tag not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving tag');
  }
});

// Versions CRUD
router.get('/versions', roleMiddleware(['admin']), async (req, res) => {
  try {
    const versions = await Version.find();
    const currentPage = req.params.page || 'versions';
    res.render('dashboard/versions/versions', {
      versions,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/versions/create', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'versions';
  const versionTags = await Version.find();
  res.render('dashboard/versions/createVersion', {
    versionTags,
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/versions/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const version = await Version.findById(req.params.id);
    if (!version) {
      return res.status(404).send('Version not found');
    }
    const currentPage = req.params.page || 'versions';
    res.render('dashboard/versions/editVersion', {
      version,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Ticket CRUD
router.get('/tickets', roleMiddleware(['admin']), async (req, res) => {
  try {
    const tickets = await Ticket.find();
    const currentPage = req.params.page || 'tickets';
    res.render('dashboard/tickets/tickets', {
      tickets,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/tickets/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'tickets';
  res.render('dashboard/tickets/createTicket', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/tickets/answer/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).send('Ticket not found');
    }
    const currentPage = req.params.page || 'tickets';
    res.render('dashboard/tickets/answerTicket', {
      ticket,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/tickets/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).send('Ticket not found');
    }
    const currentPage = req.params.page || 'tickets';
    res.render('dashboard/tickets/editTicket', {
      ticket,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Tasks CRUD
router.get('/tasks', roleMiddleware(['admin']), async (req, res) => {
  try {
    const tasks = await Task.find();
    const currentPage = req.params.page || 'tasks';
    res.render('dashboard/tasks/tasks', {
      tasks,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/tasks/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'tasks';
  res.render('dashboard/tasks/createTask', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/tasks/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send('Task not found');
    }
    const currentPage = req.params.page || 'tasks';
    res.render('dashboard/tasks/editTask', {
      task,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

router.get('/roles', roleMiddleware(['admin']), async (req, res) => {
  try {
    const roles = await Role.find();
    const currentPage = req.params.page || 'roles';
    res.render('dashboard/roles/roles', {
      roles,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/roles/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'roles';
  res.render('dashboard/roles/createRole', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/roles/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).send('Role not found');
    }
    const currentPage = req.params.page || 'roles';
    res.render('dashboard/roles/editRole', {
      role,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Projects CRUD
router.get('/projects', roleMiddleware(['admin']), async (req, res) => {
  try {
    const projects = await Project.find();
    const currentPage = req.params.page || 'projects';
    res.render('dashboard/projects/projects', {
      projects,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/projects/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'projects';
  res.render('dashboard/projects/createProject', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/projects/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).send('Project not found');
    }
    const currentPage = req.params.page || 'projects';
    res.render('dashboard/projects/editProject', {
      project,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Subscriber CRUD
router.get('/subscribers', roleMiddleware(['admin']), async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    const currentPage = req.params.page || 'subscribers';
    res.render('dashboard/subscribers/subscribers', {
      subscribers,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/subscribers/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'subscribers';
  res.render('dashboard/subscribers/createSubscriber', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/subscribers/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).send('Subscriber not found');
    }
    const currentPage = req.params.page || 'subscribers';
    res.render('dashboard/subscribers/editSubscriber', {
      subscriber,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Stories CRUD
router.get('/stories', roleMiddleware(['admin']), async (req, res) => {
  try {
    const stories = await Story.find();
    const currentPage = req.params.page || 'stories';
    res.render('dashboard/stories/stories', {
      stories,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/stories/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'stories';
  res.render('dashboard/stories/createStory', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/stories/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).send('Story not found');
    }
    const currentPage = req.params.page || 'stories';
    res.render('dashboard/stories/editStory', {
      story,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Issues CRUD
router.get('/issues', roleMiddleware(['admin']), async (req, res) => {
  try {
    const issues = await Issue.find();
    const currentPage = req.params.page || 'issues';
    res.render('dashboard/issues/issues', {
      issues,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/issues/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'issues';
  res.render('dashboard/issues/createIssue', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/issues/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).send('Issue not found');
    }
    const currentPage = req.params.page || 'issues';
    res.render('dashboard/issues/editIssue', {
      issue,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Files CRUD
router.get('/files', roleMiddleware(['admin']), async (req, res) => {
  try {
    const files = await FileUpload.find();
    const currentPage = req.params.page || 'files';
    res.render('dashboard/files/files', {
      files,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/files/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'files';
  res.render('dashboard/files/createFile', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/files/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const file = await FileUpload.findById(req.params.id);
    if (!file) {
      return res.status(404).send('File not found');
    }
    const currentPage = req.params.page || 'files';
    res.render('dashboard/files/editFile', {
      file,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Feedbacks CRUD
router.get('/feedbacks', roleMiddleware(['admin']), async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    const currentPage = req.params.page || 'feedbacks';
    res.render('dashboard/feedbacks/feedbacks', {
      feedbacks,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/feedbacks/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'feedbacks';
  res.render('dashboard/feedbacks/createFeedback', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/feedbacks/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).send('Feedback not found');
    }
    const currentPage = req.params.page || 'feedbacks';
    res.render('dashboard/feedbacks/editFeedback', {
      feedback,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Features CRUD
router.get('/features', roleMiddleware(['admin']), async (req, res) => {
  try {
    const features = await Feature.find();
    const currentPage = req.params.page || 'features';
    res.render('dashboard/features/features', {
      features,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/features/create', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'features';
  const projects = await Project.find()
  res.render('dashboard/features/createFeature', {
    projects,
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/features/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const feature = await Feature.findById(req.params.id);
    if (!feature) {
      return res.status(404).send('Feature not found');
    }
    const currentPage = req.params.page || 'features';
    res.render('dashboard/features/editFeature', {
      feature,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Favorites CRUD
router.get('/favorites', roleMiddleware(['admin']), async (req, res) => {
  try {
    const favorites = await Favorite.find();
    const currentPage = req.params.page || 'favorites';
    res.render('dashboard/favorites/favorites', {
      favorites,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/favorites/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'favorites';
  res.render('dashboard/favorites/createFavorite', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/favorites/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);
    if (!favorite) {
      return res.status(404).send('Favorite not found');
    }
    const currentPage = req.params.page || 'favorites';
    res.render('dashboard/favorites/editFavorite', {
      favorite,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Comments CRUD
router.get('/comments', roleMiddleware(['admin']), async (req, res) => {
  try {
    const comments = await Comment.find();
    const currentPage = req.params.page || 'comments';
    res.render('dashboard/comments/comments', {
      comments,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/comments/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'comments';
  res.render('dashboard/comments/createComment', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/comments/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).send('Comment not found');
    }
    const currentPage = req.params.page || 'comments';
    res.render('dashboard/comments/editComment', {
      comment,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});






// Shipping Routes
// Products CRUD
router.get('/products', roleMiddleware(['admin']), async (req, res) => {
  try {
    const products = await Product.find();
    const currentPage = req.params.page || 'products';
    res.render('dashboard/products/products', {
      products,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    logger.error('Error retrieving products:', error);
    res.status(500).send('Error retrieving products');
  }
});
router.get('/products/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'products';
  res.render('dashboard/products/createProduct', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/products/update/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const currentPage = req.params.page || 'products';
    if (product) {
      res.render('dashboard/products/editProduct', {
        product,
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
        currentPage,
      });
    } else {
      res.status(404).send('Product not found');
    }
  } catch (error) {
    logger.error('Error retrieving product:', error);
    res.status(500).send('Error retrieving product');
  }
});

// Customers CRUD
router.get('/customers', async (req, res) => {
  const currentPage = req.params.page || 'customers';
  try {
    const customers = await Customer.find();
    res.render('dashboard/customers/customers', {
      customers: customers,
      logoImage: '/assets/img/logo.png',
      currentPage,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send('Server Error');
  }
});
router.get('/customers/create', (req, res) => {
  const currentPage = req.params.page || 'customers';
  res.render('dashboard/customers/createCustomer', {
    logoImage: '/assets/img/logo.png',
    currentPage,
  });
});
router.get('/customers/update/:id', async (req, res) => {
  const currentPage = req.params.page || 'customers';
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send('Customer not found');
    }
    res.render('dashboard/customers/editCustomer', {
      customer: customer,
      logoImage: '/assets/img/logo.png',
      currentPage,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send('Server Error');
  }
});

// Orders CRUD
router.get('/orders', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'orders';
  try {
    const orders = await Order.find();
    res.render('dashboard/orders/orders', {
      orders,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send('Server Error');
  }
});
router.get('/orders/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'orders';
  res.render('dashboard/orders/createOrder', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/orders/update/:id', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'orders';
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send('Order not found');
    }
    res.render('dashboard/orders/editOrder', {
      order: order,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send('Server Error');
  }
});

// Payments CRUD
router.get('/payments', async (req, res) => {
  const currentPage = req.params.page || 'payments';
  try {
    const payments = await Payment.find().populate('userId');
    res.render('dashboard/payments/payments', {
      payments,
      logoImage: '/assets/img/logo.png',
      currentPage,
    });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});
router.get('/payments/create', (req, res) => {
  const currentPage = req.params.page || 'payments';
  res.render('dashboard/payments/createPayment', {
    logoImage: '/assets/img/logo.png',
    currentPage,
  });
});
router.get('/payments/update/:id', async (req, res) => {
  const currentPage = req.params.page || 'payments';
  try {
    const payment = await Payment.findById(req.params.id).populate('userId');
    if (payment) {
      res.render('dashboard/payments/editPayment', {
        payment,
        logoImage: '/assets/img/logo.png',
        currentPage,
      });
    } else {
      res.status(404).send('Payment not found');
    }
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// Returns CRUD
router.get('/returns', async (req, res) => {
  const currentPage = req.params.page || 'paymereturnsnts';
  try {
    const returns = await Return.find().populate('orderId').exec();
    res.render('dashboard/returns/returns', {
      returns,
      logoImage: '/assets/img/logo.png',
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});
router.get('/returns/create', (req, res) => {
  const currentPage = req.params.page || 'returns';
  res.render('dashboard/returns/createReturn', {
    logoImage: '/assets/img/logo.png',
    currentPage,
  });
});
router.get('/returns/edit/:id', async (req, res) => {
  const currentPage = req.params.page || 'returns';
  try {
    const returnItem = await Return.findById(req.params.id).populate('orderId').exec();
    if (!returnItem) {
      return res.status(404).send('Return not found');
    }
    res.render('dashboard/returns/editReturn', {
      returnItem,
      logoImage: '/assets/img/logo.png',
      currentPage,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send('Server Error');
  }
});

// Tournament Planner
// Tournament CRUD
router.get('/tournaments', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'tournaments';
  try {
    const tournaments = await Tournament.find();
    res.render('dashboard/tournaments/tournaments', {
      tournaments,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    res.status(500).send('Error retrieving tournaments');
  }
});
router.get('/tournaments/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'tournaments';
  res.render('dashboard/tournaments/createTournament', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/tournaments/update/:id', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'tournaments';
  try {
    const tournament = await Tournament.findById(req, res);
    if (tournament) {
      res.render('dashboard/tournaments/editTournament', {
        tournament,
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
        currentPage,
      });
    } else {
      res.status(404).send('Tournament not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving tournament');
  }
});

router.get('/tournaments/games', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'tournaments/games';
  try {
    const tournaments = await Tournament.find();
    res.render('dashboard/tournaments/games/tournamentGames', {
      tournaments,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    res.status(500).send('Error retrieving tournaments');
  }
});
router.get('/tournaments/games/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'tournaments/games';
  res.render('dashboard/tournaments/games/createTournamentGame', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/tournaments/games/update/:id', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'tournaments/games';
  try {
    const tournament = await Tournament.findById(req, res);
    if (tournament) {
      res.render('dashboard/tournaments/games/editTournamentGame', {
        tournament,
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
        currentPage,
      });
    } else {
      res.status(404).send('Tournament not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving tournament');
  }
});

router.get('/tournaments/matches', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'tournaments/matches';
  try {
    const tournaments = await Tournament.find();
    res.render('dashboard/tournaments/matches/tournamentMatches', {
      tournaments,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    res.status(500).send('Error retrieving tournaments');
  }
});
router.get('/tournaments/matches/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'tournaments/matches';
  res.render('dashboard/tournaments/matches/createTournamentMatch', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/tournaments/matches/update/:id', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'tournaments/matches';
  try {
    const tournament = await Tournament.findById(req, res);
    if (tournament) {
      res.render('dashboard/tournaments/matches/editTournamentMatch', {
        tournament,
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
        currentPage,
      });
    } else {
      res.status(404).send('Tournament not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving tournament');
  }
});

router.get('/tournaments/teams', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'tournaments/teams';
  try {
    const tournaments = await Tournament.find();
    res.render('dashboard/tournaments/teams/tournamentTeams', {
      tournaments,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    res.status(500).send('Error retrieving tournaments');
  }
});
router.get('/tournaments/teams/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'tournaments/teams';
  res.render('dashboard/tournaments/teams/createTournamentTeam', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/tournaments/teams/update/:id', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'tournaments/teams';
  try {
    const tournament = await Tournament.findById(req, res);
    if (tournament) {
      res.render('dashboard/tournaments/teams/editTournamentTeam', {
        tournament,
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
        currentPage,
      });
    } else {
      res.status(404).send('Tournament not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving tournament');
  }
});

router.get('/tournaments/players', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'tournaments/players';
  try {
    const tournaments = await Tournament.find();
    res.render('dashboard/tournaments/players/tournamentPlayers', {
      tournaments,
      errorstack: null,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    res.status(500).send('Error retrieving tournaments');
  }
});
router.get('/tournaments/players/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'tournaments/players';
  res.render('dashboard/tournaments/players/createTournamentPlayer', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/tournaments/players/update/:id', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'tournaments/players';
  try {
    const tournament = await Tournament.findById(req, res);
    if (tournament) {
      res.render('dashboard/tournaments/players/editTournamentPlayer', {
        tournament,
        errorstack: null,
        logoImage: '/assets/img/logo.png',
        api: {
          https: process.env.API_HTTPS,
          baseURL: process.env.API_BASE_URL,
          port: process.env.API_PORT,
        },
        currentPage,
      });
    } else {
      res.status(404).send('Tournament not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving tournament');
  }
});










// Services
// TODO: Analytics Service

// CloudNet Service
router.get('/cloudnet', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'cloudnet';
  try {
    const status = await cloudnetController.getStatus(req, res);
    const servers = await cloudnetController.getServers(req, res);

    res.render('dashboard/cloudnet/overviewCloudNet', {
      status: status,
      servers: servers,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    console.error('Error rendering CloudNet overview:', error);
    res.status(500).send('Internal Server Error');
  }
});

// TODO: FaceIt Service

// TODO: Plex Service

// TODO: ProxMox Service

// TODO: Pterodactyl Service






// Beta System & CRUD
router.get('/beta', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'beta';
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
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    logger.error('Fehler beim Abrufen der Beta Keys:', error);
    res.status(500).send('Fehler beim Abrufen der Beta Keys');
  }
});
router.get('/beta/keys', roleMiddleware(['admin', 'moderator']), async (req, res) => {
  const currentPage = req.params.page || 'beta/keys';
  const betaKeys = await BetaKey.find();

  res.render('dashboard/beta/betaKeys/betaKeys', {
    betaKeys,
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/beta/keys/create', roleMiddleware(['admin']), (req, res) => {
  const currentPage = req.params.page || 'beta/keys';
  res.render('dashboard/beta/betaKeys/createBetaKey', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/beta/keys/update/:id', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'beta/keys';
  const betaKey = await BetaKey.findById(req.params.id);

  res.render('dashboard/beta/betaKeys/editBetaKey', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    betaKey,
    currentPage,
  });
});

// TODO: Security Control

// Control Overview
router.get('/controls', roleMiddleware(['admin']), overviewControl.getOverview);

// Api System & CRUD
router.get('/api', roleMiddleware(['admin', 'moderator']), async (req, res) => {
  const currentPage = req.params.page || 'api';
  let apiSystem = await ApiSystem.findOne();

  if (!apiSystem) {
    apiSystem = {
      isActive: false,
    };
  }

  const apiKeys = await ApiKey.find();

  res.render('dashboard/api/overviewApi', {
    apiSystem,
    apiKeys,
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/api/keys', roleMiddleware(['admin', 'moderator']), async (req, res) => {
  const currentPage = req.params.page || 'api/keys';
  const apiKeys = await ApiKey.find();
  res.render('dashboard/api/apiKey/apiKeys', {
    apiKeys,
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/api/keys/create', roleMiddleware(['admin', 'moderator']), (req, res) => {
  const currentPage = req.params.page || 'api/keys';
  res.render('dashboard/api/apiKey/createApiKey', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});
router.get('/api/keys/update/:id', roleMiddleware(['admin', 'moderator']), async (req, res) => {
  const currentPage = req.params.page || 'api/keys';
  const apiKey = await ApiKey.findById(req.params.id);
  res.render('dashboard/api/apiKey/editApiKey', {
    apiKey,
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});

// Client System
router.get('/client', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'client';
  res.render('dashboard/client/overviewClient', {
    errorstack: null,
    logoImage: '/assets/img/logo.png',
    api: {
      https: process.env.API_HTTPS,
      baseURL: process.env.API_BASE_URL,
      port: process.env.API_PORT,
    },
    currentPage,
  });
});

// Discord Bot Overview
router.get('/bot', async (req, res) => {
  const currentPage = req.params.page || 'bot';
  try {
    const botStatus = await BotStatus.findOne();
    const totalMembers = await BotStatus.getTotalMembers();
    const totalGuilds = await BotStatus.getTotalGuilds();

    res.render('dashboard/bot/overviewBot', {
      logoImage: '/assets/img/logo.png',
      botStatus: botStatus || { isActive: false },
      totalMembers: totalMembers || 0,
      totalGuilds: totalGuilds || 0,
      currentPage,
    });
  } catch (err) {
    console.error('Fehler beim Abrufen des Bot-Status:', err);
    res.status(500).send('Interner Serverfehler');
  }
});

// Content Management System
// TODO: YouTube CMS

// TODO: Twitch CMS

// TODO: Instagram CMS

// TODO: TikTok CMS

// TODO: Twitter CMS

// TODO: GitHub CMS

// TODO: Discord CMS

// TODO: LinkedIn CMS

// Logs-Route
router.get('/logs', roleMiddleware(['admin']), async (req, res) => {
  const currentPage = req.params.page || 'logs';
  try {
    const loggerLogs = await logService.getLoggerLogs();
    res.render('dashboard/logging/logs', {
      loggerLogs,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      api: {
        https: process.env.API_HTTPS,
        baseURL: process.env.API_BASE_URL,
        port: process.env.API_PORT,
      },
      currentPage,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Logs:', error);
    res.status(500).send('Fehler beim Abrufen der Logs');
  }
});

// TODO: API Log

// TODO: Bot Log

// TODO: Web Log

module.exports = router;
