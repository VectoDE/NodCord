const { queue } = require('discord-player');

module.exports = {
    data: {
        name: 'pause',
        description: 'Paust die aktuelle Wiedergabe.',
        category: 'Music',
    },
    async execute(interaction) {
        const player = queue.get(interaction.guild.id);
        if (!player || !player.playing) {
            return interaction.reply({ content: 'Momentan wird keine Musik abgespielt.', ephemeral: true });
        }

        player.pause();
        await interaction.reply({ content: 'Musik pausiert.', ephemeral: true });
    },
};
