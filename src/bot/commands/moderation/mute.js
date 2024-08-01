const { EmbedBuilder } = require('discord.js');
const Mute = require('../../../models/muteModel');

module.exports = {
    data: {
        name: 'mute',
        description: 'Stummschaltet einen Benutzer.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Der Benutzer, der stummgeschaltet werden soll',
                required: true,
            },
            {
                type: 4, // INTEGER type
                name: 'duration',
                description: 'Dauer der Stummschaltung in Minuten',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'reason',
                description: 'Der Grund für die Stummschaltung',
                required: false,
            },
        ],
        category: 'Moderation',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'Dieser Benutzer ist nicht auf dem Server.', ephemeral: true });
        }

        if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
            return interaction.reply({ content: 'Du hast keine Berechtigung, Benutzer stummzuschalten.', ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole) {
            return interaction.reply({ content: 'Es gibt keine "Muted"-Rolle auf diesem Server.', ephemeral: true });
        }

        await member.roles.add(muteRole, reason);

        // Speichere die Stummschaltung in der Datenbank
        const mute = new Mute({
            guildId: interaction.guild.id,
            userId: user.id,
            reason: reason,
            duration: duration,
        });
        await mute.save();

        const embed = new EmbedBuilder()
            .setColor('#808080')
            .setTitle('🔇 Benutzer stummgeschaltet')
            .setDescription(`**Benutzer:** ${user.tag}\n**Dauer:** ${duration} Minuten\n**Grund:** ${reason}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        setTimeout(async () => {
            if (member.roles.cache.has(muteRole.id)) {
                await member.roles.remove(muteRole, 'Stummschaltung beendet');

                // Aktualisiere die Datenbank
                mute.unmutedAt = Date.now();
                await mute.save();

                const unmuteEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🔊 Benutzer wieder hörbar')
                    .setDescription(`**Benutzer:** ${user.tag}\n**Grund:** Stummschaltung beendet`)
                    .setTimestamp();
                await interaction.channel.send({ embeds: [unmuteEmbed] });
            }
        }, duration * 60000);
    },
};
