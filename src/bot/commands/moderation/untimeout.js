const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { Timeout } = require('../../../models/timeoutModel');

module.exports = {
    data: {
        name: 'untimeout',
        description: 'Hebe das Timeout eines Mitglieds auf.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Das Mitglied, dessen Timeout aufgehoben werden soll.',
                required: true,
            },
        ],
        category: 'Moderation',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({ content: 'Du hast nicht die Berechtigung, Timeouts aufzuheben.', ephemeral: true });
        }

        if (!user) {
            return interaction.reply({ content: 'Benutzer nicht gefunden.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);

        if (member) {
            await member.timeout(null); // Timeout aufheben
            const untimeoutEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Timeout aufgehoben')
                .setDescription(`${user.tag} hat sein Timeout zurückbekommen.`)
                .setTimestamp();
            await interaction.reply({ embeds: [untimeoutEmbed] });

            // Entfernen des Timeouts aus der Datenbank
            await Timeout.destroy({ where: { userId: user.id } });
        } else {
            await interaction.reply({ content: 'Der Benutzer ist nicht auf diesem Server.', ephemeral: true });
        }
    },
};
