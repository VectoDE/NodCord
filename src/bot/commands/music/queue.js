const { EmbedBuilder } = require('discord.js');
const { queue } = require('discord-player');

module.exports = {
    data: {
        name: 'queue',
        description: 'Zeigt die Warteschlange der Musik an.',
        category: 'Music',
    },
    async execute(interaction) {
        const player = queue.get(interaction.guild.id);
        if (!player || !player.queue.length) {
            return interaction.reply({ content: 'Die Warteschlange ist leer.', ephemeral: true });
        }

        const queueEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Aktuelle Warteschlange')
            .setDescription(player.queue.map((track, index) => `${index + 1}. ${track.title}`).join('\n'))
            .setTimestamp();

        await interaction.reply({ embeds: [queueEmbed] });
    },
};
