const { EmbedBuilder } = require('discord.js');
const Roleplay = require('../../../models/roleplayModel');

module.exports = {
    data: {
        name: 'useitem',
        description: 'Verwendet einen Gegenstand aus deinem Inventar.',
        options: [
            {
                type: 3, // STRING type
                name: 'item_name',
                description: 'Der Name des Gegenstands.',
                required: true,
            },
        ],
        category: 'Roleplay',
    },
    async execute(interaction) {
        const itemName = interaction.options.getString('item_name');
        const userId = interaction.user.id;
        const character = await Roleplay.findOne({ userId });

        if (!character) {
            return interaction.reply({ content: 'Du hast noch keinen Charakter erstellt.', ephemeral: true });
        }

        const itemIndex = character.inventory.findIndex(i => i.name === itemName);

        if (itemIndex === -1) {
            return interaction.reply({ content: 'Gegenstand nicht im Inventar gefunden.', ephemeral: true });
        }

        character.inventory.splice(itemIndex, 1);
        await character.save();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Gegenstand verwendet')
            .setDescription(`Du hast ${itemName} erfolgreich verwendet.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
