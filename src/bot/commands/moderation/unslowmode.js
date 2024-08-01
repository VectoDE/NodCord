const { EmbedBuilder } = require('discord.js');
const Slowmode = require('../../../models/slowmodeModel');

module.exports = {
    data: {
        name: 'unslowmode',
        description: 'Entfernt den Slowmode für einen Kanal.',
        category: 'Moderation',
    },
    async execute(message) {
        const channel = message.channel;

        try {
            await channel.setRateLimitPerUser(0);

            await Slowmode.deleteOne({ channelId: channel.id });

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Slowmode entfernt')
                .setDescription('Der Slowmode wurde entfernt.')
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error removing slowmode:', error);
            message.channel.send('Ein Fehler ist aufgetreten beim Entfernen des Slowmodes.');
        }
    },
};
