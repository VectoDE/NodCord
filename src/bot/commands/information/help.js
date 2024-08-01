const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'help',
        description: 'Listet alle verfügbaren Befehle auf.',
        category: 'Info',
    },
    async execute(interaction) {
        // Überprüfe, ob client.commands existiert und eine Map ist
        if (!interaction.client.commands || !(interaction.client.commands instanceof Map)) {
            return interaction.reply({ content: 'Es gab ein Problem beim Abrufen der Befehle.', ephemeral: true });
        }

        // Gruppiere Befehle nach Kategorien
        const categories = new Map();

        interaction.client.commands.forEach((command) => {
            const category = command.data.category || 'Unkategorisiert';
            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category).push(`\`${command.data.name}\`: ${command.data.description}`);
        });

        // Erstellen des Embeds
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Befehle')
            .setDescription('Hier sind die verfügbaren Befehle:')
            .setTimestamp();

        // Füge die Kategorien und Befehle zum Embed hinzu
        const fields = [...categories.entries()].map(([category, commands]) => ({
            name: category,
            value: commands.join('\n') || 'Keine Befehle gefunden.',
            inline: false
        }));

        embed.addFields(fields);

        await interaction.reply({ embeds: [embed] });
    },
};
