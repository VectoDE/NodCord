const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: {
        name: 'dankmeme',
        description: 'Zeigt ein dankes Meme an.',
        category: 'Memes',
    },
    async execute(interaction) {
        const response = await fetch('https://meme-api.com/memes/dank');
        const data = await response.json();
        const meme = data[0];

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Dank Meme')
            .setImage(meme.url)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
