const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const apiStatusService = require('../services/apiStatusService');
const botStatusService = require('../services/botStatusService');
const dbStatusService = require('../services/dbStatusService');
const logService = require('../services/logService');

router.use(authMiddleware);

router.get('/', roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const botStatus = await botStatusService.getStatus();
    const apiStatus = await apiStatusService.getStatus();
    const dbStatus = await dbStatusService.getStatus();
    res.render('dashboard/dashboard', { botStatus, apiStatus, dbStatus, isAuthenticated: res.locals.isAuthenticated });
  } catch (error) {
    console.error('Fehler beim Abrufen des Status:', error);
    res.status(500).send('Fehler beim Abrufen des Status');
  }
});

router.get('/logs', roleMiddleware(['admin']), (req, res) => {
  const loggerLogs = logService.getLoggerLogs();
  res.render('dashboard/logging/logs', { loggerLogs, isAuthenticated: res.locals.isAuthenticated });
});

module.exports = router;
