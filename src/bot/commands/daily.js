const { EmbedBuilder } = require('discord.js');
const Balance = require('../../models/balanceModel');

module.exports = {
    data: {
        name: 'daily',
        description: 'Erhalte deine tägliche Belohnung.',
        category: 'Economy',
    },
    async execute(interaction) {
        const user = interaction.user;
        const amount = 100; // Example daily amount

        let balance = await Balance.findOne({ userId: user.id });
        if (!balance) {
            balance = new Balance({ userId: user.id, amount: 0 });
        }

        balance.amount += amount;
        await balance.save();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Tägliche Belohnung')
            .setDescription(`Du hast ${amount} Coins erhalten! Dein neues Guthaben ist ${balance.amount} Coins.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};