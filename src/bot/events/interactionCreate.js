module.exports = (client) => {
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        try {
            // Check if the command exists
            const command = client.commands.get(commandName);
            if (!command) return interaction.reply({ content: 'Command not found', ephemeral: true });

            // Execute the command
            await command.execute(interaction);
        } catch (error) {
            console.error('Error executing command:', error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    });
};
