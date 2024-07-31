const { EmbedBuilder } = require('discord.js');
const Balance = require('../../models/balanceModel');

module.exports = {
    data: {
        name: 'lottery',
        description: 'Nimm an der Lotterie teil und gewinne eventuell einen Preis.',
        options: [
            {
                type: 4, // INTEGER type
                name: 'ticket',
                description: 'Die Anzahl der Tickets, die du kaufen möchtest.',
                required: true,
            },
        ],
        category: 'Economy',
    },
    async execute(interaction) {
        const tickets = interaction.options.getInteger('ticket');
        const ticketPrice = 50; // Preis pro Ticket

        if (tickets <= 0) {
            return interaction.reply({ content: 'Du musst mindestens ein Ticket kaufen.', ephemeral: true });
        }

        const amount = tickets * ticketPrice;

        const balance = await Balance.findOne({ userId: interaction.user.id });
        if (!balance || balance.amount < amount) {
            return interaction.reply({ content: 'Du hast nicht genug Coins, um die Tickets zu kaufen.', ephemeral: true });
        }

        balance.amount -= amount;
        await balance.save();

        // Simulate lottery result
        const won = Math.random() < 0.1; // 10% Chance zu gewinnen
        const prize = won ? amount * 2 : 0;

        if (won) {
            balance.amount += prize;
            await balance.save();
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Lotterie Ergebnis')
            .setDescription(won
                ? `Herzlichen Glückwunsch! Du hast ${prize} Coins gewonnen. Dein neues Guthaben ist ${balance.amount} Coins.`
                : `Leider hast du nichts gewonnen. Dein verbleibendes Guthaben ist ${balance.amount} Coins.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};