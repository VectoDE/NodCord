const { EmbedBuilder } = require('discord.js');
const Mute = require('../../models/muteModel');

module.exports = {
    data: {
        name: 'unmute',
        description: 'Hebt die Stummschaltung eines Benutzers auf.',
        options: [
            {
                type: 6, // USER type
                name: 'user',
                description: 'Der Benutzer, dessen Stummschaltung aufgehoben werden soll',
                required: true,
            },
            {
                type: 3, // STRING type
                name: 'reason',
                description: 'Der Grund für die Aufhebung der Stummschaltung',
                required: false,
            },
        ],
        category: 'Moderation',
    },
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'Dieser Benutzer ist nicht auf dem Server.', ephemeral: true });
        }

        if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
            return interaction.reply({ content: 'Du hast keine Berechtigung, Benutzer stummzuschalten oder die Stummschaltung aufzuheben.', ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole) {
            return interaction.reply({ content: 'Es gibt keine "Muted"-Rolle auf diesem Server.', ephemeral: true });
        }

        if (!member.roles.cache.has(muteRole.id)) {
            return interaction.reply({ content: 'Dieser Benutzer ist nicht stummgeschaltet.', ephemeral: true });
        }

        await member.roles.remove(muteRole, reason);

        // Aktualisiere die Datenbank
        await Mute.findOneAndUpdate(
            { guildId: interaction.guild.id, userId: user.id, unmutedAt: null },
            { unmutedAt: Date.now() },
            { new: true }
        );

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🔊 Benutzer wieder hörbar')
            .setDescription(`**Benutzer:** ${user.tag}\n**Grund:** ${reason}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};