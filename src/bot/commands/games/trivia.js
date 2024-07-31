const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'trivia',
        description: 'Starte ein Trivia-Spiel mit einer Frage.',
        category: 'Games',
    },
    async execute(interaction) {
        const questions = [
            {
                question: 'Was ist die Hauptstadt von Frankreich?',
                options: ['Berlin', 'Madrid', 'Paris', 'London'],
                answer: 'Paris',
            },
            {
                question: 'Welches Element hat das Symbol O?',
                options: ['Gold', 'Silber', 'Sauerstoff', 'Eisen'],
                answer: 'Sauerstoff',
            },
        ];

        const trivia = questions[Math.floor(Math.random() * questions.length)];

        const triviaEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Trivia-Frage')
            .setDescription(trivia.question)
            .addFields(
                { name: 'Antworten', value: trivia.options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n') }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [triviaEmbed] });

        // Hier könnte der Bot Logik zur Verarbeitung der Spielerantworten hinzufügen
    },
};
