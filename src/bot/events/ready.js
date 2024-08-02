module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log('Ready!');

    const activity = [
      'Subscribe to Ethical Programmer',
      'Make sure to like & share',
      'do /ping to pong!'
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
