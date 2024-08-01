const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'meme',
        description: 'Zeigt ein zufälliges Meme an.',
        category: 'Memes',
    },
    async execute(interaction) {
        const response = await fetch('https://meme-api.com/memes/random');
        const data = await response.json();
        const meme = data[0];

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Hier ist ein Meme für dich!')
            .setImage(meme.url)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
