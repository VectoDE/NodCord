const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'guessnumber',
        description: 'Rate eine zufällig ausgewählte Zahl zwischen 1 und 100.',
        category: 'Games',
    },
    async execute(interaction) {
        // Generiere eine Zufallszahl zwischen 1 und 100
        const numberToGuess = Math.floor(Math.random() * 100) + 1;

        // Speichere die Zahl in der Interaktion (bspw. in einer Map oder Datenbank für Mehrspieler)
        // Zum Beispiel:
        // interaction.client.gameData.set(interaction.user.id, numberToGuess);

        const guessEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Rate die Zahl!')
            .setDescription('Ich habe eine Zahl zwischen 1 und 100 ausgewählt. Rate, welche es ist!')
            .setTimestamp();

        await interaction.reply({ embeds: [guessEmbed] });

        // Hier könnte der Bot Logik zur Verarbeitung der Spielergebnisse hinzufügen
    },
};
