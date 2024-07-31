const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'cat',
        description: 'Zeigt ein zufälliges Katzenbild.',
        category: 'Fun',
    },
    async execute(interaction) {
        try {
            const response = await fetch('https://api.thecatapi.com/v1/images/search');
            const [cat] = await response.json();

            const catEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('😺 Zufällige Katze')
                .setImage(cat.url)
                .setTimestamp();

            await interaction.reply({ embeds: [catEmbed] });
        } catch (error) {
            console.error('Fehler beim Abrufen des Katzenbildes:', error);
            await interaction.reply({ content: 'Es gab einen Fehler beim Abrufen des Katzenbildes.', ephemeral: true });
        }
    },
};