const { EmbedBuilder } = require('discord.js');
const Balance = require('../../models/balanceModel');

module.exports = {
    data: {
        name: 'work',
        description: 'Simuliert eine Arbeit und verdient eine Belohnung.',
        category: 'Economy',
    },
    async execute(interaction) {
        const user = interaction.user;
        const amount = Math.floor(Math.random() * 200) + 50; // Belohnung zwischen 50 und 250

        let balance = await Balance.findOne({ userId: user.id });
        if (!balance) {
            balance = new Balance({ userId: user.id, amount: 0 });
        }

        balance.amount += amount;
        await balance.save();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Arbeitserfolg')
            .setDescription(`Du hast ${amount} Coins durch Arbeit verdient! Dein neues Guthaben ist ${balance.amount} Coins.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};