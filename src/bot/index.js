const { Client, GatewayIntentBits } = require('discord.js');
const botConfig = require('../config/botConfig');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildBans
    ]
});

// Lade die Funktionen und Ereignisse
require('./functions/commandHandler')(client);
require('./functions/eventHandler')(client);

const start = () => {
  client.login(botConfig.token);
};

module.exports = { start };
