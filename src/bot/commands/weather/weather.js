const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'weather',
        description: 'Zeigt das aktuelle Wetter an.',
        options: [
            {
                type: 3, // STRING type
                name: 'location',
                description: 'Ort für das Wetter',
                required: true,
            },
        ],
        category: 'Weather',
    },
    async execute(interaction) {
        const location = interaction.options.getString('location');

        // Hier sollte die Logik zum Abrufen des Wetters implementiert werden

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Wetterbericht')
            .setDescription(`Das aktuelle Wetter für **${location}**:`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
