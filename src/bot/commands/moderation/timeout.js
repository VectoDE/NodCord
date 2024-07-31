const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { Timeout } = require('../../../models/timeoutModel');

module.exports = {
    data: {
        name: 'timeout',
        description: 'Setzt ein Timeout für ein Mitglied.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Das Mitglied, das ein Timeout erhalten soll.',
                required: true,
            },
            {
                type: 4, // INTEGER type
                name: 'duration',
                description: 'Dauer des Timeouts in Minuten.',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'reason',
                description: 'Der Grund für das Timeout.',
                required: false,
            },
        ],
        category: 'Moderation',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration') * 60 * 1000; // Minuten in Millisekunden
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'Du hast nicht die Berechtigung, Mitglieder zu timeouten.', ephemeral: true });
        }

        if (!user) {
            return interaction.reply({ content: 'Benutzer nicht gefunden.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);

        if (member) {
            await member.timeout(duration, reason);
            const timeoutEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Timeout gesetzt')
                .setDescription(`${user.tag} hat ein Timeout erhalten.`)
                .addFields(
                    { name: 'Dauer', value: `${duration / 60000} Minuten` },
                    { name: 'Grund', value: reason }
                )
                .setTimestamp();
            await interaction.reply({ embeds: [timeoutEmbed] });

            // Speichern des Timeouts in der Datenbank
            await Timeout.create({ userId: user.id, duration, reason });
        } else {
            await interaction.reply({ content: 'Der Benutzer ist nicht auf diesem Server.', ephemeral: true });
        }
    },
};
