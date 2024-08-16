const teamspeakService = require('../services/teamspeakService');
const logger = require('../services/loggerService');

exports.getServerInfo = async (req, res) => {
  try {
    const info = await teamspeakService.getServerInfo();
    logger.info('Server-Informationen erfolgreich abgerufen');
    res.status(200).json(info);
  } catch (error) {
    logger.error('Fehler beim Abrufen der Server-Informationen:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Server-Informationen' });
  }
};

exports.getChannels = async (req, res) => {
  try {
    const channels = await teamspeakService.getChannels();
    logger.info('Channel-Informationen erfolgreich abgerufen');
    res.status(200).json(channels);
  } catch (error) {
    logger.error('Fehler beim Abrufen der Channel-Informationen:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Channel-Informationen' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await teamspeakService.getUsers();
    logger.info('Benutzerinformationen erfolgreich abgerufen');
    res.status(200).json(users);
  } catch (error) {
    logger.error('Fehler beim Abrufen der Benutzerinformationen:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Benutzerinformationen' });
  }
};

exports.createChannel = async (req, res) => {
  const { name, parentId } = req.body;
  try {
    const channel = await teamspeakService.createChannel(name, parentId);
    logger.info(`Channel "${name}" erfolgreich erstellt mit ID ${channel.channel_id}`);
    res.status(201).json(channel);
  } catch (error) {
    logger.error('Fehler beim Erstellen des Channels:', error);
    res.status(500).json({ message: 'Fehler beim Erstellen des Channels' });
  }
};

exports.deleteChannel = async (req, res) => {
  const { channelId } = req.params;
  try {
    await teamspeakService.deleteChannel(channelId);
    logger.info(`Channel mit ID ${channelId} erfolgreich gelöscht`);
    res.status(204).end();
  } catch (error) {
    logger.error('Fehler beim Löschen des Channels:', error);
    res.status(500).json({ message: 'Fehler beim Löschen des Channels' });
  }
};

exports.createUser = async (req, res) => {
  const { name } = req.body;
  try {
    const user = await teamspeakService.createUser(name);
    logger.info(`Benutzer "${name}" erfolgreich erstellt mit ID ${user.client_id}`);
    res.status(201).json(user);
  } catch (error) {
    logger.error('Fehler beim Erstellen des Benutzers:', error);
    res.status(500).json({ message: 'Fehler beim Erstellen des Benutzers' });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await teamspeakService.deleteUser(userId);
    logger.info(`Benutzer mit ID ${userId} erfolgreich gelöscht`);
    res.status(204).end();
  } catch (error) {
    logger.error('Fehler beim Löschen des Benutzers:', error);
    res.status(500).json({ message: 'Fehler beim Löschen des Benutzers' });
  }
};
