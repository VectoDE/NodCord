const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'coinflip',
        description: 'Wirft eine Münze.',
        category: 'Fun',
    },
    async execute(interaction) {
        const result = Math.random() < 0.5 ? 'Kopf' : 'Zahl';

        const coinEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🪙 Münzwurf')
            .setDescription(`Die Münze landete auf: **${result}**`)
            .setTimestamp();

        await interaction.reply({ embeds: [coinEmbed] });
    },
};