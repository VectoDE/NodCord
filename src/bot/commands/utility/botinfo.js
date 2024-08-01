const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'botinfo',
        description: 'Gibt Informationen über den Bot und den Server zurück.',
        category: 'Utility',
    },
    async execute(interaction) {
        const botInfoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Bot Informationen')
            .addFields(
                { name: 'Bot Name', value: interaction.client.user.username },
                { name: 'Bot ID', value: interaction.client.user.id },
                { name: 'Server Name', value: interaction.guild.name },
                { name: 'Server ID', value: interaction.guild.id },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [botInfoEmbed] });
    },
};
