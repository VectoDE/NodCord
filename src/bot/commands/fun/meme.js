const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: {
        name: 'meme',
        description: 'Gibt ein zufälliges Meme zurück.',
        category: 'Fun',
    },
    async execute(interaction) {
        try {
            const response = await axios.get('https://www.reddit.com/r/memes/random/.json');
            const meme = response.data[0].data.children[0].data;

            const memeEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(meme.title)
                .setImage(meme.url)
                .setFooter({ text: `Von ${meme.author}` })
                .setTimestamp();

            await interaction.reply({ embeds: [memeEmbed] });
        } catch (error) {
            console.error('Fehler beim Abrufen des Memes:', error);
            await interaction.reply({ content: 'Es gab einen Fehler beim Abrufen des Memes.', ephemeral: true });
        }
    },
};
