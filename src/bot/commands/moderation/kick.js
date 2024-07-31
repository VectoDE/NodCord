const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { Kick } = require('../../../models/kickModel');

module.exports = {
    data: {
        name: 'kick',
        description: 'Kickt ein Mitglied vom Server.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Das Mitglied, das gekickt werden soll.',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'reason',
                description: 'Der Grund für den Kick.',
                required: false,
            },
        ],
        category: 'Moderation',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({ content: 'Du hast nicht die Berechtigung, Mitglieder zu kicken.', ephemeral: true });
        }

        if (!user) {
            return interaction.reply({ content: 'Benutzer nicht gefunden.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);

        if (member) {
            await member.kick(reason);
            const kickEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Mitglied gekickt')
                .setDescription(`${user.tag} wurde gekickt.`)
                .addFields(
                    { name: 'Grund', value: reason }
                )
                .setTimestamp();
            await interaction.reply({ embeds: [kickEmbed] });

            // Speichern des Kicks in der Datenbank
            await Kick.create({ userId: user.id, reason });
        } else {
            await interaction.reply({ content: 'Der Benutzer ist nicht auf diesem Server.', ephemeral: true });
        }
    },
};
