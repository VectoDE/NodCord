const { EmbedBuilder } = require('discord.js');
const Slowmode = require('../../../models/slowmodeModel');

module.exports = {
    data: {
        name: 'slowmode',
        description: 'Setzt den Slowmode für einen Kanal.',
        options: [
            {
                type: 3, // STRING type
                name: 'duration',
                description: 'Die Dauer des Slowmodes in Sekunden.',
                required: true,
            },
        ],
        category: 'Moderation',
    },
    async execute(message, args) {
        const duration = parseInt(args[0], 10);
        const channel = message.channel;

        if (isNaN(duration) || duration < 0) {
            return message.channel.send('Bitte gib eine gültige Dauer in Sekunden an.');
        }

        try {
            await channel.setRateLimitPerUser(duration);

            const slowmode = new Slowmode({
                channelId: channel.id,
                duration: duration,
                setBy: message.author.id,
            });

            await slowmode.save();

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Slowmode gesetzt')
                .setDescription(`Der Slowmode wurde auf ${duration} Sekunden gesetzt.`)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error setting slowmode:', error);
            message.channel.send('Ein Fehler ist aufgetreten beim Setzen des Slowmodes.');
        }
    },
};
