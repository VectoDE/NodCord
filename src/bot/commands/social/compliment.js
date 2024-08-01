const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'compliment',
        description: 'Gib einem Nutzer ein Kompliment.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Nutzer, dem du ein Kompliment machen möchtest',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'message',
                description: 'Dein Kompliment',
                required: true,
            },
        ],
        category: 'Social',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const message = interaction.options.getString('message');

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('Kompliment')
            .setDescription(`${user.username}, ${message}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
