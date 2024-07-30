module.exports = {
    data: {
        name: 'status',
        description: 'Displays the status of a user.',
        category: 'Information',
        usage: '<user>',
    },
    async execute(message, args) {
        // Check if a user was mentioned
        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            return message.reply('Please mention a user or provide their ID.');
        }

        // Fetch the member object from the guild
        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('User not found in this server.');
        }

        // Get the status of the user
        const status = member.presence ? member.presence.status : 'offline';

        // Prepare the status message
        const statusMessage = `${user.tag} is currently ${status === 'online' ? 'online' : status === 'idle' ? 'idle' : status === 'dnd' ? 'do not disturb' : 'offline'}.`;

        // Send the status message
        message.channel.send(statusMessage);
    }
};
