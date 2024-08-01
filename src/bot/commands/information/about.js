const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'about',
        description: 'Zeigt Informationen über den Bot an.',
        category: 'Information',
    },
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Über diesen Bot')
            .setDescription('Ich bin ein Discord-Bot, der für Spaß und Unterstützung auf deinem Server sorgt. Hier sind einige meiner Funktionen:')
            .addFields(
                { name: 'Wetter', value: 'Zeigt das aktuelle Wetter an.' },
                { name: 'Memes', value: 'Zeigt verschiedene Arten von Memes an.' },
                { name: 'Spiele', value: 'Starte verschiedene Spiele wie Hangman und Trivia.' },
                { name: 'Moderation', value: 'Verwalte deinen Server mit Befehlen wie Bann und Kick.' },
                { name: 'Utility', value: 'Erhalte nützliche Informationen wie Benutzer- und Serverdaten.' }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
