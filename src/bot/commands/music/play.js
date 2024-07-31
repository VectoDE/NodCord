const { EmbedBuilder } = require('discord.js');
const { Player } = require('discord-player');

module.exports = {
    data: {
        name: 'play',
        description: 'Spielt ein Lied ab.',
        options: [
            {
                type: 3, // STRING type
                name: 'query',
                description: 'Der Name oder die URL des Liedes.',
                required: true,
            },
        ],
        category: 'Music',
    },
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const player = Player.get(interaction.guild.id);

        if (!player) {
            return interaction.reply({ content: 'Kein Musik-Player gefunden.', ephemeral: true });
        }

        try {
            const track = await player.play(query);
            const playEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Lied hinzugefügt')
                .setDescription(`**${track.title}** wurde zur Warteschlange hinzugefügt.`)
                .setTimestamp();

            await interaction.reply({ embeds: [playEmbed] });
        } catch (error) {
            console.error('Fehler beim Abspielen des Liedes:', error);
            await interaction.reply({ content: 'Fehler beim Abspielen des Liedes.', ephemeral: true });
        }
    },
};
