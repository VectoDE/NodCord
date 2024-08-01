const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'hug',
        description: 'Umarmt einen anderen Nutzer.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Nutzer, den du umarmen möchtest',
                required: true,
            },
        ],
        category: 'Social',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Umarmung')
            .setDescription(`Du umarmst ${user.username}. 🤗`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
