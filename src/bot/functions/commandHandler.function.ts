const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const botConfig = require('../../configs/botConfig');
const logger = require('../../services/logger.service');

const clientId = botConfig.clientId;
const guildId = botConfig.devGuild;

module.exports = (client) => {
  client.handleCommands = async (commandFolders, path) => {
    client.commandArray = [];
    for (folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`${path}/${folder}`)
        .filter((file) => file.endsWith('.js'));
      for (const file of commandFiles) {
        const command = require(`../commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
      }
    }

    const rest = new REST({
      version: '9',
    }).setToken(botConfig.token);

    (async () => {
      try {
        logger.info('[BOT] Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(clientId), {
          body: client.commandArray,
        });

        logger.info('[BOT] Successfully reloaded application (/) commands.');
      } catch (error) {
        logger.error('[BOT]' + error);
      }
    })();
  };
};
