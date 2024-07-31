const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { Ban } = require('../../../models/banModel');

module.exports = {
    data: {
        name: 'ban',
        description: 'Bann ein Mitglied vom Server.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Das Mitglied, das gebannt werden soll.',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'reason',
                description: 'Der Grund für den Bann.',
                required: false,
            },
        ],
        category: 'Moderation',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'Du hast nicht die Berechtigung, Mitglieder zu bannen.', ephemeral: true });
        }

        if (!user) {
            return interaction.reply({ content: 'Benutzer nicht gefunden.', ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(user.id);

        if (member) {
            await member.ban({ reason });

            const banEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Mitglied gebannt')
                .setDescription(`${user.tag} wurde gebannt.`)
                .addFields(
                    { name: 'Grund', value: reason }
                )
                .setTimestamp();
            await interaction.reply({ embeds: [banEmbed] });

            // Speichern des Bans in der Datenbank
            await Ban.create({
                userId: user.id,
                username: user.tag,
                guildId: interaction.guild.id,
                reason
            });
        } else {
            await interaction.reply({ content: 'Der Benutzer ist nicht auf diesem Server.', ephemeral: true });
        }
    },
};
