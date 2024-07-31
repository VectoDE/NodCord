const Ticket = require('../../models/ticketModel');
const { getRegisteredEventsCount } = require('../../bot/functions/eventHandler'); // Importiere die Methode

const getBotStats = async (client) => {
    // Hole die Anzahl der Server und Mitglieder
    const guilds = client.guilds.cache.size;
    const members = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    // Hole die Anzahl der offenen Tickets
    const openTicketsCount = await Ticket.countDocuments({ status: 'open' });

    // Hole die Anzahl der registrierten Events
    const registeredEventsCount = getRegisteredEventsCount(); // Verwende die Methode

    return { guilds, members, openTicketsCount, registeredEventsCount };
};

module.exports = {
    getStats: async (req, res) => {
        try {
            const client = req.app.get('client'); // Hole den Client aus den Express App-Settings
            const stats = await getBotStats(client);
            res.json(stats);
        } catch (error) {
            console.error('Error getting bot stats:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};
