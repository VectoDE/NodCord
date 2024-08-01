const { EmbedBuilder } = require('discord.js');
const Warn = require('../../../models/warnModel');

module.exports = {
    data: {
        name: 'unwarn',
        description: 'Entfernt eine Warnung von einem Benutzer.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Der Benutzer, dessen Warnung entfernt werden soll.',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'warnId',
                description: 'Die ID der Warnung, die entfernt werden soll.',
                required: true,
            },
        ],
        category: 'Moderation',
    },
    async execute(message, args) {
        const user = message.mentions.users.first();
        const warnId = args[1];

        if (!user || !warnId) {
            return message.channel.send('Bitte gib einen Benutzer und eine Warnungs-ID an.');
        }

        try {
            const warn = await Warn.findOneAndDelete({ _id: warnId, userId: user.id, guildId: message.guild.id });

            if (!warn) {
                return message.channel.send('Warnung nicht gefunden.');
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Warnung entfernt')
                .setDescription(`Die Warnung für den Benutzer ${user.tag} wurde entfernt.`)
                .addFields(
                    { name: 'Grund', value: warn.reason },
                    { name: 'Moderator', value: message.author.tag },
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error unwarning user:', error);
            message.channel.send('Ein Fehler ist aufgetreten beim Entfernen der Warnung.');
        }
    },
};
