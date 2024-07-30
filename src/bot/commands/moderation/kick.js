module.exports = {
    data: {
        name: 'kick',
        description: 'Kicks a user from the guild.',
        category: 'Admin'
    },
    async execute(message, args) {
        if (!message.member.permissions.has('KICK_MEMBERS')) {
            return message.reply('You do not have permission to use this command.');
        }

        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('You need to mention a user to kick.');
        }

        try {
            await member.kick();
            message.reply(`${member.user.tag} has been kicked.`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to kick the user.');
        }
    }
};
