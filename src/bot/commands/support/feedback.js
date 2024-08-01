const { EmbedBuilder } = require('discord.js');
const Feedback = require('../../../models/feedbackModel');

module.exports = {
    data: {
        name: 'feedback',
        description: 'Sende Feedback über den Server oder den Bot.',
        options: [
            {
                type: 3, // STRING type
                name: 'feedback',
                description: 'Dein Feedback.',
                required: true,
            },
        ],
        category: 'Utility',
    },
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const feedbackText = interaction.options.getString('feedback');

        try {
            const feedback = new Feedback({ userId, guildId, feedbackText: feedbackText });
            await feedback.save();

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Feedback erhalten')
                .setDescription('Danke für dein Feedback!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error saving feedback:', error);
            await interaction.reply({ content: 'Ein Fehler ist aufgetreten beim Speichern deines Feedbacks.', ephemeral: true });
        }
    },
};
