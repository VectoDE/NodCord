module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.username}`);

    const activity = [
      'coming soon...',
      'Project Management Services',
      'Development Services',
      'do /help for helpmenu'
    ]

    setInterval(() => {
      const botStatus = activity[Math.floor(Math.random() * activity.length)];
      client.user.setPresence({ activities: [{ name: `${botStatus}` }] });
    }, 3000)

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

          status: statusArray[option].status
        })
      } catch (error) {
        console.error(error);
      }
    }
  },
};
