const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { Ban } = require('../../../models/banModel');

module.exports = {
    data: {
        name: 'unban',
        description: 'Hebe den Bann eines Mitglieds auf.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Das Mitglied, dessen Bann aufgehoben werden soll.',
                required: true,
            },
        ],
        category: 'Moderation',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'Du hast nicht die Berechtigung, Banns aufzuheben.', ephemeral: true });
        }

        if (!user) {
            return interaction.reply({ content: 'Benutzer nicht gefunden.', ephemeral: true });
        }

        try {
            await interaction.guild.members.unban(user.id);

            const unbanEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Mitglied entbannt')
                .setDescription(`${user.tag} wurde entbannt.`)
                .setTimestamp();

            await interaction.reply({ embeds: [unbanEmbed] });

            // Entfernen des Bans aus der Datenbank
            await Ban.deleteOne({ userId: user.id, guildId: interaction.guild.id });
        } catch (error) {
            console.error('Fehler beim Entbannen des Mitglieds:', error);
            await interaction.reply({ content: 'Es gab einen Fehler beim Entbannen des Mitglieds.', ephemeral: true });
        }
    },
};
