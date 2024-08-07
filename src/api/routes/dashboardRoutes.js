const express = require('express');
const router = express.Router();
const bot = require('../../bot/index');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const apiStatusService = require('../services/apiStatusService');
const botStatusService = require('../services/botStatusService');
const dbStatusService = require('../services/dbStatusService');
const logService = require('../services/logService');
const UserModel = require('../../models/userModel');
const RoleModel = require('../../models/roleModel');
const CategoryModel = require('../../models/categoryModel');
const TicketModel = require('../../models/ticketModel');

router.use(authMiddleware(true));

router.get('/', roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const botStatus = await botStatusService.getStatus();
    const apiStatus = await apiStatusService.getStatus();
    const dbStatus = await dbStatusService.getStatus();

    const users = await UserModel.find();
    const roles = await RoleModel.find();
    const categories = await CategoryModel.find();
    const tickets = await TicketModel.find();

    const discordServers = await bot.getServers();
    const discordMembers = await bot.getMembers();

    res.render('dashboard/dashboard', {
      botStatus,
      apiStatus,
      dbStatus,
      users,
      roles,
      categories,
      tickets,
      discordServers,
      discordMembers,
      isAuthenticated: res.locals.isAuthenticated,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Status:', error);
    res.status(500).send('Fehler beim Abrufen des Status');
  }
});

router.get('/logs', roleMiddleware(['admin']), (req, res) => {
  const loggerLogs = logService.getLoggerLogs();
  res.render('dashboard/logging/logs', {
    loggerLogs,
    isAuthenticated: res.locals.isAuthenticated,
  });
});

module.exports = router;
