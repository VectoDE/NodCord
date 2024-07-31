const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'help',
        description: 'Listet alle verfügbaren Befehle auf.',
        category: 'Info',
    },
    async execute(interaction) {
        const commands = interaction.client.commands.map(cmd => `\`${cmd.data.name}\`: ${cmd.data.description}`).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Befehle')
            .setDescription('Hier sind die verfügbaren Befehle:')
            .addField('Kommandos', commands)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};