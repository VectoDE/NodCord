const { EmbedBuilder } = require('discord.js');
const Ticket = require('../../../models/ticketModel');

module.exports = {
    data: {
        name: 'stats',
        description: 'Zeigt Statistiken über den Server, den Bot, die offenen Tickets und Events an.',
        category: 'Utility',
    },
    async execute(interaction) {
        const client = interaction.client;
        const guilds = client.guilds.cache.size;
        const members = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        // Hole die Anzahl der offenen Tickets
        const openTicketsCount = await Ticket.countDocuments({ status: 'open' });

        const statsEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bot Statistiken')
            .addFields(
                { name: 'Anzahl der Server', value: guilds.toString() },
                { name: 'Anzahl der Mitglieder', value: members.toString() },
                { name: 'Offene Tickets', value: openTicketsCount.toString() },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [statsEmbed] });
    },
};
