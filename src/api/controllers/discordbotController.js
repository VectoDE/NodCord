const { Client, GatewayIntentBits } = require('discord.js');
const client = require('../../bot/index');  // Importiere den Discord-Client

// Funktion zum Abrufen aller Discord-Befehle
const getDiscordCommands = async (req, res) => {
    try {
        // Stelle sicher, dass der Bot bereit ist
        if (!client.isReady()) {
            return res.status(503).json({ message: 'Bot is not ready' });
        }

        // Holen Sie sich die Befehle aus dem Client
        const commands = client.commands.map(command => ({
            name: command.data.name,
            description: command.data.description,
            options: command.data.options || []
        }));

        res.status(200).json({ commands });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Exportiere die Controller-Funktion
module.exports = {
    getDiscordCommands
};
