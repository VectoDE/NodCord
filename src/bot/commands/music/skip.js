const { queue } = require('discord-player');

module.exports = {
    data: {
        name: 'skip',
        description: 'Überspringt das aktuelle Lied.',
        category: 'Music',
    },
    async execute(interaction) {
        const player = queue.get(interaction.guild.id);
        if (!player || !player.playing) {
            return interaction.reply({ content: 'Momentan wird keine Musik abgespielt.', ephemeral: true });
        }

        player.skip();
        await interaction.reply({ content: 'Aktuelles Lied übersprungen.', ephemeral: true });
    },
};
