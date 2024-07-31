const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'createticketpanel',
        description: 'Erstellt ein Ticket-Panel mit einem Button.',
        category: 'Ticket',
    },
    async execute(interaction) {
        const channelId = await interaction.client.db.getTicketChannel(interaction.guild.id);

        if (!channelId) {
            return interaction.reply({ content: 'Bitte konfiguriere zuerst den Ticket-Panel-Kanal.', ephemeral: true });
        }

        const ticketEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Support Ticket erstellen')
            .setDescription('Klicke auf den Button unten, um ein neues Ticket zu erstellen.')
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Ticket erstellen')
                    .setStyle(ButtonStyle.Primary),
            );

        const channel = interaction.guild.channels.cache.get(channelId);

        if (channel) {
            await channel.send({
                embeds: [ticketEmbed],
                components: [row],
            });
            await interaction.reply({ content: 'Das Ticket-Panel wurde erstellt.', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Der konfigurierte Ticket-Kanal konnte nicht gefunden werden.', ephemeral: true });
        }
    },
};
