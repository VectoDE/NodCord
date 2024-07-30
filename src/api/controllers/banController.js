const { Client, GatewayIntentBits } = require('discord.js');
const botConfig = require('../../config/botConfig');
const Ban = require('../../models/banModel');

// Erstelle einen Discord-Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans
    ]
});

client.login(botConfig.token);

// Listet alle gebannten Mitglieder auf
const listBannedMembers = async (req, res) => {
    try {
        const guildId = req.query.guildId; // Die Guild-ID wird als Query-Parameter erwartet
        if (!guildId) {
            return res.status(400).json({ error: 'Guild ID is required' });
        }

        const guild = await client.guilds.fetch(guildId);
        const bans = await guild.bans.fetch();

        // Holen Sie sich alle gebannten Mitglieder aus der Datenbank
        const bannedMembers = await Ban.find({ guildId });

        // Mappt die gebannten Mitglieder aus der API auf das Format der Datenbank
        const bannedMembersList = bannedMembers.map(ban => ({
            userId: ban.userId,
            username: bans.get(ban.userId)?.user.username || 'Unknown',
            reason: ban.reason || 'No reason provided'
        }));

        res.status(200).json(bannedMembersList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Banne ein Mitglied und speichere es in der Datenbank
const banMember = async (req, res) => {
    try {
        const { guildId, userId, reason } = req.body;
        if (!guildId || !userId) {
            return res.status(400).json({ error: 'Guild ID and User ID are required' });
        }

        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);

        await member.ban({ reason });

        // Speichern des Ban-Ereignisses in der Datenbank
        const newBan = new Ban({
            guildId,
            userId,
            reason
        });

        await newBan.save();

        res.status(200).json({ message: `User ${userId} has been banned from guild ${guildId}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Entbanne ein Mitglied und entferne es aus der Datenbank
const unbanMember = async (req, res) => {
    try {
        const { guildId, userId } = req.body;
        if (!guildId || !userId) {
            return res.status(400).json({ error: 'Guild ID and User ID are required' });
        }

        const guild = await client.guilds.fetch(guildId);

        await guild.bans.remove(userId);

        // Entferne den Ban-Eintrag aus der Datenbank
        await Ban.deleteOne({ guildId, userId });

        res.status(200).json({ message: `User ${userId} has been unbanned from guild ${guildId}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    listBannedMembers,
    banMember,
    unbanMember
};
