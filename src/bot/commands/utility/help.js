module.exports = {
    data: {
        name: 'help',
        description: 'Lists all available commands by category.'
    },
    async execute(message, args) {
        const { commands } = message.client;
        const categories = new Set();

        commands.forEach((command) => {
            if (command.data && command.data.name) {
                const category = command.data.category || 'Miscellaneous';
                categories.add(category);
            }
        });

        let response = 'Available commands:\n';
        categories.forEach(category => {
            response += `\n**${category}**\n`;
            commands.forEach((command) => {
                if (command.data && command.data.category === category) {
                    response += `\`${command.data.name}\`: ${command.data.description}\n`;
                }
            });
        });

        message.reply(response);
    }
};
