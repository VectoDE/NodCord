const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'unmute',
  description: 'To unmute a user.',
  run: async (client, message, args) => {
    const timeUser =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(
        (x) =>
          x.user.username.toLowerCase() ===
          args.slice(0).join(' ' || x.user.username === args[0])
      );

    if (
      !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)
    )
      return message.channel.send(
        "You don't have permissions to mute member in this server."
      );
    if (!timeUser)
      return message.channel.send('Please spcify a member to unmute.');
    if (message.member === timeUser)
      return message.channel.send("You can't unmute yourself.");

    let reason = args.slice(1).join(' ' || 'No reason provided.');

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setDescription(
        `Successfully unmuted **${timeUser.user.tag}** | ${reason}`
      );

    const dmembed = new EmbedBuilder()
      .setColor('Random')
      .setDescription(
        `You have been **unmuted** in **${message.guild.name}** | ${reason}`
      );

    timeUser.timeout(null, reason);

    message.channel.send({ embeds: [embed] });

    timeUser.send({ embeds: [dmembed] }).catch((err) => {
      return;
    });
  },
};
