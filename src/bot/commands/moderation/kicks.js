const { EmbedBuilder } = require('discord.js');
const Kick = require('../../../models/kickModel'); // Überprüfe den Pfad und die Exporte

module.exports = {
    data: {
        name: 'kicks',
        description: 'Listet alle Mitglieder auf, die gekickt wurden.',
        category: 'Moderation',
    },
    async execute(interaction) {
        try {
            // Überprüfe, ob das Modell korrekt geladen wurde
            if (!Kick) {
                console.error('Das Kick-Modell konnte nicht geladen werden.');
                return interaction.reply({ content: 'Fehler beim Laden des Kick-Modells.', ephemeral: true });
            }

            // Finde alle Kicks für die aktuelle Guild
            const kicks = await Kick.find({ guildId: interaction.guild.id });

            if (kicks.length === 0) {
                return interaction.reply({ content: 'Es gibt keine gekickten Mitglieder.', ephemeral: true });
            }

            // Erstelle das Embed
            const kicksEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Gekickte Mitglieder')
                .setDescription(kicks.map(kick => `<@${kick.userId}> (${kick.username}) - Grund: ${kick.reason}`).join('\n'))
                .setTimestamp();

            await interaction.reply({ embeds: [kicksEmbed] });
        } catch (error) {
            console.error('Fehler beim Abrufen der Kicks:', error);
            await interaction.reply({ content: 'Es gab einen Fehler beim Abrufen der gekickten Mitglieder.', ephemeral: true });
        }
    },
};
