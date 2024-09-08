const teamspeakService = require('../services/teamspeakService');
const logger = require('../services/loggerService');
const getBaseUrl = require('../helpers/getBaseUrlHelper');
const sendResponse = require('../helpers/sendResponseHelper');

exports.getServerInfo = async (req, res) => {
  try {
    const info = await teamspeakService.getServerInfo();
    logger.info('Server-Informationen erfolgreich abgerufen');
    const redirectUrl = `${getBaseUrl()}/teamspeak/server-info`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      data: info
    });
  } catch (error) {
    logger.error('Fehler beim Abrufen der Server-Informationen:', error);
    const redirectUrl = `${getBaseUrl()}/teamspeak/server-info`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Abrufen der Server-Informationen',
      error: error.message
    });
  }
};

exports.getChannels = async (req, res) => {
  try {
    const channels = await teamspeakService.getChannels();
    logger.info('Channel-Informationen erfolgreich abgerufen');
    const redirectUrl = `${getBaseUrl()}/teamspeak/channels`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      data: channels
    });
  } catch (error) {
    logger.error('Fehler beim Abrufen der Channel-Informationen:', error);
    const redirectUrl = `${getBaseUrl()}/teamspeak/channels`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Abrufen der Channel-Informationen',
      error: error.message
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await teamspeakService.getUsers();
    logger.info('Benutzerinformationen erfolgreich abgerufen');
    const redirectUrl = `${getBaseUrl()}/teamspeak/users`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Fehler beim Abrufen der Benutzerinformationen:', error);
    const redirectUrl = `${getBaseUrl()}/teamspeak/users`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Abrufen der Benutzerinformationen',
      error: error.message
    });
  }
};

exports.createChannel = async (req, res) => {
  const { name, parentId } = req.body;
  try {
    const channel = await teamspeakService.createChannel(name, parentId);
    logger.info(`Channel "${name}" erfolgreich erstellt mit ID ${channel.teamspeakId}`);
    const redirectUrl = `${getBaseUrl()}/teamspeak/channels`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Channel erfolgreich erstellt',
      data: channel
    });
  } catch (error) {
    logger.error('Fehler beim Erstellen des Channels:', error);
    const redirectUrl = `${getBaseUrl()}/teamspeak/channels/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Erstellen des Channels',
      error: error.message
    });
  }
};

exports.deleteChannel = async (req, res) => {
  const { teamspeakId } = req.params;
  try {
    await teamspeakService.deleteChannel(teamspeakId);
    logger.info(`Channel mit ID ${teamspeakId} erfolgreich gelöscht`);
    const redirectUrl = `${getBaseUrl()}/teamspeak/channels`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Channel erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Fehler beim Löschen des Channels:', error);
    const redirectUrl = `${getBaseUrl()}/teamspeak/channels`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Löschen des Channels',
      error: error.message
    });
  }
};

exports.createUser = async (req, res) => {
  const { name } = req.body;
  try {
    const user = await teamspeakService.createUser(name);
    logger.info(`Benutzer "${name}" erfolgreich erstellt mit ID ${user.teamspeakId}`);
    const redirectUrl = `${getBaseUrl()}/teamspeak/users`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Benutzer erfolgreich erstellt',
      data: user
    });
  } catch (error) {
    logger.error('Fehler beim Erstellen des Benutzers:', error);
    const redirectUrl = `${getBaseUrl()}/teamspeak/users/create`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Erstellen des Benutzers',
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  const { teamspeakId } = req.params;
  try {
    await teamspeakService.deleteUser(teamspeakId);
    logger.info(`Benutzer mit ID ${teamspeakId} erfolgreich gelöscht`);
    const redirectUrl = `${getBaseUrl()}/teamspeak/users`;
    return sendResponse(req, res, redirectUrl, {
      success: true,
      message: 'Benutzer erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Fehler beim Löschen des Benutzers:', error);
    const redirectUrl = `${getBaseUrl()}/teamspeak/users`;
    return sendResponse(req, res, redirectUrl, {
      success: false,
      message: 'Fehler beim Löschen des Benutzers',
      error: error.message
    });
  }
};
