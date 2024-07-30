module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        // Ignoriere Nachrichten von Bots
        if (message.author.bot) return;

        // Überprüfen, ob die Nachricht ein Präfix enthält
        if (!message.content.startsWith('!')) return;

        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (!client.commands.has(commandName)) return;

        const command = client.commands.get(commandName);

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an error executing that command.');
        }

        console.log(`Nachricht von ${message.author.tag} gelöscht in ${message.channel.name}:\n${message.content}`);
    });
};
