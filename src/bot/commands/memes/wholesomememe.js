const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'wholesomememe',
        description: 'Zeigt ein wohltuendes Meme an.',
        category: 'Memes',
    },
    async execute(interaction) {
        const response = await fetch('https://meme-api.com/memes/wholesome');
        const data = await response.json();
        const meme = data[0];

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Wohltuendes Meme')
            .setImage(meme.url)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
