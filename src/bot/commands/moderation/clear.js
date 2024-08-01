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
    async execute(message, args) {
        const amount = parseInt(args[0], 10);

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.channel.send('Du hast nicht die Berechtigung, Nachrichten zu löschen.');
        }

        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return message.channel.send('Bitte gib eine Anzahl zwischen 1 und 100 an.');
        }

        try {
            await message.channel.bulkDelete(amount, true);
            await message.channel.send(`Erfolgreich ${amount} Nachrichten gelöscht.`);
        } catch (error) {
            console.error('Fehler beim Löschen der Nachrichten:', error);
            message.channel.send('Ein Fehler ist aufgetreten beim Löschen der Nachrichten.');
        }
    },
};
