const { EmbedBuilder } = require('discord.js');
const { TriviaStats } = require('../../../models/triviaModel');

module.exports = {
    data: {
        name: 'triviastats',
        description: 'Zeigt deine Trivia-Statistiken an.',
        category: 'Games',
    },
    async execute(message) {
        try {
            const stats = await TriviaStats.findOne({ userId: message.author.id });

            if (!stats) {
                return message.channel.send('Du hast noch keine Trivia-Fragen beantwortet.');
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Deine Trivia-Statistiken')
                .setDescription(`Richtige Antworten: ${stats.correctAnswers}\nFalsche Antworten: ${stats.incorrectAnswers}\nGesamtfragen: ${stats.totalQuestions}`)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching trivia stats:', error);
            message.channel.send('Ein Fehler ist aufgetreten beim Abrufen deiner Trivia-Statistiken.');
        }
    },
};
