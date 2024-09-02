const TeamSpeak = require('node-teamspeak');
const config = require('../../config/apiConfig');
const logger = require('./loggerService');

const areCredentialsValid = () => {
  return config.teamspeak.Host && config.teamspeak.QueryPort && config.teamspeak.ServerPort && config.teamspeak.Username && config.teamspeak.Password && config.teamspeak.Nickname;
};

const initializeTeamSpeakClient = async () => {
  if (!areCredentialsValid()) {
    logger.warn('[TS3] TeamSpeak-Client konnte nicht erstellt werden. Überprüfen Sie die Anmeldeinformationen.');
    throw new Error('Anmeldeinformationen fehlen oder sind unvollständig.');
  }

  try {
    const ts3 = new TeamSpeak({
      host: config.teamspeak.Host,
      queryport: config.teamspeak.QueryPort,
      serverport: config.teamspeak.ServerPort,
      username: config.teamspeak.Username,
      password: config.teamspeak.Password,
      nickname: config.teamspeak.Nickname
    });

    ts3.on('ready', () => {
      logger.info('[TS3] TeamSpeak-Client verbunden');
    });

    ts3.on('error', (error) => {
      logger.error('[TS3] TeamSpeak-Fehler:', error);
    });

    return ts3;
  } catch (error) {
    logger.error('[TS3] Fehler beim Verbinden zum TeamSpeak-Server:', error);
    throw new Error('Verbindung zum TeamSpeak-Server konnte nicht hergestellt werden.');
  }
};

let ts3Client = null;

initializeTeamSpeakClient()
  .then(client => {
    ts3Client = client;
  })
  .catch(error => {
    logger.error('[TS3] Initialisierung des TeamSpeak-Clients fehlgeschlagen:', error);
  });

module.exports = {
  getServerInfo: async () => {
    if (!ts3Client) {
      throw new Error('TeamSpeak-Client ist nicht verbunden, Anmeldeinformationen fehlen.');
    }
    try {
      const info = await ts3Client.serverInfo();
      return info;
    } catch (error) {
      logger.error('[TS3] Fehler beim Abrufen der Server-Informationen:', error);
      throw new Error('Fehler beim Abrufen der Server-Informationen.');
    }
  },

  getChannels: async () => {
    if (!ts3Client) {
      throw new Error('TeamSpeak-Client ist nicht verbunden, Anmeldeinformationen fehlen.');
    }
    try {
      const channels = await ts3Client.channelList();
      return channels;
    } catch (error) {
      logger.error('[TS3] Fehler beim Abrufen der Channel-Informationen:', error);
      throw new Error('Fehler beim Abrufen der Channel-Informationen.');
    }
  },

  getUsers: async () => {
    if (!ts3Client) {
      throw new Error('TeamSpeak-Client ist nicht verbunden, Anmeldeinformationen fehlen.');
    }
    try {
      const clients = await ts3Client.clientList();
      return clients;
    } catch (error) {
      logger.error('[TS3] Fehler beim Abrufen der Benutzerinformationen:', error);
      throw new Error('Fehler beim Abrufen der Benutzerinformationen.');
    }
  },

  createChannel: async (name, parentId) => {
    if (!ts3Client) {
      throw new Error('TeamSpeak-Client ist nicht verbunden, Anmeldeinformationen fehlen.');
    }
    try {
      const channel = await ts3Client.channelCreate(name, parentId);
      return channel;
    } catch (error) {
      logger.error('[TS3] Fehler beim Erstellen des Channels:', error);
      throw new Error('Fehler beim Erstellen des Channels.');
    }
  },

  deleteChannel: async (channelId) => {
    if (!ts3Client) {
      throw new Error('TeamSpeak-Client ist nicht verbunden, Anmeldeinformationen fehlen.');
    }
    try {
      await ts3Client.channelDelete(channelId);
    } catch (error) {
      logger.error('[TS3] Fehler beim Löschen des Channels:', error);
      throw new Error('Fehler beim Löschen des Channels.');
    }
  },

  createUser: async (name) => {
    if (!ts3Client) {
      throw new Error('TeamSpeak-Client ist nicht verbunden, Anmeldeinformationen fehlen.');
    }
    try {
      const user = await ts3Client.clientAdd(name);
      return user;
    } catch (error) {
      logger.error('[TS3] Fehler beim Erstellen des Benutzers:', error);
      throw new Error('Fehler beim Erstellen des Benutzers.');
    }
  },

  deleteUser: async (userId) => {
    if (!ts3Client) {
      throw new Error('TeamSpeak-Client ist nicht verbunden, Anmeldeinformationen fehlen.');
    }
    try {
      await ts3Client.clientKick(userId);
    } catch (error) {
      logger.error('[TS3] Fehler beim Löschen des Benutzers:', error);
      throw new Error('Fehler beim Löschen des Benutzers.');
    }
  }
};
