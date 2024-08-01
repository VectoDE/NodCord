const { EmbedBuilder } = require('discord.js');
const Warn = require('../../../models/warnModel');

module.exports = {
  data: {
    name: 'warn',
    description: 'Warnt einen Benutzer.',
    options: [
      {
        type: 6, // USER type
        name: 'user',
        description: 'Der Benutzer, der gewarnt werden soll.',
        required: true,
      },
      {
        type: 3, // STRING type
        name: 'reason',
        description: 'Der Grund für die Warnung.',
        required: true,
      },
    ],
    category: 'Moderation',
  },
  async execute(message, args) {
    const user = message.mentions.users.first();
    const reason = args.slice(1).join(' ');

    if (!user || !reason) {
      return message.channel.send('Bitte gib einen Benutzer und einen Grund an.');
    }

    try {
      const warn = new Warn({
        guildId: message.guild.id,
        userId: user.id,
        moderatorId: message.author.id,
        reason: reason,
      });

      await warn.save();

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('Benutzer gewarnt')
        .setDescription(`Der Benutzer ${user.tag} wurde gewarnt.`)
        .addFields(
          { name: 'Grund', value: reason },
          { name: 'Moderator', value: message.author.tag },
        )
        .setTimestamp();

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error warning user:', error);
      message.channel.send('Ein Fehler ist aufgetreten beim Warnen des Benutzers.');
    }
  },
};
