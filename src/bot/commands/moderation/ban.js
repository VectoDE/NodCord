module.exports = {
    data: {
        name: 'ban',
        description: 'Bans a user from the server.',
        category: 'Moderation',
        usage: '<user> [reason]',
    },
    async execute(message, args) {
        // Check if the user has permission to ban members
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.reply('You do not have permission to use this command.');
        }

        // Check if a user was mentioned
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Please mention the user you want to ban.');
        }

        // Check if the user to ban is in the server
        const member = message.guild.members.resolve(user.id);
        if (!member) {
            return message.reply('The user is not in this server.');
        }

        // Get the reason for the ban, if provided
        const reason = args.slice(1).join(' ') || 'No reason provided';

        try {
            await member.ban({ reason });
            message.reply(`Successfully banned ${user.tag} from the server. Reason: ${reason}`);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to ban the user.');
        }
    }
};
