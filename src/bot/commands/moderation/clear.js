module.exports = {
    data: {
        name: 'clear',
        description: 'Clears a specified number of messages from the channel.',
        category: 'Admin',
        usage: '<number>',
    },
    async execute(message, args) {
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply('You do not have permission to use this command.');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return message.reply('Please provide a number between 1 and 100 for the amount of messages to delete.');
        }

        try {
            await message.channel.bulkDelete(amount + 1, true); // +1 to include the command message itself
            message.reply(`Successfully deleted ${amount} messages.`).then(msg => {
                setTimeout(() => msg.delete(), 5000); // Automatically delete the confirmation message after 5 seconds
            });
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to delete messages.');
        }
    }
};
