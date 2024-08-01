const { EmbedBuilder } = require('discord.js');
const { TriviaQuestion } = require('../../../models/triviaModel');

module.exports = {
    data: {
        name: 'trivia',
        description: 'Startet ein Trivia-Spiel.',
        category: 'Games',
    },
    async execute(message) {
        try {
            const questions = await TriviaQuestion.aggregate([{ $sample: { size: 1 } }]);
            if (questions.length === 0) {
                return message.channel.send('Keine Trivia-Fragen gefunden.');
            }

            const question = questions[0];
            const options = question.options.map((opt, index) => `${index + 1}. ${opt}`).join('\n');

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Trivia-Frage')
                .setDescription(`${question.question}\n\n${options}`)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

            // Store question for the session
            message.client.trivia = { questionId: question._id, correctAnswer: question.correctAnswer };
        } catch (error) {
            console.error('Error fetching trivia question:', error);
            message.channel.send('Ein Fehler ist aufgetreten beim Abrufen der Trivia-Frage.');
        }
    },
};
