const { queue } = require('discord-player');

module.exports = {
    data: {
        name: 'stop',
        description: 'Stoppt die Wiedergabe und leert die Warteschlange.',
        category: 'Music',
    },
    async execute(interaction) {
        const player = queue.get(interaction.guild.id);
        if (!player || !player.playing) {
            return interaction.reply({ content: 'Momentan wird keine Musik abgespielt.', ephemeral: true });
        }

        player.stop();
        await interaction.reply({ content: 'Wiedergabe gestoppt und Warteschlange geleert.', ephemeral: true });
    },
};
