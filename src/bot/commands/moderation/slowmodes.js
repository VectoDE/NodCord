const { EmbedBuilder } = require('discord.js');
const Slowmode = require('../../../models/slowmodeModel');

module.exports = {
    data: {
        name: 'slowmodes',
        description: 'Listet alle aktiven Slowmodes auf.',
        category: 'Moderation',
    },
    async execute(message) {
        try {
            const slowmodes = await Slowmode.find();

            if (slowmodes.length === 0) {
                return message.channel.send('Es gibt derzeit keine aktiven Slowmodes.');
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Aktive Slowmodes')
                .setDescription(slowmodes.map(slowmode => {
                    return `Kanal: <#${slowmode.channelId}>\nDauer: ${slowmode.duration} Sekunden\nGesetzt von: <@${slowmode.setBy}>\nGesetzt am: ${slowmode.setAt.toDateString()}`;
                }).join('\n\n'))
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching slowmodes:', error);
            message.channel.send('Ein Fehler ist aufgetreten beim Abrufen der aktiven Slowmodes.');
        }
    },
};
