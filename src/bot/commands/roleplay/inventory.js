const { EmbedBuilder } = require('discord.js');
const Roleplay = require('../../../models/roleplayModel');

module.exports = {
    data: {
        name: 'inventory',
        description: 'Zeigt dein Inventar an.',
        options: [],
        category: 'Roleplay',
    },
    async execute(interaction) {
        const userId = interaction.user.id;
        const character = await Roleplay.findOne({ userId });

        if (!character) {
            return interaction.reply({ content: 'Du hast noch keinen Charakter erstellt.', ephemeral: true });
        }

        const inventory = character.inventory.map(item => `${item.name} ${item.equipped ? '(ausgerüstet)' : ''}`).join('\n') || 'Dein Inventar ist leer.';

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Dein Inventar')
            .setDescription(inventory)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
