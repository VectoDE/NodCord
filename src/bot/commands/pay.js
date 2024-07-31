const { EmbedBuilder } = require('discord.js');
const Balance = require('../../models/balanceModel');

module.exports = {
    data: {
        name: 'pay',
        description: 'Bezahle einen anderen Benutzer.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Der Benutzer, dem du Coins senden möchtest.',
                required: true,
            },
            {
                type: 4, // INTEGER type
                name: 'amount',
                description: 'Die Anzahl der Coins, die du senden möchtest.',
                required: true,
            },
        ],
        category: 'Economy',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            return interaction.reply({ content: 'Der Betrag muss größer als 0 sein.', ephemeral: true });
        }

        const senderBalance = await Balance.findOne({ userId: interaction.user.id });
        const receiverBalance = await Balance.findOne({ userId: user.id });

        if (!senderBalance || senderBalance.amount < amount) {
            return interaction.reply({ content: 'Du hast nicht genug Coins, um diese Transaktion durchzuführen.', ephemeral: true });
        }

        if (!receiverBalance) {
            receiverBalance = new Balance({ userId: user.id, amount: 0 });
        }

        senderBalance.amount -= amount;
        receiverBalance.amount += amount;

        await senderBalance.save();
        await receiverBalance.save();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Transaktion abgeschlossen')
            .setDescription(`Du hast ${amount} Coins an ${user.tag} gesendet! Dein neues Guthaben ist ${senderBalance.amount} Coins.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};