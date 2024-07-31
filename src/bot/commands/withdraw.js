const { EmbedBuilder } = require('discord.js');
const Balance = require('../../models/balanceModel');

module.exports = {
    data: {
        name: 'withdraw',
        description: 'Hebe Coins von der Bank ab.',
        options: [
            {
                type: 4, // INTEGER type
                name: 'amount',
                description: 'Die Anzahl der Coins, die du abheben möchtest.',
                required: true,
            },
        ],
        category: 'Economy',
    },
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            return interaction.reply({ content: 'Der Betrag muss größer als 0 sein.', ephemeral: true });
        }

        const balance = await Balance.findOne({ userId: interaction.user.id });
        if (!balance) {
            return interaction.reply({ content: 'Du hast kein Konto bei der Bank.', ephemeral: true });
        }

        // Simulate withdrawal (for simplicity, just adjusting the same balance for demonstration)
        balance.amount += amount;
        await balance.save();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Abhebung abgeschlossen')
            .setDescription(`Du hast ${amount} Coins abgehoben. Dein neues Guthaben ist ${balance.amount} Coins.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};