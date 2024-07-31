const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'dog',
        description: 'Zeigt ein zufälliges Hundefoto.',
        category: 'Fun',
    },
    async execute(interaction) {
        try {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            const dog = await response.json();

            const dogEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🐶 Zufälliger Hund')
                .setImage(dog.message)
                .setTimestamp();

            await interaction.reply({ embeds: [dogEmbed] });
        } catch (error) {
            console.error('Fehler beim Abrufen des Hundefotos:', error);
            await interaction.reply({ content: 'Es gab einen Fehler beim Abrufen des Hundefotos.', ephemeral: true });
        }
    },
};