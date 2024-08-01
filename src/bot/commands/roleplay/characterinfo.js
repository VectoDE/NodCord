const { EmbedBuilder } = require('discord.js');
const Roleplay = require('../../../models/roleplayModel');

module.exports = {
    data: {
        name: 'characterinfo',
        description: 'Zeigt Informationen über deinen Charakter an.',
        options: [],
        category: 'Roleplay',
    },
    async execute(interaction) {
        const userId = interaction.user.id;
        const character = await Roleplay.findOne({ userId });

        if (!character) {
            return interaction.reply({ content: 'Du hast noch keinen Charakter erstellt.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Charakterinformationen')
            .addFields(
                { name: 'Name', value: character.characterName },
                { name: 'Level', value: character.characterLevel.toString() },
                { name: 'Erfahrungspunkte', value: character.experiencePoints.toString() },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
