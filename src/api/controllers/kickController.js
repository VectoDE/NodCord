const { Client, GatewayIntentBits } = require('discord.js');
const botConfig = require('../../config/botConfig');
const Kick = require('../../models/kickModel');

// Erstelle einen Discord-Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

client.login(botConfig.token);

const kickMember = async (req, res) => {
    try {
        const { guildId, userId, reason } = req.body;
        if (!guildId || !userId) {
            return res.status(400).json({ error: 'Guild ID and User ID are required' });
        }

        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);

        await member.kick(reason);

        // Speichern des Kick-Ereignisses in der Datenbank
        const newKick = new Kick({
            guildId,
            userId,
            reason
        });

        await newKick.save();

        res.status(200).json({ message: `User ${userId} has been kicked from guild ${guildId}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Listet alle Kicks auf
const listKicks = async (req, res) => {
    try {
        const { guildId } = req.query;
        if (!guildId) {
            return res.status(400).json({ error: 'Guild ID is required' });
        }

        const kicks = await Kick.find({ guildId });

        res.status(200).json(kicks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    kickMember,
    listKicks
};
