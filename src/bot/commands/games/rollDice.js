const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'rolldice',
        description: 'Würfelt einen Würfel mit der angegebenen Anzahl an Seiten.',
        options: [
            {
                type: 4, // INTEGER type
                name: 'sides',
                description: 'Anzahl der Seiten des Würfels',
                required: true,
            },
        ],
        category: 'Games',
    },
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides');

        if (sides < 1) {
            return interaction.reply({ content: 'Die Anzahl der Seiten muss mindestens 1 sein.', ephemeral: true });
        }

        const result = Math.floor(Math.random() * sides) + 1;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎲 Würfelergebnis')
            .setDescription(`Der Würfel zeigt: **${result}**`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};