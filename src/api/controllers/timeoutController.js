const { Client, GatewayIntentBits } = require('discord.js');
const botConfig = require('../../config/botConfig');
const Timeout = require('../../models/timeoutModel');

// Erstelle einen Discord-Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.login(botConfig.token);

// Listet alle Mitglieder mit aktiven Timeouts auf
const listTimedOutMembers = async (req, res) => {
    try {
        const guildId = req.query.guildId; // Die Guild-ID wird als Query-Parameter erwartet
        if (!guildId) {
            return res.status(400).json({ error: 'Guild ID is required' });
        }

        // Holen Sie sich alle Timeouts aus der Datenbank
        const timeouts = await Timeout.find({ guildId });

        res.status(200).json(timeouts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Setze ein Timeout für ein Mitglied
const timeoutMember = async (req, res) => {
    try {
        const { guildId, userId, reason, duration } = req.body;
        if (!guildId || !userId || !duration) {
            return res.status(400).json({ error: 'Guild ID, User ID, and Duration are required' });
        }

        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);

        const expiresAt = new Date(Date.now() + duration);

        await member.timeout(duration, reason);

        // Speichern des Timeout-Ereignisses in der Datenbank
        const newTimeout = new Timeout({
            guildId,
            userId,
            reason,
            duration,
            expiresAt
        });

        await newTimeout.save();

        res.status(200).json({ message: `User ${userId} has been timed out in guild ${guildId}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Entferne das Timeout eines Mitglieds
const removeTimeout = async (req, res) => {
    try {
        const { guildId, userId } = req.body;
        if (!guildId || !userId) {
            return res.status(400).json({ error: 'Guild ID and User ID are required' });
        }

        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);

        await member.timeout(null); // Entferne das Timeout

        // Entferne den Timeout-Eintrag aus der Datenbank
        await Timeout.deleteOne({ guildId, userId });

        res.status(200).json({ message: `Timeout removed for user ${userId} in guild ${guildId}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    listTimedOutMembers,
    timeoutMember,
    removeTimeout
};
