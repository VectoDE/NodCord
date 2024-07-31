const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'quote',
        description: 'Gibt ein zufälliges Zitat aus.',
        category: 'Fun',
    },
    async execute(interaction) {
        try {
            const response = await fetch('https://api.quotable.io/random');
            const quote = await response.json();

            const quoteEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Zitat des Tages')
                .setDescription(`"${quote.content}"\n\n- ${quote.author}`)
                .setTimestamp();

            await interaction.reply({ embeds: [quoteEmbed] });
        } catch (error) {
            console.error('Fehler beim Abrufen des Zitats:', error);
            await interaction.reply({ content: 'Es gab einen Fehler beim Abrufen des Zitats.', ephemeral: true });
        }
    },
};