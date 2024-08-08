const express = require('express');
const router = express.Router();
const botConfig = require('../../config/botConfig');
const apiConfig = require('../../config/apiConfig');
const serverConfig = require('../../config/serverConfig');
const bot = require('../../bot/index');
const apiStatusService = require('../services/apiStatusService');
const infoService = require('../services/infoService');
const botStatusService = require('../services/botStatusService');
const dbStatusService = require('../services/dbStatusService');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware(false));

router.get('/', (req, res) => {
  res.render('index/index', { isAuthenticated: res.locals.isAuthenticated });
});

router.get('/docs', (req, res) => {
  res.render('index/documentation', {
    isAuthenticated: res.locals.isAuthenticated,
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

    res.render('index/status', {
      apiStatus,
      apiStatusMessage,
      botStatus,
      botStatusMessage,
      dbStatus,
      dbStatusMessage,
      isAuthenticated: res.locals.isAuthenticated,
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
      apiStatus: apiStatusService.getStatus() || 'N/A',
    };

    const systemInfo = await infoService.getSystemInfo();

    res.render('index/info', {
      bot: botInfo,
      api: apiInfo,
      system: systemInfo,
      isAuthenticated: res.locals.isAuthenticated,
    });
  } catch (error) {
    console.error('Error fetching info:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/discord-members', async (req, res) => {
  try {
    const servers = await bot.getServers();
    res.render('index/discordmembers', {
      servers,
      isAuthenticated: res.locals.isAuthenticated,
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
    res.render('index/discordservers', {
      servers,
      serverCount,
      isAuthenticated: res.locals.isAuthenticated,
    });
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/login', (req, res) => {
  if (res.locals.isAuthenticated) {
    return res.redirect('/dashboard');
  }

  const errorMessage = req.query.errorMessage || null;

  res.render('auth/login', {
    isAuthenticated: res.locals.isAuthenticated,
    errorMessage: errorMessage,
  });
});

router.get('/register', (req, res) => {
  if (res.locals.isAuthenticated) {
    return res.redirect('/login');
  }
  res.render('auth/register', { isAuthenticated: res.locals.isAuthenticated });
});

router.get('/verify-email/:token', authController.verifyEmail);

router.get('/logout', authController.logout, (req, res) => {
  res.redirect('/');
});

module.exports = router;
