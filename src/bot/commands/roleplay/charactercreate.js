const { EmbedBuilder } = require('discord.js');
const Roleplay = require('../../../models/roleplayModel');

module.exports = {
    data: {
        name: 'charactercreate',
        description: 'Erstellt einen neuen Charakter für das Rollenspiel.',
        options: [
            {
                type: 3, // STRING type
                name: 'character_name',
                description: 'Der Name des Charakters.',
                required: true,
            },
        ],
        category: 'Roleplay',
    },
    async execute(interaction) {
        const characterName = interaction.options.getString('character_name');
        const userId = interaction.user.id;

        const existingCharacter = await Roleplay.findOne({ userId });
        if (existingCharacter) {
            return interaction.reply({ content: 'Du hast bereits einen Charakter erstellt.', ephemeral: true });
        }

        const newCharacter = new Roleplay({ userId, characterName });
        await newCharacter.save();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Charakter erstellt')
            .setDescription(`Dein Charakter ${characterName} wurde erfolgreich erstellt.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
