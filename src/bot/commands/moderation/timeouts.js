const { EmbedBuilder } = require('discord.js');
const Timeout = require('../../../models/timeoutModel'); // Überprüfe den Pfad und die Exporte

module.exports = {
    data: {
        name: 'timeouts',
        description: 'Listet alle Timeouts auf.',
        category: 'Moderation',
    },
    async execute(interaction) {
        try {
            // Überprüfe, ob das Modell korrekt geladen wurde
            if (!Timeout) {
                console.error('Das Timeout-Modell konnte nicht geladen werden.');
                return interaction.reply({ content: 'Fehler beim Laden des Timeout-Modells.', ephemeral: true });
            }

            // Finde alle Timeouts für die aktuelle Guild
            const timeouts = await Timeout.find({ guildId: interaction.guild.id });

            if (timeouts.length === 0) {
                return interaction.reply({ content: 'Es gibt keine Timeouts.', ephemeral: true });
            }

            // Erstelle das Embed
            const timeoutsEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Timeouts')
                .setDescription(
                    timeouts
                        .map(timeout =>
                            `<@${timeout.userId}> (${timeout.username}) - Dauer: ${timeout.duration / 60000} Minuten - Grund: ${timeout.reason}`
                        )
                        .join('\n')
                )
                .setTimestamp();

            await interaction.reply({ embeds: [timeoutsEmbed] });
        } catch (error) {
            console.error('Fehler beim Abrufen der Timeouts:', error);
            await interaction.reply({ content: 'Es gab einen Fehler beim Abrufen der Timeouts.', ephemeral: true });
        }
    },
};
