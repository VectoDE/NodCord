const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'temperature',
        description: 'Zeigt die Temperatur für einen bestimmten Ort an.',
        options: [
            {
                type: 3, // STRING type
                name: 'location',
                description: 'Ort für die Temperatur',
                required: true,
            },
        ],
        category: 'Weather',
    },
    async execute(interaction) {
        const location = interaction.options.getString('location');

        // Hier sollte die Logik zum Abrufen der Temperatur implementiert werden

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Temperaturbericht')
            .setDescription(`Die aktuelle Temperatur in **${location}** ist:`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
