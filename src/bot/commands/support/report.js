const { EmbedBuilder } = require('discord.js');
const Report = require('../../../models/reportModel');

module.exports = {
    data: {
        name: 'report',
        description: 'Melde ein Mitglied wegen unangemessenen Verhaltens.',
        options: [
            {
                type: 6, // USER type
                name: 'member',
                description: 'Das Mitglied, das du melden möchtest.',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'reason',
                description: 'Der Grund für die Meldung.',
                required: true,
            },
        ],
        category: 'Moderation',
    },
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const reportedUserId = interaction.options.getUser('member').id;
        const reason = interaction.options.getString('reason');

        try {
            const report = new Report({ userId, guildId, reportedUserId, reason });
            await report.save();

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Meldung erhalten')
                .setDescription(`Danke, dass du ${interaction.options.getUser('member').tag} gemeldet hast.`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error saving report:', error);
            await interaction.reply({ content: 'Ein Fehler ist aufgetreten beim Speichern der Meldung.', ephemeral: true });
        }
    },
};
