const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'slap',
        description: 'Schlägt einen anderen Nutzer.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Nutzer, den du schlagen möchtest',
                required: true,
            },
        ],
        category: 'Social',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');

        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Schlag')
            .setDescription(`Du schlägst ${user.username}. 😡`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
