const { EmbedBuilder } = require('discord.js');
const { TriviaQuestion } = require('../../../models/triviaModel');

module.exports = {
    data: {
        name: 'triviaquestion',
        description: 'Fügt eine neue Trivia-Frage hinzu.',
        options: [
            {
                type: 3, // STRING type
                name: 'question',
                description: 'Die Trivia-Frage.',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'options',
                description: 'Die Antwortmöglichkeiten, getrennt durch Kommata.',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'correctanswer',
                description: 'Die richtige Antwort.',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'category',
                description: 'Die Kategorie der Frage.',
                required: true,
            },
        ],
        category: 'Games',
    },
    async execute(message, args) {
        const [question, options, correctAnswer, category] = args.join(' ').split(';');

        const triviaQuestion = new TriviaQuestion({
            question: question.trim(),
            options: options.split(',').map(opt => opt.trim()),
            correctAnswer: correctAnswer.trim(),
            category: category.trim(),
        });

        await triviaQuestion.save();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Trivia-Frage hinzugefügt')
            .setDescription(`Frage: ${question}\nAntworten: ${options}\nRichtige Antwort: ${correctAnswer}\nKategorie: ${category}`)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};
