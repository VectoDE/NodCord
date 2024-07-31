const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: {
        name: 'lyrics',
        description: 'Zeigt die Lyrics eines Songs an.',
        options: [
            {
                type: 3, // STRING type
                name: 'song',
                description: 'Der Name des Songs.',
                required: true,
            },
        ],
        category: 'Music',
    },
    async execute(interaction) {
        const song = interaction.options.getString('song');

        try {
            const response = await axios.get(`https://api.lyrics.ovh/v1/${artist}/${title}`);
            const lyrics = response.data.lyrics;

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Lyrics für ${song}`)
                .setDescription(lyrics || 'Keine Lyrics gefunden.')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Ein Fehler ist aufgetreten.', ephemeral: true });
        }
    },
};