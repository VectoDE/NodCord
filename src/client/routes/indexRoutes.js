const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const botConfig = require('../../config/botConfig');
const apiConfig = require('../../config/apiConfig');
const serverConfig = require('../../config/serverConfig');
const bot = require('../../bot/index');
const apiStatusService = require('../../api/services/apiStatusService');
const infoService = require('../../api/services/infoService');
const botStatusService = require('../../api/services/botStatusService');
const dbStatusService = require('../../api/services/dbStatusService');
const authController = require('../../api/controllers/authController');
const authMiddleware = require('../../api/middlewares/authMiddleware');
const blogService = require('../../api/services/blogService');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(authMiddleware(false));

const transporter = nodemailer.createTransport({
  host: process.env.CONTACT_SMTP_HOST,
  port: process.env.CONTACT_SMTP_PORT,
  secure: process.env.CONTACT_SMTP_SECURE === 'true',
  auth: {
    user: process.env.CONTACT_SMTP_USER,
    pass: process.env.CONTACT_SMTP_PASS,
  },
});

router.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

router.get('/', async (req, res) => {
  res.render('index', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    errorstack: null,
    api: {
      https: 'http',
      baseURL: 'localhost',
      port: '3000',
    },
  });
});

router.get('/news', async (req, res) => {
  try {
    const blogs = await blogService.getAllPosts();
    res.render('blog', {
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      blogs,
      errorstack: null,
      api: {
        https: 'http',
        baseURL: 'localhost',
        port: '3000',
      },
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).render('blog', {
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      blogs: [],
      errorstack: 'Fehler beim Abrufen der Blog-Posts. Bitte versuchen Sie es später erneut.'
    });
  }
});

router.get('/news/:id', async (req, res) => {
  try {
    const blog = await blogService.getPostById(req.params.id);
    if (!blog) {
      return res.status(404).render('blogPost', {
        isAuthenticated: res.locals.isAuthenticated,
        logoImage: '/assets/img/logo.png',
        blog: null,
        errorstack: 'Blog-Post nicht gefunden.',
        api: {
          https: 'http',
          baseURL: 'localhost',
          port: '3000',
        },
      });
    }
    res.render('blogPost', {
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      blog,
      errorstack: null,
      api: {
        https: 'http',
        baseURL: 'localhost',
        port: '3000',
      },
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).render('blogPost', {
      isAuthenticated: res.locals.isAuthenticated,
      LogoImage: '/assets/img/logo.png',
      blog: null,
      errorstack: 'Fehler beim Abrufen des Blog-Posts. Bitte versuchen Sie es später erneut.'
    });
  }
});


router.get('/docs', (req, res) => {
  res.render('documentation', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    errorstack: null,
    api: {
      https: 'http',
      baseURL: 'localhost',
      port: '3000',
    },
  });
});

router.get('/status', async (req, res) => {
  try {
    const apiStatus = apiStatusService.getStatus();
    const apiStatusMessage =
      apiStatus === 'online'
        ? 'API ist online'
        : apiStatus === 'maintenance'
          ? 'API im Wartungsmodus'
          : 'API ist offline';

    const botStatus = botStatusService.getStatus();
    const botStatusMessage =
      botStatus === 'online'
        ? 'Bot ist online'
        : botStatus === 'maintenance'
          ? 'Bot im Wartungsmodus'
          : 'Bot ist offline';

    const dbStatus = dbStatusService.getStatus();
    const dbStatusMessage =
      dbStatus === 'online' ? 'Datenbank ist online' : 'Datenbank ist offline';

    res.render('status', {
      apiStatus,
      apiStatusMessage,
      botStatus,
      botStatusMessage,
      dbStatus,
      dbStatusMessage,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: 'http',
        baseURL: 'localhost',
        port: '3000',
      },
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/info', async (req, res) => {
  try {
    const botInfo = await infoService.getBotInfo();

    const apiInfo = {
      version: serverConfig.version || 'N/A',
      baseUrl: apiConfig.baseURL || 'N/A',
      environment: serverConfig.environment || 'N/A',
      dbStatus: dbStatusService.getStatus() || 'N/A',
      apiStatus: apiStatusService.getStatus() || 'N/A',
    };

    const systemInfo = await infoService.getSystemInfo();

    res.render('info', {
      bot: botInfo,
      api: apiInfo,
      system: systemInfo,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      errorstack: null
    });
  } catch (error) {
    console.error('Error fetching info:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/versions', (req, res) => {
  const versions = [
    {
      name: "NodCord v0.5 Beta",
      tag: "v0.5.0 Alpha",
      description: "Release the beta of nodcord with beta key access to nodcord features for users.",
      downloadLink: "/downloads/NodCord-v0.5.0-alpha.zip"
    },
    {
      name: "NodCord v1.0 LTS",
      tag: "v1.0.0 LTS",
      description: "The official first version of nodcord with every feature to use and everything is set for production environment for the commercial use.",
      downloadLink: "/downloads/NodCord-v1.0.0-lts.zip"
    },
  ];

  res.render('versionControl', {
    versions,
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    errorstack: null,
    api: {
      https: 'http',
      baseURL: 'localhost',
      port: '3000',
    },
  });
});

router.get('/discord-members', async (req, res) => {
  try {
    const servers = await bot.getServers();
    res.render('discordmembers', {
      servers,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: 'http',
        baseURL: 'localhost',
        port: '3000',
      },
    });
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/discord-servers', async (req, res) => {
  try {
    const servers = await bot.getServers();
    const serverCount = servers.length;
    res.render('discordservers', {
      servers,
      serverCount,
      isAuthenticated: res.locals.isAuthenticated,
      logoImage: '/assets/img/logo.png',
      errorstack: null,
      api: {
        https: 'http',
        baseURL: 'localhost',
        port: '3000',
      },
    });
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: process.env.CONTACT_SMTP_USER,
    to: process.env.CONTACT_EMAIL,
    subject: `Kontaktanfrage von ${name}`,
    text: `Name: ${name}\nE-Mail: ${email}\nNachricht:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect('/contact?success=true');
  } catch (error) {
    console.error('Fehler beim Senden der Nachricht:', error);
    res.redirect('/contact?error=true');
  }
});

router.get('/contact', async (req, res) => {
  const successMessage = req.query.success === 'true' ? 'Vielen Dank für Ihre Nachricht. Wir werden uns bald bei Ihnen melden.' : null;
  const errorMessage = req.query.error === 'true' ? 'Es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut.' : null;

  res.render('contact', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    successMessage,
    errorMessage,
    errorstack: null,
    api: {
      https: 'http',
      baseURL: 'localhost',
      port: '3000',
    },
  });
});

router.get('/about', async (req, res) => {
  res.render('about', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    errorstack: null,
    api: {
      https: 'http',
      baseURL: 'localhost',
      port: '3000',
    },
  });
});

router.get('/login', (req, res) => {
  if (res.locals.isAuthenticated) {
    return res.redirect('/dashboard');
  }

  const errorMessage = req.query.errorMessage || null;
  res.render('auth/login', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    errorMessage: errorMessage,
    errorstack: null,
    api: {
      https: 'http',
      baseURL: 'localhost',
      port: '3000',
    },
  });
});

router.get('/register', (req, res) => {
  if (res.locals.isAuthenticated) {
    return res.redirect('/login');
  }

  const errorMessage = req.query.errorMessage || null;

  res.render('auth/register', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    errorMessage: errorMessage,
    errorstack: null,
    api: {
      https: 'http',
      baseURL: 'localhost',
      port: '3000',
    },
  });
});

router.get('/verify-email/:token', authController.verifyEmail);

router.get('/beta-verify', authMiddleware(true), (req, res) => {
  res.render('verification/beta-verify', {
    isAuthenticated: res.locals.isAuthenticated,
    logoImage: '/assets/img/logo.png',
    error: req.query.error || null,
    errorstack: null,
    api: {
      https: 'http',
      baseURL: 'localhost',
      port: '3000',
    },
  });
});

router.get('/logout', authController.logout, (req, res) => {
  res.redirect('/');
});

module.exports = router;
