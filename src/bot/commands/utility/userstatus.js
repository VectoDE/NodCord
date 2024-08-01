const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'userstatus',
        description: 'Zeigt den Status eines Benutzers an.',
        category: 'Utility',
        usage: '<user>',
    },
    async execute(message, args) {
        // Überprüfen, ob ein Benutzer erwähnt wurde oder eine ID angegeben wurde
        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            return message.reply('Bitte erwähne einen Benutzer oder gib dessen ID an.');
        }

        // Holen des Mitglied-Objekts aus dem Server
        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('Benutzer nicht im Server gefunden.');
        }

        // Status des Benutzers abfragen
        const status = member.presence ? member.presence.status : 'offline';

        // Status-Nachricht vorbereiten
        const statusDescription = status === 'online' ? 'online'
            : status === 'idle' ? 'abwesend'
            : status === 'dnd' ? 'nicht stören'
            : 'offline';

        // Erstelle das Embed
        const statusEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Benutzerstatus')
            .setDescription(`${user.tag} ist aktuell ${statusDescription}.`)
            .setTimestamp();

        // Sende das Embed
        message.channel.send({ embeds: [statusEmbed] });
    }
};
