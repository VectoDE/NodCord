const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'userinfo',
        description: 'Zeigt Informationen über einen Benutzer an.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Benutzer, über den du Informationen anzeigen möchtest',
                required: false,
            },
        ],
        category: 'Utility',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Benutzerinformationen')
            .setDescription(`Hier sind die Informationen über **${user.username}**`)
            .addFields(
                { name: 'ID', value: user.id, inline: true },
                { name: 'Username', value: user.username, inline: true },
                { name: 'Tag', value: user.tag, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
