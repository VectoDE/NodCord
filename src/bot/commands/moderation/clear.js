const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'clear',
        description: 'Löscht eine bestimmte Anzahl von Nachrichten.',
        options: [
            {
                type: 'INTEGER',
                name: 'amount',
                description: 'Anzahl der zu löschenden Nachrichten.',
                required: true,
            },
        ],
        category: 'Moderation',
    },
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'Du hast nicht die Berechtigung, Nachrichten zu löschen.', ephemeral: true });
        }

        if (amount <= 0 || amount > 100) {
            return interaction.reply({ content: 'Bitte gib eine Anzahl zwischen 1 und 100 an.', ephemeral: true });
        }

        await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ content: `Erfolgreich ${amount} Nachrichten gelöscht.`, ephemeral: true });
    },
};
