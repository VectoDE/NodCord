const { EmbedBuilder } = require('discord.js');
const Ban = require('../../../models/banModel'); // Überprüfe den Pfad und die Exporte

module.exports = {
    data: {
        name: 'bans',
        description: 'Listet alle gebannten Mitglieder auf.',
        category: 'Moderation',
    },
    async execute(interaction) {
        try {
            // Überprüfe, ob das Modell korrekt geladen wurde
            if (!Ban) {
                console.error('Das Ban-Modell konnte nicht geladen werden.');
                return interaction.reply({ content: 'Fehler beim Laden des Ban-Modells.', ephemeral: true });
            }

            // Finde alle Bans für die aktuelle Guild
            const bans = await Ban.find({ guildId: interaction.guild.id });

            if (bans.length === 0) {
                return interaction.reply({ content: 'Es gibt keine gebannten Mitglieder.', ephemeral: true });
            }

            const bansEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Gebannte Mitglieder')
                .setDescription(bans.map(ban => `<@${ban.userId}> (${ban.username}) - Grund: ${ban.reason}`).join('\n'))
                .setTimestamp();

            await interaction.reply({ embeds: [bansEmbed] });
        } catch (error) {
            console.error('Fehler beim Abrufen der Bans:', error);
            await interaction.reply({ content: 'Es gab einen Fehler beim Abrufen der gebannten Mitglieder.', ephemeral: true });
        }
    },
};
