const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'ping',
        description: 'Gibt allgemeine Statistiken über den Server und den Bot zurück.',
        category: 'Utility',
    },
    async execute(interaction) {
        const guild = interaction.guild;
        const client = interaction.client;

        // Sammeln von Server- und Bot-Informationen
        const totalChannels = guild.channels.cache.size;
        const totalRoles = guild.roles.cache.size;
        const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
        const totalMembers = guild.memberCount;

        // Erstellen des Embeds
        const statsEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Server und Bot Statistiken')
            .addFields(
                { name: 'Server Name', value: guild.name },
                { name: 'Server ID', value: guild.id },
                { name: 'Gesamtmitglieder', value: totalMembers.toString() },
                { name: 'Online Mitglieder', value: onlineMembers.toString() },
                { name: 'Kanäle', value: totalChannels.toString() },
                { name: 'Rollen', value: totalRoles.toString() },
                { name: 'Bot Name', value: client.user.username },
                { name: 'Bot ID', value: client.user.id },
                { name: 'Bot Version', value: '1.0.0' } // Beispiel-Version, anpassen falls nötig
            )
            .setTimestamp();

        // Senden des Embeds
        await interaction.reply({ embeds: [statsEmbed] });
    },
};
