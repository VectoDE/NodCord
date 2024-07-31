const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'np',
        description: 'Zeigt den aktuellen Song an.',
        category: 'Music',
    },
    async execute(interaction) {
        const queue = interaction.client.queue.get(interaction.guild.id);
        if (!queue) {
            return interaction.reply({ content: 'Es wird gerade nichts gespielt.', ephemeral: true });
        }

        const song = queue.songs[0];

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Jetzt spielt')
            .setDescription(`[${song.title}](${song.url})`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};