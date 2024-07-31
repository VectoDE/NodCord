const { EmbedBuilder } = require('discord.js');
const compliments = [
    "Du bist großartig!",
    "Dein Lächeln ist bezaubernd!",
    "Du bist ein wunderbarer Mensch!",
    "Du bist unglaublich talentiert!",
    "Du machst die Welt zu einem besseren Ort!"
];

module.exports = {
    data: {
        name: 'compliment',
        description: 'Gibt ein Kompliment.',
        category: 'Fun',
    },
    async execute(interaction) {
        const compliment = compliments[Math.floor(Math.random() * compliments.length)];

        const complimentEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Kompliment')
            .setDescription(compliment)
            .setTimestamp();

        await interaction.reply({ embeds: [complimentEmbed] });
    },
};