const { EmbedBuilder } = require('discord.js');
const Balance = require('../../models/balanceModel');

module.exports = {
    data: {
        name: 'balance',
        description: 'Zeigt das aktuelle Guthaben eines Benutzers an.',
        category: 'Economy',
    },
    async execute(interaction) {
        const user = interaction.user;
        const balance = await Balance.findOne({ userId: user.id });

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Guthaben')
            .setDescription(`Du hast ${balance ? balance.amount : 0} Coins.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};