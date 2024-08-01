const Ticket = require('../../models/ticketModel');
const { getRegisteredEventsCount } = require('../../bot/functions/eventHandler'); // Importiere die Methode

// Methode zum Abrufen der Bot-Statistiken
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

// Methode zum Abrufen der Serverinformationen
const getServerDetails = async (client) => {
  const servers = client.guilds.cache.map(guild => ({
      name: guild.name,
      icon: guild.iconURL() || '/assets/img/default-icon.png', // Fallback Icon
      owner: guild.ownerId,
      createdAt: guild.createdAt.toDateString(),
      memberCount: guild.memberCount,
      roleCount: guild.roles.cache.size,
  }));

  return servers;
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

  getServerList: async (req, res) => {
      try {
          const client = req.app.get('client'); // Hole den Client aus den Express App-Settings
          const servers = await getServerDetails(client);
          res.render('discordservers', { servers }); // Stelle sicher, dass 'servers' hier übergeben wird
      } catch (error) {
          console.error('Error getting server list:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      }
  },
};
