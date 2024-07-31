const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: {
        name: 'setticketcategory',
        description: 'Setzt die Kategorie-ID für die Tickets.',
        category: 'Ticket',
        options: [
            {
                type: 7, // CHANNEL type
                name: 'category',
                description: 'Die Kategorie, in der die Tickets erstellt werden sollen.',
                required: true,
            }
        ],
    },
    async execute(interaction) {
        const category = interaction.options.getChannel('category');

        if (category.type !== 'GUILD_CATEGORY') {
            return interaction.reply({ content: 'Bitte wähle eine Kategorie!', ephemeral: true });
        }

        // Setze die Kategorie-ID in den Datenbank oder den Bot-Settings
        // Hier wird eine hypothetische Methode `setTicketCategory` verwendet
        await interaction.client.db.setTicketCategory(interaction.guild.id, category.id);

        await interaction.reply({ content: `Die Kategorie für Tickets wurde auf <#${category.id}> gesetzt.`, ephemeral: true });
    },
};
