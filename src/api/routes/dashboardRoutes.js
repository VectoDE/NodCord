require('dotenv').config();
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const apiStatusService = require('../services/apiStatusService');
const botStatusService = require('../services/botStatusService');
const dbStatusService = require('../services/dbStatusService');
const logService = require('../services/logService');
const bot = require('../../bot/index');
const UserModel = require('../../models/userModel');
const RoleModel = require('../../models/roleModel');
const CategoryModel = require('../../models/categoryModel');
const TicketModel = require('../../models/ticketModel');
const BetaKey = require('../../models/betaKeyModel');
const BetaSystem = require('../../models/betaSystemModel');

// Auth Middleware
router.use(authMiddleware(true));

// Dashboard-Route
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
    const betaKeys = await BetaKey.find().populate('user');
    const betaSystem = await BetaSystem.findOne();

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

module.exports = router;
