const { EmbedBuilder } = require('discord.js');
const Ticket = require('../../../models/ticketModel');

module.exports = {
    data: {
        name: 'createticket',
        description: 'Erstellt ein Ticket für den Benutzer.',
        category: 'Ticket',
        options: [
            {
                type: 3, // STRING type
                name: 'title',
                description: 'Titel des Tickets',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'description',
                description: 'Beschreibung des Tickets',
                required: false,
            }
        ],
    },
    async execute(interaction) {
        const user = interaction.user;
        const guild = interaction.guild;

        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description') || 'No description provided';

        // Abrufen der Kategorie-ID und des Kanals aus der Datenbank oder den Bot-Settings
        const categoryId = await interaction.client.db.getTicketCategory(guild.id);
        const channelId = await interaction.client.db.getTicketChannel(guild.id);

        if (!categoryId || !channelId) {
            return interaction.reply({ content: 'Bitte konfiguriere zuerst die Ticket-Kategorie und den Ticket-Panel-Kanal.', ephemeral: true });
        }

        // Erstelle einen neuen Ticket-Channel
        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: 'GUILD_TEXT',
            parent: categoryId,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: user.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                },
                {
                    id: 'YOUR_SUPPORT_ROLE_ID', // Ersetze mit deiner Support-Rolle-ID
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                },
            ],
        });

        // Speichere das Ticket in der Datenbank
        await Ticket.create({
            userId: user.id,
            guildId: guild.id,
            title: title,
            description: description,
            channelId: ticketChannel.id
        });

        const ticketEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Ticket erstellt')
            .setDescription(`Dein Ticket wurde erstellt! Du kannst jetzt im <#${ticketChannel.id}> Channel dein Anliegen äußern.`)
            .setTimestamp();

        await interaction.reply({ embeds: [ticketEmbed] });
    },
};
