module.exports = {
    data: {
        name: 'ping',
        description: 'Replies with Pong!',
        category: 'General'
    },
    async execute(message, args) {
        await message.reply('Pong!');
    }
};
