const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'hangman',
        description: 'Starte ein Spiel Hangman.',
        category: 'Games',
    },
    async execute(interaction) {
        const words = ['javascript', 'discord', 'hangman', 'bot'];
        const chosenWord = words[Math.floor(Math.random() * words.length)];
        const maskedWord = chosenWord.replace(/./g, '_');
        const maxAttempts = 6;

        // Speichern des Spiels in der Interaktion (z.B. in einer Map oder Datenbank)
        // Zum Beispiel:
        // interaction.client.hangmanData.set(interaction.user.id, {
        //     word: chosenWord,
        //     maskedWord: maskedWord,
        //     attempts: maxAttempts,
        //     guessedLetters: [],
        // });

        const hangmanEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Hangman')
            .setDescription(`Das Wort ist: ${maskedWord}\nVersuche übrig: ${maxAttempts}`)
            .setTimestamp();

        await interaction.reply({ embeds: [hangmanEmbed] });

        // Hier könnte der Bot Logik zur Verarbeitung von Benutzerzügen hinzufügen
    },
};
