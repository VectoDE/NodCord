const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'server',
        description: 'Gibt Statistiken über den Server zurück.',
        category: 'Utility',
    },
    async execute(interaction) {
        const guild = interaction.guild;

        // Sammeln von Server-Informationen
        const memberCount = guild.memberCount;
        const serverName = guild.name;
        const serverId = guild.id;
        const createdAt = guild.createdAt.toDateString();
        const region = guild.preferredLocale;

        // Erstellen des Embeds
        const serverInfoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Server Statistiken')
            .addFields(
                { name: 'Server Name', value: serverName },
                { name: 'Server ID', value: serverId },
                { name: 'Mitglieder', value: memberCount.toString() },
                { name: 'Erstellt am', value: createdAt },
                { name: 'Region', value: region }
            )
            .setTimestamp();

        // Senden des Embeds
        await interaction.reply({ embeds: [serverInfoEmbed] });
    },
};
