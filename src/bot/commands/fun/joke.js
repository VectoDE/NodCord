const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: {
        name: 'joke',
        description: 'Gibt einen zufälligen Witz zurück.',
        category: 'Fun',
    },
    async execute(interaction) {
        try {
            const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
            const joke = response.data.joke;

            const jokeEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Hier ist ein Witz für dich:')
                .setDescription(joke || 'Ich konnte keinen Witz finden.')
                .setTimestamp();

            await interaction.reply({ embeds: [jokeEmbed] });
        } catch (error) {
            console.error('Fehler beim Abrufen des Witzes:', error);
            await interaction.reply({ content: 'Es gab einen Fehler beim Abrufen des Witzes.', ephemeral: true });
        }
    },
};
