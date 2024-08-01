const { EmbedBuilder } = require('discord.js');
const { TriviaAnswer, TriviaStats } = require('../../../models/triviaModel');

module.exports = {
    data: {
        name: 'triviaanswer',
        description: 'Beantwortet die aktuelle Trivia-Frage.',
        options: [
            {
                type: 3, // STRING type
                name: 'answer',
                description: 'Deine Antwort.',
                required: true,
            },
        ],
        category: 'Games',
    },
    async execute(message, args) {
        const answer = args.join(' ');

        if (!message.client.trivia) {
            return message.channel.send('Es gibt derzeit keine aktive Trivia-Frage.');
        }

        const { questionId, correctAnswer } = message.client.trivia;

        const correct = answer.toLowerCase() === correctAnswer.toLowerCase();
        const triviaAnswer = new TriviaAnswer({
            userId: message.author.id,
            questionId,
            answer,
            correct,
        });

        await triviaAnswer.save();

        let triviaStats = await TriviaStats.findOne({ userId: message.author.id });
        if (!triviaStats) {
            triviaStats = new TriviaStats({ userId: message.author.id });
        }
        triviaStats.totalQuestions += 1;
        if (correct) {
            triviaStats.correctAnswers += 1;
        } else {
            triviaStats.incorrectAnswers += 1;
        }

        await triviaStats.save();

        const embed = new EmbedBuilder()
            .setColor(correct ? '#00ff00' : '#ff0000')
            .setTitle(correct ? 'Richtige Antwort!' : 'Falsche Antwort!')
            .setDescription(`Deine Antwort: ${answer}\nDie richtige Antwort: ${correctAnswer}`)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });

        delete message.client.trivia;
    },
};
