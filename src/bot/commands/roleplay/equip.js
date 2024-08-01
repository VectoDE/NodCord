const { EmbedBuilder } = require('discord.js');
const Roleplay = require('../../../models/roleplayModel');

module.exports = {
    data: {
        name: 'equip',
        description: 'Rüstet einen Gegenstand aus deinem Inventar aus.',
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

        const item = character.inventory.find(i => i.name === itemName);

        if (!item) {
            return interaction.reply({ content: 'Gegenstand nicht im Inventar gefunden.', ephemeral: true });
        }

        item.equipped = true;
        await character.save();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Gegenstand ausgerüstet')
            .setDescription(`Du hast ${itemName} erfolgreich ausgerüstet.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
