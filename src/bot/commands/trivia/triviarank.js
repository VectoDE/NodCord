const { EmbedBuilder } = require('discord.js');
const { TriviaStats } = require('../../../models/triviaModel');

module.exports = {
    data: {
        name: 'triviarank',
        description: 'Zeigt die Rangliste der besten Trivia-Spieler an.',
        category: 'Games',
    },
    async execute(message) {
        try {
            const topPlayers = await TriviaStats.find().sort({ correctAnswers: -1, totalQuestions: -1 }).limit(10);

            if (topPlayers.length === 0) {
                return message.channel.send('Keine Trivia-Spieler gefunden.');
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Trivia Rangliste')
                .setDescription(topPlayers.map((player, index) => {
                    return `${index + 1}. <@${player.userId}> - ${player.correctAnswers} richtige Antworten von ${player.totalQuestions} Fragen`;
                }).join('\n'))
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching trivia ranks:', error);
            message.channel.send('Ein Fehler ist aufgetreten beim Abrufen der Trivia-Rangliste.');
        }
    },
};
