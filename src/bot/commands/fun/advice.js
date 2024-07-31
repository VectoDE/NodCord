const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'advice',
        description: 'Gibt einen zufälligen Ratschlag.',
        category: 'Fun',
    },
    async execute(interaction) {
        try {
            const response = await fetch('https://api.adviceslip.com/advice');
            const advice = await response.json();

            const adviceEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Ratschlag des Tages')
                .setDescription(advice.slip.advice)
                .setTimestamp();

            await interaction.reply({ embeds: [adviceEmbed] });
        } catch (error) {
            console.error('Fehler beim Abrufen des Ratschlags:', error);
            await interaction.reply({ content: 'Es gab einen Fehler beim Abrufen des Ratschlags.', ephemeral: true });
        }
    },
};