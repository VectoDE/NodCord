const { EmbedBuilder } = require('discord.js');
const Balance = require('../../models/balanceModel');

module.exports = {
    data: {
        name: 'leaderboard',
        description: 'Zeigt die Rangliste der Benutzer mit den meisten Coins an.',
        category: 'Economy',
    },
    async execute(interaction) {
        const topUsers = await Balance.find().sort({ amount: -1 }).limit(10);

        const description = topUsers
            .map((user, index) => `**${index + 1}.** <@${user.userId}> - ${user.amount} Coins`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Leaderboard')
            .setDescription(description || 'Keine Daten verfügbar.')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};