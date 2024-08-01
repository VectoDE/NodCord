const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'party',
        description: 'Starte eine virtuelle Party im Chat.',
        category: 'Social',
    },
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#ffcc00')
            .setTitle('Partyzeit!')
            .setDescription('🎉 Lasst uns eine virtuelle Party im Chat starten! 🎉')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
