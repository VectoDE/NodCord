const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'ban',
  description: 'Banns a user from the server.',
  run: async (client, message, args) => {
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(
        (x) =>
          x.user.username.toLowerCase() ===
          args.slide(0).join(' ' || x.user.username === args[0])
      );

    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.channel.send(
        "You don't have permissions to ban member on this server."
      );
    if (!member) return message.channel.send('You must specify member to ban.');
    if (message.member === member)
      return message.channel.send("You can't ban yourself!");
    if (!member.kickable)
      return message.channel.send("You can't ban this person.");

    let reason = args.slice(1).join(' ') || 'No reason provided.';

    const embed = new EmbedBuilder()
      .setColor('Random')
      .setDescription(
        `**${member.user.tag}** has been banned. \nReason: **${reason}**`
      );

    const dmembed = new EmbedBuilder()
      .setColor('Random')
      .setDescription(
        `You were **banned** from ${message.guild.name}. \nReason: **${reason}**`
      );

    member.send({ embeds: [dmembed] }).catch((err) => {
      console.log('Error');
    });

    member.ban().catch((err) => {
      message.channel.send('There was an error.');
      console.log(err);
    });

    message.channel.send({ embeds: [embed] });
  },
};
