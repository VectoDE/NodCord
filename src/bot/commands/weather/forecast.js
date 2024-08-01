const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'forecast',
        description: 'Zeigt die Wettervorhersage für die nächsten Tage an.',
        options: [
            {
                type: 3, // STRING type
                name: 'location',
                description: 'Ort für die Wettervorhersage',
                required: true,
            },
        ],
        category: 'Weather',
    },
    async execute(interaction) {
        const location = interaction.options.getString('location');

        // Hier sollte die Logik zur Wettervorhersage implementiert werden

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Wettervorhersage')
            .setDescription(`Die Wettervorhersage für **${location}**:`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
