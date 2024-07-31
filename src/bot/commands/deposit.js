const { EmbedBuilder } = require('discord.js');
const Balance = require('../../models/balanceModel');

module.exports = {
    data: {
        name: 'deposit',
        description: 'Zahle Coins in die Bank ein.',
        options: [
            {
                type: 4, // INTEGER type
                name: 'amount',
                description: 'Die Anzahl der Coins, die du einzahlen möchtest.',
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
        if (!balance || balance.amount < amount) {
            return interaction.reply({ content: 'Du hast nicht genug Coins, um diese Einzahlung durchzuführen.', ephemeral: true });
        }

        balance.amount -= amount;
        // Simulate bank deposit (for simplicity, just adjusting the same balance for demonstration)
        await balance.save();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Einzahlung abgeschlossen')
            .setDescription(`Du hast ${amount} Coins eingezahlt. Dein verbleibendes Guthaben ist ${balance.amount} Coins.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};