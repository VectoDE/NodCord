const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'avatar',
        description: 'Zeigt den Avatar eines Benutzers an.',
        options: [
            {
                type: 6, // USER type
                name: 'benutzer',
                description: 'Der Benutzer, dessen Avatar du sehen möchtest.',
                required: true,
            },
        ],
        category: 'Utility',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('benutzer');

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Avatar von ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};