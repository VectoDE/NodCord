const { EmbedBuilder } = require('discord.js');
const Warn = require('../../../models/warnModel');

module.exports = {
    data: {
        name: 'warns',
        description: 'Listet alle Warnungen eines Benutzers auf.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Der Benutzer, dessen Warnungen aufgelistet werden sollen.',
                required: true,
            },
        ],
        category: 'Moderation',
    },
    async execute(message, args) {
        const user = message.mentions.users.first();

        if (!user) {
            return message.channel.send('Bitte gib einen Benutzer an.');
        }

        try {
            const warns = await Warn.find({ userId: user.id, guildId: message.guild.id });

            if (warns.length === 0) {
                return message.channel.send('Der Benutzer hat keine Warnungen.');
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Warnungen für ${user.tag}`)
                .setDescription(warns.map(warn => {
                    return `ID: ${warn._id}\nGrund: ${warn.reason}\nModerator: <@${warn.moderatorId}>\nDatum: ${warn.timestamp.toDateString()}`;
                }).join('\n\n'))
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching warnings:', error);
            message.channel.send('Ein Fehler ist aufgetreten beim Abrufen der Warnungen.');
        }
    },
};
