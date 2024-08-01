const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'highfive',
        description: 'Gibt einem Nutzer ein High-Five.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Nutzer, dem du ein High-Five geben möchtest',
                required: true,
            },
        ],
        category: 'Social',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('High-Five')
            .setDescription(`Du gibst ${user.username} ein High-Five! 🙌`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
