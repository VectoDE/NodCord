const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'say',
  description: 'This is the say command!',

  run: async (client, message, args) => {
    const channel = message.mention.channels.first();
    const m = args.slice(1).join(' ');

    const nopermissionsEmbed = new EmbedBuilder()
      .setColor('Red')
      .setDescription("You don't have permission to use this command.");

    const nochannelEmbed = new EmbedBuilder()
      .setColor('Orange')
      .setDescription('Please provide a channel for me to send a message.');

    const nomessageEmbed = new EmbedBuilder()
      .setColor('Yellow')
      .setDescription('Please provide a message for me to say.');

    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
    )
      return message.channel.send({ embeds: [nopermissionsEmbed] });
    if (!channel) return message.channel.send({ embeds: [nochannelEmbed] });
    if (!m) return message.channel.send({ embeds: [nomessageEmbed] });

    channel.send(m);
  },
};
