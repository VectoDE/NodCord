const logger = require('../../services/logger.service');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    logger.info(`[BOT] Logged in as ${client.user.username}`);

    const activity = [
      'coming soon...',
      'Server Management',
      'Games for Users',
      'Support Feature',
      '/help for helpmenu',
    ];

    setInterval(() => {
      const botStatus = activity[Math.floor(Math.random() * activity.length)];
      client.user.setPresence({ activities: [{ name: `${botStatus}` }] });
    }, 3000);

    async function pickPresence() {
      const option = Math.floor(Math.random() * statusArray.length);

      try {
        await client.user.setPresence({
          activities: [
            {
              name: statusArray[option].content,
              type: statusArray[option].type,
            },
          ],
          status: statusArray[option].status,
        });
      } catch (error) {
        logger.error(error);
      }
    }
  },
};
