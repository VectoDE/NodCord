const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'randomgif',
        description: 'Zeigt ein zufälliges GIF an.',
        category: 'Memes',
    },
    async execute(interaction) {
        const response = await fetch('https://gif-api.com/gifs/random');
        const data = await response.json();
        const gif = data[0];

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Zufälliges GIF')
            .setImage(gif.url)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
