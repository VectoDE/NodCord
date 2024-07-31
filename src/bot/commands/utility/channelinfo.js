const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'channelinfo',
        description: 'Zeigt Informationen über den Channel an.',
        options: [
            {
                type: 7, // CHANNEL type
                name: 'channel',
                description: 'Channel, über den du Informationen anzeigen möchtest',
                required: false,
            },
        ],
        category: 'Utility',
    },
    async execute(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Channelinformationen')
            .setDescription(`Hier sind die Informationen über **${channel.name}**`)
            .addFields(
                { name: 'Channel-ID', value: channel.id, inline: true },
                { name: 'Typ', value: channel.type, inline: true },
                { name: 'Erstellt am', value: channel.createdAt.toDateString(), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};