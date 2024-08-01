const { EmbedBuilder } = require('discord.js');
const Mute = require('../../../models/muteModel');

module.exports = {
    data: {
        name: 'mutes',
        description: 'Listet alle stummgeschalteten Benutzer auf.',
        category: 'Moderation',
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
            return interaction.reply({ content: 'Du hast keine Berechtigung, stummgeschaltete Benutzer anzuzeigen.', ephemeral: true });
        }

        const mutes = await Mute.find({ guildId: interaction.guild.id, unmutedAt: null });

        if (mutes.length === 0) {
            return interaction.reply({ content: 'Es gibt derzeit keine stummgeschalteten Benutzer auf diesem Server.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🔇 Stummgeschaltete Benutzer')
            .setDescription('Liste der derzeit stummgeschalteten Benutzer')
            .setTimestamp();

        mutes.forEach(mute => {
            embed.addFields(
                { name: 'Benutzer', value: `<@${mute.userId}>`, inline: true },
                { name: 'Grund', value: mute.reason, inline: true },
                { name: 'Stummgeschaltet seit', value: mute.mutedAt.toLocaleString(), inline: true },
            );
        });

        await interaction.reply({ embeds: [embed] });
    },
};
