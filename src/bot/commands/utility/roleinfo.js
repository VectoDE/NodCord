const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'roleinfo',
        description: 'Zeigt Informationen über eine Rolle an.',
        options: [
            {
                type: 8, // ROLE type
                name: 'rolle',
                description: 'Die Rolle, über die du Informationen sehen möchtest.',
                required: true,
            },
        ],
        category: 'Utility',
    },
    async execute(interaction) {
        const role = interaction.options.getRole('rolle');

        const embed = new EmbedBuilder()
            .setColor(role.hexColor)
            .setTitle(`Rolleninfo für ${role.name}`)
            .addFields(
                { name: 'Rollenname', value: role.name, inline: true },
                { name: 'Rollen-ID', value: role.id, inline: true },
                { name: 'Farbe', value: role.hexColor, inline: true },
                { name: 'Erstellt am', value: role.createdAt.toDateString(), inline: true },
                { name: 'Mitglieder mit dieser Rolle', value: role.members.size.toString(), inline: true },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};